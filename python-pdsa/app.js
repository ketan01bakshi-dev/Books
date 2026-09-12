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

  // Physics simulation state for the 8 week nodes
  const weekNodes = course.weeks.map((week, index) => {
    const angleDeg = -90 + index * 45;
    const angleRad = (angleDeg * Math.PI) / 180;
    const targetX = graphSettings.cx + graphSettings.radius * Math.cos(angleRad);
    const targetY = graphSettings.cy + graphSettings.radius * Math.sin(angleRad);
    return {
      id: week.id,
      week,
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

  // Active lecture positions state
  let lectureNodes = [];
  let animFrameId = null;
  let isSimActive = true;
  let dragSubject = null; // { type: 'week'|'lecture', data: node, startX, startY, hasMoved }

  function hasNotes(lecture) {
    return Boolean(lecture.notes);
  }

  function weekNoteCount(week) {
    return week.lectures.filter(hasNotes).length;
  }

  function totalNotes() {
    return course.weeks.reduce((n, week) => n + weekNoteCount(week), 0);
  }

  function getWeek(id) {
    return course.weeks.find((week) => week.id === id);
  }

  function getLecture(weekId, lectureN) {
    const week = getWeek(weekId);
    return week ? week.lectures.find((lecture) => lecture.n === lectureN) : null;
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

  function isWeekActive(week) {
    return (
      (selected.type === "week" || selected.type === "lecture") &&
      selected.id === week.id
    );
  }

  function selectWeek(id) {
    selected = { type: "week", id };
    rebuildLectureNodes();
    wakePhysics();
    render();
  }

  function selectLecture(weekId, lectureN) {
    selected = { type: "lecture", id: weekId, lecture: lectureN };
    rebuildLectureNodes();
    wakePhysics();
    render();
  }

  function selectCenter() {
    selected = { type: "center" };
    lectureNodes = [];
    wakePhysics();
    render();
  }

  // Trigger elastic bloom animation
  function bloomNodes() {
    weekNodes.forEach((node) => {
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

  function rebuildLectureNodes() {
    lectureNodes = [];
    if (selected.type !== "week" && selected.type !== "lecture") return;

    const weekNode = weekNodes.find((w) => w.id === selected.id);
    if (!weekNode) return;

    const week = weekNode.week;
    const filledLectures = week.lectures.filter(hasNotes);
    const toShow =
      week.lectures.length > 5 && filledLectures.length ? filledLectures : week.lectures;

    const spread = Math.min(34, 110 / Math.max(toShow.length, 1));
    const inward = weekNode.angleDeg + 180;

    toShow.forEach((lecture, lectureIndex) => {
      const lectureAngle = inward - ((toShow.length - 1) * spread) / 2 + lectureIndex * spread;
      const targetPos = polar(weekNode.targetX, weekNode.targetY, 88, lectureAngle);
      lectureNodes.push({
        weekId: week.id,
        lecture,
        angleDeg: lectureAngle,
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

    // Update week nodes spring simulation
    weekNodes.forEach((node) => {
      if (!node.isDragging) {
        // Subtle organic float
        const floatOffset = Math.sin((time || 0) * 0.0016 + node.id * 1.3) * 1.5;
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

    // Update lecture satellite nodes spring physics attached to active week
    if (lectureNodes.length > 0) {
      const parentWeek = weekNodes.find((w) => w.id === selected.id);
      if (parentWeek) {
        lectureNodes.forEach((lec) => {
          if (!lec.isDragging) {
            const desiredPos = polar(parentWeek.x, parentWeek.y, lec.relRadius, lec.angleDeg);
            const fx = (desiredPos.x - lec.x) * 0.12;
            const fy = (desiredPos.y - lec.y) * 0.12;

            lec.vx = (lec.vx + fx) * 0.75;
            lec.vy = (lec.vy + fy) * 0.75;

            lec.x += lec.vx;
            lec.y += lec.vy;

            const speed = Math.abs(lec.vx) + Math.abs(lec.vy);
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

    // Update primary center-to-week Bezier curves
    weekNodes.forEach((node) => {
      const pathEl = svg.querySelector(`#tree-edge-${node.id}`);
      const flowEl = svg.querySelector(`#tree-flow-${node.id}`);
      const groupEl = svg.querySelector(`#week-node-${node.id}`);

      if (groupEl) {
        groupEl.setAttribute("transform", `translate(${node.x}, ${node.y})`);
      }

      // Smooth organic cubic Bezier from center to week
      const angle = Math.atan2(node.y - cy, node.x - cx) * (180 / Math.PI);
      const dist = Math.hypot(node.x - cx, node.y - cy);
      const cp1 = polar(cx, cy, dist * 0.42, angle - 18);
      const cp2 = polar(node.x, node.y, dist * 0.42, angle + 180 + 18);
      const d = `M ${cx} ${cy} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${node.x} ${node.y}`;

      if (pathEl) pathEl.setAttribute("d", d);
      if (flowEl) flowEl.setAttribute("d", d);
    });

    // Update secondary week-to-lecture Bezier curves
    const parentWeek = weekNodes.find((w) => w.id === selected.id);
    if (parentWeek) {
      lectureNodes.forEach((lec) => {
        const pathEl = svg.querySelector(`#lec-edge-${lec.lecture.n}`);
        const flowEl = svg.querySelector(`#lec-flow-${lec.lecture.n}`);
        const groupEl = svg.querySelector(`#lec-node-${lec.lecture.n}`);

        if (groupEl) {
          groupEl.setAttribute("transform", `translate(${lec.x}, ${lec.y})`);
        }

        const cp1 = polar(parentWeek.x, parentWeek.y, 35, lec.angleDeg);
        const cp2 = polar(lec.x, lec.y, 35, lec.angleDeg + 180);
        const d = `M ${parentWeek.x} ${parentWeek.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${lec.x} ${lec.y}`;

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

      const pos1 = getNodeCoords(link.source.weekId, link.source.lectureN);
      const pos2 = getNodeCoords(link.target.weekId, link.target.lectureN);

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

  // Helper to find exact render position for any lecture or week
  function getNodeCoords(weekId, lectureN) {
    if (selected.type === "week" || selected.type === "lecture") {
      if (selected.id === weekId && lectureNodes.length > 0) {
        const foundLec = lectureNodes.find((l) => l.lecture.n === lectureN);
        if (foundLec) return { x: foundLec.x, y: foundLec.y };
      }
    }
    const foundWeek = weekNodes.find((w) => w.id === weekId);
    if (foundWeek) return { x: foundWeek.x, y: foundWeek.y };
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
    svg.setAttribute("aria-label", "Interactive knowledge graph of the course");

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

    // Create center-to-week primary edges
    weekNodes.forEach((node) => {
      const isSelectedWeek = isWeekActive(node.week);
      let weekOpacity = "0.7";
      let weekStrokeWidth = "1.8";

      if (selected.type !== "center") {
        if (isSelectedWeek) {
          weekOpacity = "1";
          weekStrokeWidth = "2.8";
        } else {
          weekOpacity = "0.14";
        }
      }

      const path = document.createElementNS(ns, "path");
      path.setAttribute("id", `tree-edge-${node.id}`);
      path.setAttribute("class", "tree-edge");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", node.week.color);
      path.setAttribute("stroke-opacity", weekOpacity);
      path.setAttribute("stroke-width", weekStrokeWidth);
      if (isSelectedWeek) path.setAttribute("filter", "url(#active-glow)");
      treeEdgesGroup.appendChild(path);

      // Data flow pulse overlay
      const flowPath = document.createElementNS(ns, "path");
      flowPath.setAttribute("id", `tree-flow-${node.id}`);
      flowPath.setAttribute("class", "edge-flow");
      flowPath.setAttribute("fill", "none");
      flowPath.setAttribute("stroke", "#ffffff");
      const shouldFlow =
        isSelectedWeek || (selected.type === "center" && weekNoteCount(node.week) > 0);
      flowPath.setAttribute("stroke-opacity", shouldFlow ? "0.85" : "0");
      flowPath.setAttribute("stroke-width", "2");
      flowLayerGroup.appendChild(flowPath);
    });

    // Create secondary week-to-lecture edges
    if (lectureNodes.length > 0) {
      const parentWeek = weekNodes.find((w) => w.id === selected.id);
      if (parentWeek) {
        lectureNodes.forEach((lec) => {
          const chosen = selected.type === "lecture" && selected.lecture === lec.lecture.n;
          const isOther = selected.type === "lecture" && !chosen;

          const path = document.createElementNS(ns, "path");
          path.setAttribute("id", `lec-edge-${lec.lecture.n}`);
          path.setAttribute("class", "tree-edge");
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", parentWeek.week.color);
          path.setAttribute("stroke-opacity", chosen ? "1" : isOther ? "0.15" : "0.45");
          path.setAttribute("stroke-width", chosen ? "2.6" : "1.4");
          if (chosen) path.setAttribute("filter", "url(#active-glow)");
          treeEdgesGroup.appendChild(path);

          // Lecture data flow pulse
          const flowPath = document.createElementNS(ns, "path");
          flowPath.setAttribute("id", `lec-flow-${lec.lecture.n}`);
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
      const isLinkedToSelected =
        (selected.type === "week" &&
          (link.source.weekId === selected.id || link.target.weekId === selected.id)) ||
        (selected.type === "lecture" &&
          ((link.source.weekId === selected.id && link.source.lectureN === selected.lecture) ||
            (link.target.weekId === selected.id && link.target.lectureN === selected.lecture)));

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
        selectLecture(link.source.weekId, link.source.lectureN);
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

    // Render Lecture Satellites
    lectureNodes.forEach((lec) => {
      const chosen = selected.type === "lecture" && selected.lecture === lec.lecture.n;
      const isOther = selected.type === "lecture" && !chosen;
      const filled = hasNotes(lec.lecture);

      const ch = document.createElementNS(ns, "g");
      ch.setAttribute("id", `lec-node-${lec.lecture.n}`);
      ch.setAttribute("class", "node draggable");
      ch.setAttribute("tabindex", "0");
      ch.setAttribute("role", "button");
      ch.setAttribute("aria-label", lec.lecture.title);
      ch.setAttribute("style", `opacity: ${isOther ? "0.22" : "1"}`);

      attachDragHandlers(ch, lec, () => {
        selectLecture(lec.weekId, lec.lecture.n);
      });

      const dot = document.createElementNS(ns, "circle");
      dot.setAttribute("cx", 0);
      dot.setAttribute("cy", 0);
      dot.setAttribute("r", chosen ? "11" : filled ? "8" : "6");
      const parentColor = getWeek(lec.weekId).color;
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
      chLabel.textContent = filled ? "notes" : `L${lec.lecture.n}`;
      ch.appendChild(chLabel);

      nodesLayerGroup.appendChild(ch);
    });

    // Render Week Hub Nodes
    weekNodes.forEach((node) => {
      const active = isWeekActive(node.week);
      const isDimmed = selected.type !== "center" && !active;

      const g = document.createElementNS(ns, "g");
      g.setAttribute("id", `week-node-${node.id}`);
      g.setAttribute("class", "node draggable");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Week ${node.week.id}: ${node.week.title}`);
      g.setAttribute("opacity", isDimmed ? "0.2" : "1");

      attachDragHandlers(g, node, () => {
        selectWeek(node.week.id);
      });

      const circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", 0);
      circle.setAttribute("cy", 0);
      circle.setAttribute("r", active ? 46 : 40);
      circle.setAttribute("fill", active ? node.week.color : "#fbf6ec");
      circle.setAttribute("stroke", node.week.color);
      circle.setAttribute("stroke-width", weekNoteCount(node.week) ? "3.2" : "2.2");
      circle.setAttribute("filter", "url(#node-shadow)");
      if (active) circle.setAttribute("filter", "url(#active-glow)");
      g.appendChild(circle);

      const num = document.createElementNS(ns, "text");
      num.setAttribute("x", 0);
      num.setAttribute("y", -6);
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("fill", active ? "#fbf6ec" : node.week.color);
      num.setAttribute("font-size", "11");
      num.setAttribute("letter-spacing", "0.12em");
      num.textContent = `W${String(node.week.id).padStart(2, "0")}`;
      g.appendChild(num);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", 0);
      label.setAttribute("y", 12);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", active ? "#fbf6ec" : "#2a2218");
      label.setAttribute("font-size", "13");
      label.setAttribute("font-weight", "500");
      label.textContent = node.week.short;
      g.appendChild(label);

      nodesLayerGroup.appendChild(g);
    });

    // Central Core Hub (PDSA Python)
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
    t1.textContent = "PDSA Python";
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
    svg.setAttribute("aria-label", "The eight weeks as steps from a hard problem to a base case");

    svg.innerHTML = `
      <rect x="0" y="0" width="1100" height="720" fill="#f7efde"/>
      <path d="M0 430 C 180 390, 280 470, 420 430 S 700 390, 1100 450 L 1100 720 L 0 720 Z" fill="#d9c7a5" opacity="0.55"/>
      <path d="M0 510 C 220 470, 360 560, 540 520 S 860 470, 1100 540 L 1100 720 L 0 720 Z" fill="#7a9a96" opacity="0.28"/>
      <text x="70" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">THE PROBLEM</text>
      <text x="820" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">THE BASE CASE</text>
      <path d="M90 250 C 300 210, 800 210, 1010 250" fill="none" stroke="#b0893e" stroke-width="3"/>
      <path d="M90 250 L 90 430 M1010 250 L 1010 430" stroke="#8a5a3b" stroke-width="8"/>
      <path d="M90 250 L 1010 250" stroke="#5d4f3c" stroke-width="10"/>
      <path d="M90 262 L 1010 262" stroke="#d4b36a" stroke-width="2"/>
    `;

    course.weeks.forEach((week, index) => {
      const x = 170 + index * 102;
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Week ${week.id}: ${week.short}`);
      const choose = () => selectWeek(week.id);
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
      pier.setAttribute("fill", week.color);
      g.appendChild(pier);

      const cap = document.createElementNS(ns, "circle");
      cap.setAttribute("cx", x);
      cap.setAttribute("cy", "248");
      cap.setAttribute("r", isWeekActive(week) ? "16" : weekNoteCount(week) ? "14" : "12");
      cap.setAttribute("fill", "#fbf6ec");
      cap.setAttribute("stroke", week.color);
      cap.setAttribute("stroke-width", weekNoteCount(week) ? "4" : "3");
      g.appendChild(cap);

      const num = document.createElementNS(ns, "text");
      num.setAttribute("x", x);
      num.setAttribute("y", "488");
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("fill", week.color);
      num.setAttribute("font-size", "13");
      num.textContent = String(week.id);
      g.appendChild(num);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", x);
      label.setAttribute("y", "510");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#2a2218");
      label.setAttribute("font-size", "12");
      label.textContent = week.short;
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
    wrap.innerHTML = course.weeks
      .map((week) => {
        const ready = weekNoteCount(week);
        return `
        <article class="p-card" data-id="${week.id}">
          <div class="p-num">${String(week.id).padStart(2, "0")}</div>
          <div>
            <h3>${escapeHtml(week.title)}</h3>
            <p>${week.lectures.length} lectures · ${ready} topic${ready === 1 ? "" : "s"} ready</p>
          </div>
        </article>`;
      })
      .join("");
    wrap.querySelectorAll(".p-card").forEach((card) => {
      card.addEventListener("click", () => selectWeek(Number(card.dataset.id)));
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


  function lectureButtons(week) {
    return week.lectures
      .map((lecture) => {
        const active =
          selected.type === "lecture" &&
          selected.id === week.id &&
          selected.lecture === lecture.n;
        const ready = hasNotes(lecture)
          ? `<span class="ch-ready">${escapeHtml(lecture.topic || "Notes ready")}</span>`
          : "";
        return `
          <li>
            <button type="button" class="chapter-btn${active ? " active" : ""}" data-lecture="${lecture.n}">
              <span class="ch-n">Lecture ${lecture.n}</span>
              <span class="ch-title">${escapeHtml(lecture.title)}</span>
              ${ready}
            </button>
          </li>`;
      })
      .join("");
  }

  function bindLectureButtons(week) {
    panel.querySelectorAll("[data-lecture]").forEach((button) => {
      button.addEventListener("click", () => {
        selectLecture(week.id, Number(button.dataset.lecture));
      });
    });
  }

  // Find relevant cross-links for a specific lecture or week
  function getConnectedLinks(weekId, lectureN) {
    if (!course.crossLinks) return [];
    if (lectureN !== undefined) {
      return course.crossLinks.filter(
        (link) =>
          (link.source.weekId === weekId && link.source.lectureN === lectureN) ||
          (link.target.weekId === weekId && link.target.lectureN === lectureN)
      );
    }
    return course.crossLinks.filter(
      (link) => link.source.weekId === weekId || link.target.weekId === weekId
    );
  }

  function renderConnectedLinks(links, currentWeekId, currentLectureN) {
    if (!links || links.length === 0) return "";

    const pills = links
      .map((link) => {
        const isSource =
          currentLectureN !== undefined
            ? link.source.weekId === currentWeekId && link.source.lectureN === currentLectureN
            : link.source.weekId === currentWeekId;
        const other = isSource ? link.target : link.source;
        const targetWeek = getWeek(other.weekId);
        const targetLecture = getLecture(other.weekId, other.lectureN);
        const targetTitle = targetLecture ? targetLecture.title : targetWeek.title;

        return `
          <button type="button" class="concept-pill" data-link-week="${other.weekId}" data-link-lec="${other.lectureN}">
            <span class="pill-label">🔗 ${escapeHtml(link.label)}</span>
            <span class="pill-desc">${escapeHtml(link.concept)}</span>
            <span class="pill-target">Week ${other.weekId} · L${other.lectureN}: ${escapeHtml(targetTitle)} →</span>
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
    panel.querySelectorAll("[data-link-week]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const weekId = Number(btn.dataset.linkWeek);
        const lecId = Number(btn.dataset.linkLec);
        selectLecture(weekId, lecId);
      });
    });
  }

  function renderNotes(notes, weekId, lectureN) {
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

    const connections = renderConnectedLinks(getConnectedLinks(weekId, lectureN), weekId, lectureN);

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
        <p class="panel-kicker">The map</p>
        <h2>${escapeHtml(course.title)}</h2>
        <p class="lead">${escapeHtml(course.opening.blurb)}</p>
        <div class="badges">
          <span class="badge ready">${totalNotes()} topics ready</span>
          <span class="badge">Knowledge Graph</span>
          <span class="badge">Interactive Physics</span>
        </div>
        <ul class="chapters">
          ${course.weeks
            .map((week) => {
              const ready = weekNoteCount(week);
              return `<li>
                <button type="button" class="chapter-btn" data-week="${week.id}">
                  <span class="ch-n">Week ${week.id}${ready ? " · notes" : ""}</span>
                  <span class="ch-title">${escapeHtml(week.title)}</span>
                </button>
              </li>`;
            })
            .join("")}
        </ul>
        <div class="learnings">
          <h3>Knowledge Graph Guide</h3>
          <p class="empty">Drag nodes to explore elastic physics. Dashed arcs bridge concepts across weeks. Click any node to focus its learning lineage.</p>
        </div>
      `;
      panel.querySelectorAll("[data-week]").forEach((button) => {
        button.addEventListener("click", () => selectWeek(Number(button.dataset.week)));
      });
      return;
    }

    const week = getWeek(selected.id);
    if (selected.type === "week") {
      const weekConnections = renderConnectedLinks(getConnectedLinks(week.id), week.id);
      panel.innerHTML = `
        <button type="button" class="back" data-back="center">← Course</button>
        <p class="panel-kicker">Week ${String(week.id).padStart(2, "0")}</p>
        <h2>${escapeHtml(week.title)}</h2>
        <p class="lead">${week.lectures.length} lectures in this span. Open a filled lecture for the interview sheet.</p>
        ${weekConnections}
        <ul class="chapters">${lectureButtons(week)}</ul>
        <div class="learnings">
          <h3>Notes in this week</h3>
          ${
            weekNoteCount(week)
              ? `<p class="empty">Gold-marked lectures below have a full revision card.</p>`
              : `<p class="empty">No notes yet. Add them in learnings.md as you watch, and they will fold into this week.</p>`
          }
        </div>
      `;
      panel.querySelector("[data-back]").addEventListener("click", selectCenter);
      bindLectureButtons(week);
      bindConnectedLinks();
      return;
    }

    const lecture = getLecture(selected.id, selected.lecture);
    panel.innerHTML = `
      <button type="button" class="back" data-back="week">← Week ${week.id}</button>
      <p class="panel-kicker">Week ${week.id} · Lecture ${lecture.n}</p>
      <h2>${escapeHtml(lecture.topic || lecture.title)}</h2>
      ${
        lecture.notes
          ? `<div class="badges"><span class="badge ready">Interview ready</span><span class="badge">${escapeHtml(lecture.title)}</span></div>
             ${renderNotes(lecture.notes, week.id, lecture.n)}`
          : `<p class="lead">${escapeHtml(lecture.title)}</p>
             <div class="learnings"><p class="empty">No notes yet. Capture them in learnings.md under this lecture, and they will appear here for revision.</p></div>`
      }
    `;
    panel.querySelector("[data-back]").addEventListener("click", () => selectWeek(week.id));
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
