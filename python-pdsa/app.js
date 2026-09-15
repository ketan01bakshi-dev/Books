(function () {
  const course = window.PDSA_COURSE;
  const canvas = document.getElementById("canvas");
  const panel = document.getElementById("panel");
  const viewButtons = document.querySelectorAll("[data-view]");
  const toolbar = document.getElementById("graph-toolbar");
  const btnToggleFlow = document.getElementById("toggle-flow");
  const btnToggleLinks = document.getElementById("toggle-links");
  const btnResetPhysics = document.getElementById("reset-physics");

  let view = "map";
  let selected = { type: "center" };
  let hoveredLink = null;

  // Graph display settings
  const graphSettings = {
    showFlow: true,
    showCrossLinks: true,
    w: 1100,
    h: 720,
    cx: 550,
    cy: 360,
    radius: 248,
    springK: 0.08,
    damping: 0.78,
  };

  // Support both domains and legacy weeks if any
  const domainList = course.domains || course.weeks || [];

  // Physics simulation state for the domain hub nodes
  const domainNodes = domainList.map((domain, index) => {
    const angleDeg = -90 + index * (360 / Math.max(domainList.length, 1));
    const angleRad = (angleDeg * Math.PI) / 180;
    const targetX = graphSettings.cx + graphSettings.radius * Math.cos(angleRad);
    const targetY = graphSettings.cy + graphSettings.radius * Math.sin(angleRad);
    return {
      id: domain.id,
      domain,
      index: index + 1,
      angleDeg,
      angleRad,
      targetX,
      targetY,
      x: graphSettings.cx + 40 * Math.cos(angleRad), // start close for bloom
      y: graphSettings.cy + 40 * Math.sin(angleRad),
      vx: 0,
      vy: 0,
      isDragging: false,
    };
  });

  // Active topic positions state
  let topicNodes = [];
  let animFrameId = null;
  let isSimActive = true;
  let dragSubject = null; // { type: 'domain'|'topic', data: node, startX, startY, hasMoved }

  function getDomainItems(domain) {
    return domain.topics || domain.lectures || [];
  }

  function hasNotes(topic) {
    return Boolean(topic.notes);
  }

  function domainNoteCount(domain) {
    return getDomainItems(domain).filter(hasNotes).length;
  }

  function totalNotes() {
    return domainList.reduce((n, domain) => n + domainNoteCount(domain), 0);
  }

  function getDomain(id) {
    return domainList.find((domain) => String(domain.id) === String(id));
  }

  function getTopic(domainId, topicId) {
    const domain = getDomain(domainId);
    if (!domain) return null;
    const items = getDomainItems(domain);
    return items.find((t) => String(t.id || t.n) === String(topicId));
  }

  function polar(cx, cy, r, angleDeg) {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isDomainActive(domain) {
    return (
      (selected.type === "domain" || selected.type === "topic") &&
      String(selected.id) === String(domain.id)
    );
  }

  function selectDomain(id) {
    selected = { type: "domain", id };
    rebuildTopicNodes();
    wakePhysics();
    render();
  }

  function selectTopic(domainId, topicId) {
    selected = { type: "topic", id: domainId, topicId };
    rebuildTopicNodes();
    wakePhysics();
    render();
  }

  function selectCenter() {
    selected = { type: "center" };
    topicNodes = [];
    wakePhysics();
    render();
  }

  // Trigger elastic bloom animation
  function bloomNodes() {
    domainNodes.forEach((node) => {
      node.x = graphSettings.cx + 25 * Math.cos(node.angleRad);
      node.y = graphSettings.cy + 25 * Math.sin(node.angleRad);
      node.vx = (Math.random() - 0.5) * 8;
      node.vy = (Math.random() - 0.5) * 8;
    });
    wakePhysics();
  }

  function wakePhysics() {
    isSimActive = true;
    if (!animFrameId && view === "map") {
      animFrameId = requestAnimationFrame(stepPhysics);
    }
  }

  function rebuildTopicNodes() {
    topicNodes = [];
    if (selected.type !== "domain" && selected.type !== "topic") return;

    const domainNode = domainNodes.find((d) => String(d.id) === String(selected.id));
    if (!domainNode) return;

    const domain = domainNode.domain;
    const allTopics = getDomainItems(domain);
    const filledTopics = allTopics.filter(hasNotes);
    const toShow =
      allTopics.length > 5 && filledTopics.length ? filledTopics : allTopics;

    const spread = Math.min(34, 110 / Math.max(toShow.length, 1));
    const inward = domainNode.angleDeg + 180;

    toShow.forEach((topic, topicIndex) => {
      const topicAngle = inward - ((toShow.length - 1) * spread) / 2 + topicIndex * spread;
      const targetPos = polar(domainNode.targetX, domainNode.targetY, 88, topicAngle);
      topicNodes.push({
        domainId: domain.id,
        topic,
        topicKey: topic.id || topic.n,
        angleDeg: topicAngle,
        relRadius: 88,
        x: targetPos.x,
        y: targetPos.y,
        vx: 0,
        vy: 0,
        isDragging: false,
      });
    });
  }

  // Physics animation loop
  function stepPhysics(time) {
    if (view !== "map") {
      animFrameId = null;
      return;
    }

    let maxVelocity = 0;

    // Update domain nodes spring simulation
    domainNodes.forEach((node) => {
      if (!node.isDragging) {
        // Subtle organic float
        const floatOffset = Math.sin((time || 0) * 0.0016 + node.index * 1.3) * 1.5;
        const currentTargetY = node.targetY + floatOffset;

        const fx = (node.targetX - node.x) * graphSettings.springK;
        const fy = (currentTargetY - node.y) * graphSettings.springK;

        node.vx = (node.vx + fx) * graphSettings.damping;
        node.vy = (node.vy + fy) * graphSettings.damping;

        node.x += node.vx;
        node.y += node.vy;

        const speed = Math.abs(node.vx) + Math.abs(node.vy);
        if (speed > maxVelocity) maxVelocity = speed;
      }
    });

    // Update topic satellite nodes spring physics attached to active domain
    if (topicNodes.length > 0) {
      const parentDomain = domainNodes.find((d) => String(d.id) === String(selected.id));
      if (parentDomain) {
        topicNodes.forEach((top) => {
          if (!top.isDragging) {
            const desiredPos = polar(parentDomain.x, parentDomain.y, top.relRadius, top.angleDeg);
            const fx = (desiredPos.x - top.x) * 0.12;
            const fy = (desiredPos.y - top.y) * 0.12;

            top.vx = (top.vx + fx) * 0.75;
            top.vy = (top.vy + fy) * 0.75;

            top.x += top.vx;
            top.y += top.vy;

            const speed = Math.abs(top.vx) + Math.abs(top.vy);
            if (speed > maxVelocity) maxVelocity = speed;
          }
        });
      }
    }

    // Refresh dynamic positions in SVG DOM
    updateMapPositions();

    if (dragSubject || maxVelocity > 0.04) {
      animFrameId = requestAnimationFrame(stepPhysics);
    } else {
      animFrameId = null;
      isSimActive = false;
    }
  }

  // Update SVG DOM elements in real-time during simulation
  function updateMapPositions() {
    const svg = canvas.querySelector("svg.map");
    if (!svg) return;

    const cx = graphSettings.cx;
    const cy = graphSettings.cy;

    // Update primary center-to-domain Bezier curves
    domainNodes.forEach((node) => {
      const pathEl = svg.querySelector(`#tree-edge-${node.id}`);
      const flowEl = svg.querySelector(`#tree-flow-${node.id}`);
      const groupEl = svg.querySelector(`#domain-node-${node.id}`);

      if (groupEl) {
        groupEl.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }

      // Smooth organic cubic Bezier from center to domain
      const angle = Math.atan2(node.y - cy, node.x - cx) * (180 / Math.PI);
      const dist = Math.hypot(node.x - cx, node.y - cy);
      const cp1 = polar(cx, cy, dist * 0.42, angle - 18);
      const cp2 = polar(node.x, node.y, dist * 0.42, angle + 180 + 18);
      const d = `M ${cx} ${cy} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${node.x} ${node.y}`;

      if (pathEl) pathEl.setAttribute("d", d);
      if (flowEl) flowEl.setAttribute("d", d);
    });

    // Update secondary domain-to-topic Bezier curves
    const parentDomain = domainNodes.find((d) => String(d.id) === String(selected.id));
    if (parentDomain) {
      topicNodes.forEach((top) => {
        const key = top.topicKey;
        const pathEl = svg.querySelector(`#topic-edge-${key}`);
        const flowEl = svg.querySelector(`#topic-flow-${key}`);
        const groupEl = svg.querySelector(`#topic-node-${key}`);

        if (groupEl) {
          groupEl.setAttribute("transform", `translate(${top.x}, ${top.y})`);
        }

        const cp1 = polar(parentDomain.x, parentDomain.y, 35, top.angleDeg);
        const cp2 = polar(top.x, top.y, 35, top.angleDeg + 180);
        const d = `M ${parentDomain.x} ${parentDomain.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${top.x} ${top.y}`;

        if (pathEl) pathEl.setAttribute("d", d);
        if (flowEl) flowEl.setAttribute("d", d);
      });
    }

    // Update cross-link arcs
    (course.crossLinks || []).forEach((link, idx) => {
      const linkEl = svg.querySelector(`#cross-link-${idx}`);
      const flowEl = svg.querySelector(`#cross-flow-${idx}`);
      const badgeEl = svg.querySelector(`#cross-badge-${idx}`);
      if (!linkEl) return;

      const sDom = link.source.domainId || link.source.weekId;
      const sTop = link.source.topicId !== undefined ? link.source.topicId : link.source.lectureN;
      const tDom = link.target.domainId || link.target.weekId;
      const tTop = link.target.topicId !== undefined ? link.target.topicId : link.target.lectureN;

      const pos1 = getNodeCoords(sDom, sTop);
      const pos2 = getNodeCoords(tDom, tTop);

      // Calculate arched curve bulging away from center
      const mx = (pos1.x + pos2.x) / 2;
      const my = (pos1.y + pos2.y) / 2;
      const vFromCenter = { x: mx - cx, y: my - cy };
      const distFromCenter = Math.hypot(vFromCenter.x, vFromCenter.y) || 1;
      const normal = { x: vFromCenter.x / distFromCenter, y: vFromCenter.y / distFromCenter };
      const bulge = 52;
      const cpx = mx + normal.x * bulge;
      const cpy = my + normal.y * bulge;

      const d = `M ${pos1.x} ${pos1.y} Q ${cpx} ${cpy} ${pos2.x} ${pos2.y}`;
      linkEl.setAttribute("d", d);
      if (flowEl) flowEl.setAttribute("d", d);

      if (badgeEl) {
        badgeEl.setAttribute("transform", `translate(${cpx}, ${cpy})`);
      }
    });
  }

  // Helper to find exact render position for any topic or domain
  function getNodeCoords(domainId, topicId) {
    if (selected.type === "domain" || selected.type === "topic") {
      if (String(selected.id) === String(domainId) && topicNodes.length > 0) {
        const foundTop = topicNodes.find((t) => String(t.topicKey) === String(topicId));
        if (foundTop) return { x: foundTop.x, y: foundTop.y };
      }
    }
    const foundDomain = domainNodes.find((d) => String(d.id) === String(domainId));
    if (foundDomain) return { x: foundDomain.x, y: foundDomain.y };
    return { x: graphSettings.cx, y: graphSettings.cy };
  }

  // Convert client coordinate into SVG coordinate space
  function getSVGPoint(event, svgElement) {
    const pt = svgElement.createSVGPoint();
    if (event.touches && event.touches.length > 0) {
      pt.x = event.touches[0].clientX;
      pt.y = event.touches[0].clientY;
    } else {
      pt.x = event.clientX;
      pt.y = event.clientY;
    }
    return pt.matrixTransform(svgElement.getScreenCTM().inverse());
  }

  // Render the complete Knowledge Graph Mind Map
  function renderMap() {
    if (toolbar) toolbar.style.display = "flex";

    const w = graphSettings.w;
    const h = graphSettings.h;
    const cx = graphSettings.cx;
    const cy = graphSettings.cy;
    const ns = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "map");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Interactive knowledge graph of topics and domains");

    // Definitions for gradients and glow filters
    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = `
      <radialGradient id="echo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4b36a" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#d4b36a" stop-opacity="0"/>
      </radialGradient>
      <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="node-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#2a2218" flood-opacity="0.14"/>
      </filter>
    `;
    svg.appendChild(defs);

    // Decorative orbital reference rings
    [90, 160, 230].forEach((radius, i) => {
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", cx);
      ring.setAttribute("cy", cy);
      ring.setAttribute("r", radius);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "rgba(176,137,62,0.14)");
      ring.setAttribute("stroke-width", i === 2 ? "1.2" : "0.9");
      svg.appendChild(ring);
    });

    const glow = document.createElementNS(ns, "circle");
    glow.setAttribute("cx", cx);
    glow.setAttribute("cy", cy);
    glow.setAttribute("r", 88);
    glow.setAttribute("fill", "url(#echo)");
    svg.appendChild(glow);

    // Group for primary tree curves
    const treeEdgesGroup = document.createElementNS(ns, "g");
    treeEdgesGroup.setAttribute("class", "tree-edges-layer");

    // Group for animated flow overlays
    const flowLayerGroup = document.createElementNS(ns, "g");
    flowLayerGroup.setAttribute("class", "flow-layer");
    if (!graphSettings.showFlow) flowLayerGroup.setAttribute("display", "none");

    // Group for cross-links
    const crossLinksGroup = document.createElementNS(ns, "g");
    crossLinksGroup.setAttribute("class", "cross-links-layer");
    if (!graphSettings.showCrossLinks) crossLinksGroup.setAttribute("display", "none");

    // Create center-to-domain primary edges
    domainNodes.forEach((node) => {
      const isSelectedDomain = isDomainActive(node.domain);
      let domainOpacity = "0.7";
      let domainStrokeWidth = "1.8";

      if (selected.type !== "center") {
        if (isSelectedDomain) {
          domainOpacity = "1";
          domainStrokeWidth = "2.8";
        } else {
          domainOpacity = "0.14";
        }
      }

      const path = document.createElementNS(ns, "path");
      path.setAttribute("id", `tree-edge-${node.id}`);
      path.setAttribute("class", "tree-edge");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", node.domain.color);
      path.setAttribute("stroke-opacity", domainOpacity);
      path.setAttribute("stroke-width", domainStrokeWidth);
      if (isSelectedDomain) path.setAttribute("filter", "url(#active-glow)");
      treeEdgesGroup.appendChild(path);

      // Data flow pulse overlay
      const flowPath = document.createElementNS(ns, "path");
      flowPath.setAttribute("id", `tree-flow-${node.id}`);
      flowPath.setAttribute("class", "edge-flow");
      flowPath.setAttribute("fill", "none");
      flowPath.setAttribute("stroke", "#ffffff");
      const shouldFlow =
        isSelectedDomain || (selected.type === "center" && domainNoteCount(node.domain) > 0);
      flowPath.setAttribute("stroke-opacity", shouldFlow ? "0.85" : "0");
      flowPath.setAttribute("stroke-width", "2");
      flowLayerGroup.appendChild(flowPath);
    });

    // Create secondary domain-to-topic edges
    if (topicNodes.length > 0) {
      const parentDomain = domainNodes.find((d) => String(d.id) === String(selected.id));
      if (parentDomain) {
        topicNodes.forEach((top) => {
          const key = top.topicKey;
          const chosen = selected.type === "topic" && String(selected.topicId) === String(key);
          const isOther = selected.type === "topic" && !chosen;

          const path = document.createElementNS(ns, "path");
          path.setAttribute("id", `topic-edge-${key}`);
          path.setAttribute("class", "tree-edge");
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", parentDomain.domain.color);
          path.setAttribute("stroke-opacity", chosen ? "1" : isOther ? "0.15" : "0.45");
          path.setAttribute("stroke-width", chosen ? "2.6" : "1.4");
          if (chosen) path.setAttribute("filter", "url(#active-glow)");
          treeEdgesGroup.appendChild(path);

          // Topic data flow pulse
          const flowPath = document.createElementNS(ns, "path");
          flowPath.setAttribute("id", `topic-flow-${key}`);
          flowPath.setAttribute("class", "edge-flow");
          flowPath.setAttribute("fill", "none");
          flowPath.setAttribute("stroke", "#ffffff");
          flowPath.setAttribute("stroke-opacity", chosen || !isOther ? "0.8" : "0");
          flowPath.setAttribute("stroke-width", "2");
          flowLayerGroup.appendChild(flowPath);
        });
      }
    }

    // Create Cross-Links across the graph
    (course.crossLinks || []).forEach((link, idx) => {
      const sDom = String(link.source.domainId || link.source.weekId);
      const sTop = String(link.source.topicId !== undefined ? link.source.topicId : link.source.lectureN);
      const tDom = String(link.target.domainId || link.target.weekId);
      const tTop = String(link.target.topicId !== undefined ? link.target.topicId : link.target.lectureN);

      const isLinkedToSelected =
        (selected.type === "domain" &&
          (sDom === String(selected.id) || tDom === String(selected.id))) ||
        (selected.type === "topic" &&
          ((sDom === String(selected.id) && sTop === String(selected.topicId)) ||
            (tDom === String(selected.id) && tTop === String(selected.topicId))));

      const path = document.createElementNS(ns, "path");
      path.setAttribute("id", `cross-link-${idx}`);
      path.setAttribute("class", `cross-link${isLinkedToSelected ? " active-link" : ""}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", isLinkedToSelected ? "var(--gold)" : "rgba(176,137,62,0.5)");
      path.setAttribute(
        "stroke-opacity",
        isLinkedToSelected ? "1" : selected.type === "center" ? "0.45" : "0.15"
      );
      path.setAttribute("stroke-width", isLinkedToSelected ? "2.2" : "1.2");

      path.addEventListener("click", () => {
        selectTopic(sDom, sTop);
      });
      path.addEventListener("mouseenter", () => {
        path.setAttribute("stroke-opacity", "1");
        path.setAttribute("stroke-width", "2.8");
      });
      path.addEventListener("mouseleave", () => {
        path.setAttribute(
          "stroke-opacity",
          isLinkedToSelected ? "1" : selected.type === "center" ? "0.45" : "0.15"
        );
        path.setAttribute("stroke-width", isLinkedToSelected ? "2.2" : "1.2");
      });

      crossLinksGroup.appendChild(path);

      // Cross link flow
      const flowPath = document.createElementNS(ns, "path");
      flowPath.setAttribute("id", `cross-flow-${idx}`);
      flowPath.setAttribute("class", "edge-flow");
      flowPath.setAttribute("fill", "none");
      flowPath.setAttribute("stroke", "var(--gold-2)");
      flowPath.setAttribute("stroke-opacity", isLinkedToSelected ? "0.85" : "0");
      flowPath.setAttribute("stroke-width", "2");
      flowLayerGroup.appendChild(flowPath);

      // Cross link badge tag at curve crest
      if (isLinkedToSelected || hoveredLink === idx) {
        const badgeG = document.createElementNS(ns, "g");
        badgeG.setAttribute("id", `cross-badge-${idx}`);
        badgeG.setAttribute("class", "cross-badge-wrap");

        const rect = document.createElementNS(ns, "rect");
        rect.setAttribute("x", -50);
        rect.setAttribute("y", -10);
        rect.setAttribute("width", 100);
        rect.setAttribute("height", 20);
        rect.setAttribute("rx", 10);
        rect.setAttribute("fill", "#2a2218");
        badgeG.appendChild(rect);

        const txt = document.createElementNS(ns, "text");
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("y", 4);
        txt.setAttribute("fill", "#fbf6ec");
        txt.setAttribute("font-size", "9");
        txt.setAttribute("font-family", "var(--sans)");
        txt.textContent = link.label;
        badgeG.appendChild(txt);

        crossLinksGroup.appendChild(badgeG);
      }
    });

    svg.appendChild(crossLinksGroup);
    svg.appendChild(treeEdgesGroup);
    svg.appendChild(flowLayerGroup);

    // Group for nodes
    const nodesLayerGroup = document.createElementNS(ns, "g");
    nodesLayerGroup.setAttribute("class", "nodes-layer");

    // Render Topic Satellites
    topicNodes.forEach((top) => {
      const key = top.topicKey;
      const chosen = selected.type === "topic" && String(selected.topicId) === String(key);
      const isOther = selected.type === "topic" && !chosen;
      const filled = hasNotes(top.topic);

      const ch = document.createElementNS(ns, "g");
      ch.setAttribute("id", `topic-node-${key}`);
      ch.setAttribute("class", "node draggable");
      ch.setAttribute("tabindex", "0");
      ch.setAttribute("role", "button");
      ch.setAttribute("aria-label", top.topic.title);
      ch.setAttribute("style", `opacity: ${isOther ? "0.22" : "1"}`);

      attachDragHandlers(ch, top, () => {
        selectTopic(top.domainId, key);
      });

      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", 0);
      dot.setAttribute("cy", 0);
      dot.setAttribute("r", chosen ? "11" : filled ? "8" : "6");
      const parentColor = getDomain(top.domainId).color;
      dot.setAttribute("fill", filled ? parentColor : "#fbf6ec");
      dot.setAttribute("stroke", parentColor);
      dot.setAttribute("stroke-width", chosen ? "3" : "2");
      if (chosen) dot.setAttribute("filter", "url(#active-glow)");
      ch.appendChild(dot);

      const chLabel = document.createElementNS(ns, "text");
      chLabel.setAttribute("x", 0);
      chLabel.setAttribute("y", 22);
      chLabel.setAttribute("text-anchor", "middle");
      chLabel.setAttribute("font-size", "11");
      chLabel.setAttribute("fill", "#5d4f3c");
      chLabel.textContent = filled ? "notes" : "topic";
      ch.appendChild(chLabel);

      nodesLayerGroup.appendChild(ch);
    });

    // Render Domain Hub Nodes
    domainNodes.forEach((node) => {
      const active = isDomainActive(node.domain);
      const isDimmed = selected.type !== "center" && !active;

      const g = document.createElementNS(ns, "g");
      g.setAttribute("id", `domain-node-${node.id}`);
      g.setAttribute("class", "node draggable");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Domain: ${node.domain.title}`);
      g.setAttribute("opacity", isDimmed ? "0.2" : "1");

      attachDragHandlers(g, node, () => {
        selectDomain(node.domain.id);
      });

      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", 0);
      circle.setAttribute("cy", 0);
      circle.setAttribute("r", active ? 46 : 40);
      circle.setAttribute("fill", active ? node.domain.color : "#fbf6ec");
      circle.setAttribute("stroke", node.domain.color);
      circle.setAttribute("stroke-width", domainNoteCount(node.domain) ? "3.2" : "2.2");
      circle.setAttribute("filter", "url(#node-shadow)");
      if (active) circle.setAttribute("filter", "url(#active-glow)");
      g.appendChild(circle);

      const icon = document.createElementNS(ns, "text");
      icon.setAttribute("x", 0);
      icon.setAttribute("y", -4);
      icon.setAttribute("text-anchor", "middle");
      icon.setAttribute("fill", active ? "#fbf6ec" : node.domain.color);
      icon.setAttribute("font-size", "14");
      icon.textContent = "◆";
      g.appendChild(icon);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", 0);
      label.setAttribute("y", 14);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", active ? "#fbf6ec" : "#2a2218");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "500");
      label.textContent = node.domain.short;
      g.appendChild(label);

      nodesLayerGroup.appendChild(g);
    });

    // Central Core Hub (Knowledge Core)
    const core = document.createElementNS(ns, "g");
    core.setAttribute("class", "node");
    core.setAttribute("tabindex", "0");
    core.setAttribute("role", "button");
    core.setAttribute("aria-label", course.title);
    core.setAttribute("transform", `translate(${cx}, ${cy})`);
    core.addEventListener("click", selectCenter);
    core.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCenter();
      }
    });

    const coreCircle = document.createElementNS(ns, "circle");
    coreCircle.setAttribute("cx", 0);
    coreCircle.setAttribute("cy", 0);
    coreCircle.setAttribute("r", "78");
    coreCircle.setAttribute("fill", "#2a2218");
    coreCircle.setAttribute("filter", "url(#node-shadow)");
    core.appendChild(coreCircle);

    const t1 = document.createElementNS(ns, "text");
    t1.setAttribute("x", 0);
    t1.setAttribute("y", -8);
    t1.setAttribute("text-anchor", "middle");
    t1.setAttribute("class", "center-title");
    t1.setAttribute("fill", "#fbf6ec");
    t1.textContent = "Knowledge Map";
    core.appendChild(t1);

    const t2 = document.createElementNS(ns, "text");
    t2.setAttribute("x", 0);
    t2.setAttribute("y", 16);
    t2.setAttribute("text-anchor", "middle");
    t2.setAttribute("class", "center-sub");
    t2.setAttribute("fill", "#d4b36a");
    t2.textContent = `${totalNotes()} topics ready`;
    core.appendChild(t2);

    nodesLayerGroup.appendChild(core);
    svg.appendChild(nodesLayerGroup);

    canvas.innerHTML = "";
    canvas.appendChild(svg);

    // Initial position update
    updateMapPositions();
    wakePhysics();
  }

  // Drag handler utility for spring physics
  function attachDragHandlers(element, nodeState, onClick) {
    let startPoint = null;
    let hasMoved = false;

    function onPointerDown(e) {
      if (e.button && e.button !== 0) return;
      const svg = canvas.querySelector("svg.map");
      if (!svg) return;

      const pt = getSVGPoint(e, svg);
      startPoint = { x: pt.x, y: pt.y };
      hasMoved = false;

      dragSubject = {
        node: nodeState,
        offsetX: pt.x - nodeState.x,
        offsetY: pt.y - nodeState.y,
      };

      nodeState.isDragging = true;
      element.classList.add("dragging");
      wakePhysics();

      window.addEventListener("mousemove", onPointerMove, { passive: false });
      window.addEventListener("mouseup", onPointerUp);
      window.addEventListener("touchmove", onPointerMove, { passive: false });
      window.addEventListener("touchend", onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragSubject || dragSubject.node !== nodeState) return;
      const svg = canvas.querySelector("svg.map");
      if (!svg) return;

      const pt = getSVGPoint(e, svg);
      const dx = pt.x - startPoint.x;
      const dy = pt.y - startPoint.y;
      if (Math.hypot(dx, dy) > 5) {
        hasMoved = true;
      }

      nodeState.x = pt.x - dragSubject.offsetX;
      nodeState.y = pt.y - dragSubject.offsetY;
      nodeState.vx = 0;
      nodeState.vy = 0;

      updateMapPositions();
    }

    function onPointerUp() {
      if (dragSubject && dragSubject.node === nodeState) {
        nodeState.isDragging = false;
        element.classList.remove("dragging");
        dragSubject = null;

        window.removeEventListener("mousemove", onPointerMove);
        window.removeEventListener("mouseup", onPointerUp);
        window.removeEventListener("touchmove", onPointerMove);
        window.removeEventListener("touchend", onPointerUp);

        wakePhysics();

        if (!hasMoved && typeof onClick === "function") {
          onClick();
        }
      }
    }

    element.addEventListener("mousedown", onPointerDown);
    element.addEventListener("touchstart", onPointerDown, { passive: true });
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (typeof onClick === "function") onClick();
      }
    });
  }

  // Linear Trace view
  function renderTrace() {
    if (toolbar) toolbar.style.display = "none";

    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1100 720");
    svg.setAttribute("class", "trace");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "The knowledge domains on the path from problems to base cases");

    svg.innerHTML = `
      <rect x="0" y="0" width="1100" height="720" fill="#f7efde"/>
      <path d="M0 430 C 180 390, 280 470, 420 430 S 700 390, 1100 450 L 1100 720 L 0 720 Z" fill="#d9c7a5" opacity="0.55"/>
      <path d="M0 510 C 220 470, 360 560, 540 520 S 860 470, 1100 540 L 1100 720 L 0 720 Z" fill="#7a9a96" opacity="0.28"/>
      <text x="70" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">COMPLEX PROBLEMS</text>
      <text x="820" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">BASE PRINCIPLES</text>
      <path d="M90 250 C 300 210, 800 210, 1010 250" fill="none" stroke="#b0893e" stroke-width="3"/>
      <path d="M90 250 L 90 430 M1010 250 L 1010 430" stroke="#8a5a3b" stroke-width="8"/>
      <path d="M90 250 L 1010 250" stroke="#5d4f3c" stroke-width="10"/>
      <path d="M90 262 L 1010 262" stroke="#d4b36a" stroke-width="2"/>
    `;

    domainList.forEach((domain, index) => {
      const x = 170 + index * 102;
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Domain: ${domain.short}`);
      const choose = () => selectDomain(domain.id);
      g.addEventListener("click", choose);
      g.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choose();
        }
      });

      const pier = document.createElementNS(ns, "rect");
      pier.setAttribute("x", x - 10);
      pier.setAttribute("y", "250");
      pier.setAttribute("width", "20");
      pier.setAttribute("height", "210");
      pier.setAttribute("rx", "4");
      pier.setAttribute("fill", domain.color);
      g.appendChild(pier);

      const cap = document.createElementNS(ns, "circle");
      cap.setAttribute("cx", x);
      cap.setAttribute("cy", "248");
      cap.setAttribute("r", isDomainActive(domain) ? "16" : domainNoteCount(domain) ? "14" : "12");
      cap.setAttribute("fill", "#fbf6ec");
      cap.setAttribute("stroke", domain.color);
      cap.setAttribute("stroke-width", domainNoteCount(domain) ? "4" : "3");
      g.appendChild(cap);

      const icon = document.createElementNS(ns, "text");
      icon.setAttribute("x", x);
      icon.setAttribute("y", "488");
      icon.setAttribute("text-anchor", "middle");
      icon.setAttribute("fill", domain.color);
      icon.setAttribute("font-size", "14");
      icon.textContent = "◆";
      g.appendChild(icon);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", x);
      label.setAttribute("y", "510");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#2a2218");
      label.setAttribute("font-size", "12");
      label.textContent = domain.short;
      g.appendChild(label);

      svg.appendChild(g);
    });

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  // Outline Journey view
  function renderJourney() {
    if (toolbar) toolbar.style.display = "none";

    const wrap = document.createElement("div");
    wrap.className = "journey visible";
    wrap.innerHTML = domainList
      .map((domain, idx) => {
        const ready = domainNoteCount(domain);
        const count = getDomainItems(domain).length;
        return `
        <article class="p-card" data-id="${domain.id}">
          <div class="p-num" style="font-size: 1.4rem;">◆</div>
          <div>
            <h3>${escapeHtml(domain.title)}</h3>
            <p>${count} topic${count === 1 ? "" : "s"} · ${ready} note card${ready === 1 ? "" : "s"} ready</p>
          </div>
        </article>`;
      })
      .join("");
    wrap.querySelectorAll(".p-card").forEach((card) => {
      card.addEventListener("click", () => selectDomain(card.dataset.id));
    });
    canvas.innerHTML = "";
    canvas.appendChild(wrap);
  }

  // Main render dispatcher
  function render() {
    if (view === "map") {
      renderMap();
    } else if (view === "trace") {
      renderTrace();
    } else if (view === "journey") {
      renderJourney();
    }
    renderPanel();
  }

  function topicButtons(domain) {
    return getDomainItems(domain)
      .map((topic) => {
        const key = topic.id || topic.n;
        const active =
          selected.type === "topic" &&
          String(selected.id) === String(domain.id) &&
          String(selected.topicId) === String(key);
        const ready = hasNotes(topic)
          ? `<span class="ch-ready">${escapeHtml(topic.topic || "Notes ready")}</span>`
          : "";
        return `
          <li>
            <button type="button" class="chapter-btn${active ? " active" : ""}" data-topic="${key}">
              <span class="ch-title">${escapeHtml(topic.title)}</span>
              ${ready}
            </button>
          </li>`;
      })
      .join("");
  }

  function bindTopicButtons(domain) {
    panel.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        selectTopic(domain.id, button.dataset.topic);
      });
    });
  }

  // Find relevant cross-links for a specific topic or domain
  function getConnectedLinks(domainId, topicId) {
    if (!course.crossLinks) return [];
    if (topicId !== undefined) {
      return course.crossLinks.filter((link) => {
        const sDom = String(link.source.domainId || link.source.weekId);
        const sTop = String(link.source.topicId !== undefined ? link.source.topicId : link.source.lectureN);
        const tDom = String(link.target.domainId || link.target.weekId);
        const tTop = String(link.target.topicId !== undefined ? link.target.topicId : link.target.lectureN);
        return (
          (sDom === String(domainId) && sTop === String(topicId)) ||
          (tDom === String(domainId) && tTop === String(topicId))
        );
      });
    }
    return course.crossLinks.filter((link) => {
      const sDom = String(link.source.domainId || link.source.weekId);
      const tDom = String(link.target.domainId || link.target.weekId);
      return sDom === String(domainId) || tDom === String(domainId);
    });
  }

  function renderConnectedLinks(links, currentDomainId, currentTopicId) {
    if (!links || links.length === 0) return "";

    const pills = links
      .map((link) => {
        const sDom = String(link.source.domainId || link.source.weekId);
        const sTop = String(link.source.topicId !== undefined ? link.source.topicId : link.source.lectureN);
        const tDom = String(link.target.domainId || link.target.weekId);
        const tTop = String(link.target.topicId !== undefined ? link.target.topicId : link.target.lectureN);

        const isSource =
          currentTopicId !== undefined
            ? sDom === String(currentDomainId) && sTop === String(currentTopicId)
            : sDom === String(currentDomainId);

        const otherDomainId = isSource ? tDom : sDom;
        const otherTopicId = isSource ? tTop : sTop;

        const targetDomain = getDomain(otherDomainId);
        const targetTopic = getTopic(otherDomainId, otherTopicId);
        const targetTitle = targetTopic ? targetTopic.title : targetDomain ? targetDomain.title : "Topic";
        const domainLabel = targetDomain ? targetDomain.short : "Domain";

        return `
          <button type="button" class="concept-pill" data-link-domain="${otherDomainId}" data-link-topic="${otherTopicId}">
            <span class="pill-label">🔗 ${escapeHtml(link.label)}</span>
            <span class="pill-desc">${escapeHtml(link.concept)}</span>
            <span class="pill-target">${escapeHtml(domainLabel)} · ${escapeHtml(targetTitle)} →</span>
          </button>
        `;
      })
      .join("");

    return `
      <div class="block">
        <h3>Connected Concepts in Graph</h3>
        <div class="concept-links">${pills}</div>
      </div>
    `;
  }

  function bindConnectedLinks() {
    panel.querySelectorAll("[data-link-domain]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const domId = btn.dataset.linkDomain;
        const topId = btn.dataset.linkTopic;
        selectTopic(domId, topId);
      });
    });
  }

  function renderNotes(notes, domainId, topicId) {
    const code = (notes.code || [])
      .map(
        (block) => `
        <p class="code-caption">${escapeHtml(block.title)}</p>
        <pre class="code-block">${escapeHtml(block.source)}</pre>`
      )
      .join("");

    const list = (title, items) =>
      items && items.length
        ? `<div class="block"><h3>${title}</h3><ul>${items
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join("")}</ul></div>`
        : "";

    const interview = (notes.interview || [])
      .map(
        (item) => `
        <details class="qa">
          <summary>${escapeHtml(item.q)}</summary>
          <p>${escapeHtml(item.a)}</p>
        </details>`
      )
      .join("");

    const trace = (notes.trace || []).length
      ? `<div class="block"><h3>Hand trace</h3><ul class="trace-list">${notes.trace
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul></div>`
      : "";

    const connections = renderConnectedLinks(getConnectedLinks(domainId, topicId), domainId, topicId);

    return `
      <p class="idea">${escapeHtml(notes.idea)}</p>
      ${connections}
      ${list("Why it works", notes.why)}
      ${list("Contrast", notes.versus)}
      ${list("What every recursive function needs", notes.mustHave)}
      <div class="block"><h3>Python</h3>${code}</div>
      ${list("Language bits", notes.pythonBits)}
      ${list("Complexity", notes.complexity)}
      ${trace}
      ${notes.terminate ? `<div class="block"><h3>Termination</h3><p class="lead">${escapeHtml(notes.terminate)}</p></div>` : ""}
      ${
        interview
          ? `<div class="block"><h3>Interview questions — tap to reveal</h3>${interview}</div>`
          : ""
      }
      ${list("Pitfalls", notes.pitfalls)}
    `;
  }

  function renderPanel() {
    if (selected.type === "center") {
      panel.innerHTML = `
        <p class="panel-kicker">The Knowledge Map</p>
        <h2>${escapeHtml(course.title)}</h2>
        <p class="lead">${escapeHtml(course.opening.blurb)}</p>
        <div class="badges">
          <span class="badge ready">${totalNotes()} topics ready</span>
          <span class="badge">Knowledge Graph</span>
          <span class="badge">Interactive Physics</span>
        </div>
        <ul class="chapters">
          ${domainList
            .map((domain) => {
              const ready = domainNoteCount(domain);
              return `<li>
                <button type="button" class="chapter-btn" data-domain="${domain.id}">
                  <span class="ch-n">${ready ? "ready · notes" : "domain"}</span>
                  <span class="ch-title">${escapeHtml(domain.title)}</span>
                </button>
              </li>`;
            })
            .join("")}
        </ul>
        <div class="learnings">
          <h3>Evolving Graph Guide</h3>
          <p class="empty">Drag nodes to explore elastic physics. Dashed arcs bridge concepts across domains. Click any domain or topic to focus its learning lineage.</p>
        </div>
      `;
      panel.querySelectorAll("[data-domain]").forEach((button) => {
        button.addEventListener("click", () => selectDomain(button.dataset.domain));
      });
      return;
    }

    const domain = getDomain(selected.id);
    if (selected.type === "domain") {
      const domainConnections = renderConnectedLinks(getConnectedLinks(domain.id), domain.id);
      const count = getDomainItems(domain).length;
      panel.innerHTML = `
        <button type="button" class="back" data-back="center">← Knowledge Map</button>
        <p class="panel-kicker">Knowledge Domain</p>
        <h2>${escapeHtml(domain.title)}</h2>
        <p class="lead">${count} topics in this domain. Open a highlighted topic for the revision flashcard.</p>
        ${domainConnections}
        <ul class="chapters">${topicButtons(domain)}</ul>
        <div class="learnings">
          <h3>Notes in this domain</h3>
          ${
            domainNoteCount(domain)
              ? `<p class="empty">Gold-marked topics have a full revision card.</p>`
              : `<p class="empty">No notes yet. Add them in learnings.md as you learn, and they will fold into this domain.</p>`
          }
        </div>
      `;
      panel.querySelector("[data-back]").addEventListener("click", selectCenter);
      bindTopicButtons(domain);
      bindConnectedLinks();
      return;
    }

    const topic = getTopic(selected.id, selected.topicId);
    panel.innerHTML = `
      <button type="button" class="back" data-back="domain">← ${escapeHtml(domain.short)}</button>
      <p class="panel-kicker">${escapeHtml(domain.title)}</p>
      <h2>${escapeHtml(topic.topic || topic.title)}</h2>
      ${
        topic.notes
          ? `<div class="badges"><span class="badge ready">Interview ready</span><span class="badge">${escapeHtml(topic.title)}</span></div>
             ${renderNotes(topic.notes, domain.id, topic.id || topic.n)}`
          : `<p class="lead">${escapeHtml(topic.title)}</p>
             <div class="learnings"><p class="empty">No notes yet. Capture them in learnings.md under this topic, and they will appear here for revision.</p></div>`
      }
    `;
    panel.querySelector("[data-back]").addEventListener("click", () => selectDomain(domain.id));
    bindConnectedLinks();
  }

  // Toolbar button handlers
  if (btnToggleFlow) {
    btnToggleFlow.addEventListener("click", () => {
      graphSettings.showFlow = !graphSettings.showFlow;
      btnToggleFlow.setAttribute("aria-pressed", String(graphSettings.showFlow));
      const flowLayer = canvas.querySelector(".flow-layer");
      if (flowLayer) {
        flowLayer.setAttribute("display", graphSettings.showFlow ? "" : "none");
      }
    });
  }

  if (btnToggleLinks) {
    btnToggleLinks.addEventListener("click", () => {
      graphSettings.showCrossLinks = !graphSettings.showCrossLinks;
      btnToggleLinks.setAttribute("aria-pressed", String(graphSettings.showCrossLinks));
      const linksLayer = canvas.querySelector(".cross-links-layer");
      if (linksLayer) {
        linksLayer.setAttribute("display", graphSettings.showCrossLinks ? "" : "none");
      }
    });
  }

  if (btnResetPhysics) {
    btnResetPhysics.addEventListener("click", () => {
      bloomNodes();
    });
  }

  // View switchers
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      viewButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      if (view === "map") {
        bloomNodes();
      }
      render();
    });
  });

  // Start with a bloom
  bloomNodes();
  render();
})();
