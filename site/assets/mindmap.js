// Deterministic radial-tree mind map, ported from the original hand-built
// concept maps (see mans-search-for-meaning's original knowledge-graph.html):
// branches sit at fixed angles, node sizes are measured from real rendered
// DOM elements (not physics), and columns are spaced by each depth's max
// half-diagonal so labels never overlap. Nodes toggle expand/collapse on
// click instead of a force layout. Generalized here to read any
// book-graph.schema.json or master-graph.schema.json document.

const PALETTE = [
  "#3b6ea5", "#4f9d69", "#c47f2c", "#9457a5", "#c0562f",
  "#2f8f8a", "#a5457a", "#6b7a2f", "#3a5fc4", "#a58a2f",
];

const COL_GAP = 90, ROW_GAP = 16, MARGIN = 90, BRANCH_GAP = 34;

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

function luminance(hex) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16) / 255;
  const g = parseInt(c.substr(2, 2), 16) / 255;
  const b = parseInt(c.substr(4, 2), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function assignColor(node, color) {
  node.color = color;
  node.children.forEach((c) => assignColor(c, color));
}

function kindOf(node, isRoot) {
  if (isRoot) return "hub";
  if (!node.children.length && (node.type === "quote" || node.type === "example" || (node.content && node.content.length))) return "note";
  return "pill";
}

// Builds parent/child links from "contains" edges, then iteratively attaches
// every remaining node ("orphans") to whichever endpoint of ANY other edge
// already has a place in the tree. This matters a lot in practice: a
// concept is often linked to its topic via a semantic relation like
// USES/DESCRIBES/COMPUTES rather than a hierarchy edge, and without this
// fallback those nodes have no parent at all and silently never render —
// in python-pdsa that was 54% of all nodes. Anything still unreachable
// after that (no edge to the rest of the graph whatsoever) is attached
// directly under root as a last resort, so nothing is ever dropped.
// Mutates `usedEdges` with every edge consumed to place a node, so the
// caller can exclude those from the cross-link ("relates_to") overlay.
function attachTree(byId, edges, rootId, usedEdges) {
  const containsEdges = edges.filter((e) => e.relation === "contains");
  containsEdges.forEach((e) => {
    const p = byId[e.source], c = byId[e.target];
    if (p && c) {
      p.children.push(c);
      c.parentId = p.id;
    }
    usedEdges.add(e);
  });

  const placed = new Set([rootId, ...containsEdges.map((e) => e.target)]);
  const nonContains = edges.filter((e) => e.relation !== "contains");
  let orphanIds = Object.keys(byId).filter((id) => !placed.has(id));

  let progress = true;
  while (orphanIds.length && progress) {
    progress = false;
    const stillOrphan = [];
    orphanIds.forEach((oid) => {
      const edge = nonContains.find(
        (e) => !usedEdges.has(e) && ((e.source === oid && placed.has(e.target)) || (e.target === oid && placed.has(e.source)))
      );
      if (edge && byId[edge.source === oid ? edge.target : edge.source]) {
        const parentId = edge.source === oid ? edge.target : edge.source;
        byId[parentId].children.push(byId[oid]);
        byId[oid].parentId = parentId;
        placed.add(oid);
        usedEdges.add(edge);
        progress = true;
        return;
      }
      stillOrphan.push(oid);
    });
    orphanIds = stillOrphan;
  }

  orphanIds.forEach((oid) => {
    byId[rootId].children.push(byId[oid]);
    byId[oid].parentId = rootId;
  });
}

// ---------- build tree from a single book-graph.schema.json document ----------
function buildBookTree(doc) {
  const byId = {};
  doc.nodes.forEach((n) => (byId[n.id] = Object.assign({}, n, { children: [], expanded: false })));
  const root = Object.values(byId).find((n) => n.type === "book");
  const usedEdges = new Set();
  attachTree(byId, doc.edges, root.id, usedEdges);
  root.expanded = true;
  root.children.forEach((b, i) => assignColor(b, PALETTE[i % PALETTE.length]));
  const links = doc.edges
    .filter((e) => !usedEdges.has(e))
    .map((e) => ({ from: e.source, to: e.target, label: e.label || e.relation }));
  return { root, byId, links };
}

// ---------- build a synthesized tree for a master-graph.schema.json document ----------
async function buildMasterTree(doc, basePath) {
  const byId = {};
  const bookBranches = [];
  const links = [];
  for (const bookId of doc.sourceBooks) {
    const bookDoc = await fetch(`${basePath}/books/${bookId}/graph.json`).then((r) => r.json());
    bookDoc.nodes.forEach((n) => (byId[n.id] = Object.assign({}, n, { children: [], expanded: false })));
    const bookRoot = bookDoc.nodes.find((n) => n.type === "book");
    const usedEdges = new Set();
    attachTree(byId, bookDoc.edges, bookRoot.id, usedEdges);
    bookDoc.edges
      .filter((e) => !usedEdges.has(e))
      .forEach((e) => links.push({ from: e.source, to: e.target, label: e.label || e.relation }));
    bookBranches.push(byId[bookRoot.id]);
  }

  const synthChildren = [];
  doc.questions.forEach((q) => {
    const node = { id: q.id, type: "concept", label: `❓ ${q.prompt}`, children: [], expanded: false, content: q.prompt };
    byId[q.id] = node;
    synthChildren.push(node);
  });
  doc.vocabularyClusters.forEach((vc) => {
    const node = { id: vc.id, type: "concept", label: `📖 ${vc.canonicalTerm}`, children: [], expanded: false, content: vc.definition };
    byId[vc.id] = node;
    synthChildren.push(node);
  });
  doc.conflictClusters.forEach((cc) => {
    const node = { id: cc.id, type: "concept", label: `⚡ ${cc.topic}`, children: [], expanded: false, content: cc.topic };
    byId[cc.id] = node;
    synthChildren.push(node);
  });

  const children = bookBranches.slice();
  if (synthChildren.length) {
    const synthesis = { id: "synthesis", type: "theme", label: "Synthesis", children: synthChildren, expanded: false };
    byId["synthesis"] = synthesis;
    children.push(synthesis);
  }

  const root = { id: "master-root", type: "book", label: "Synthesis Across Books", children, expanded: true };
  byId[root.id] = root;
  root.children.forEach((b, i) => assignColor(b, PALETTE[i % PALETTE.length]));

  doc.questions.forEach((q) => q.answeringNodeIds.forEach((nid) => links.push({ from: q.id, to: nid, label: "answers" })));
  doc.vocabularyClusters.forEach((vc) => vc.termsByBook.forEach((t) => links.push({ from: vc.id, to: t.nodeId, label: t.termAsUsed })));
  doc.conflictClusters.forEach((cc) => cc.positions.forEach((p) => links.push({ from: cc.id, to: p.nodeId, label: p.stance ? truncate(p.stance, 30) : "" })));
  doc.crossEdges.forEach((e) => links.push({ from: e.source, to: e.target, label: e.label || e.relation }));

  return { root, byId, links };
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// ---------- renderer ----------
class MindMap {
  constructor(container, root, byId, links) {
    this.container = container;
    this.root = root;
    this.byId = byId;
    this.links = links;
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;

    this.viewport = document.getElementById("viewport");
    this.stage = document.getElementById("stage");
    this.svg = document.getElementById("edges");
    this.nodesLayer = document.getElementById("nodesLayer");
    this.svgNS = "http://www.w3.org/2000/svg";

    this.setupPanZoom();
    this.rebuild();
  }

  createEl(node) {
    const isRoot = node === this.root;
    const kind = kindOf(node, isRoot);
    const el = document.createElement("div");
    el.className = "item";
    el.dataset.id = node.id;

    if (kind === "hub") {
      el.classList.add("hub");
      el.textContent = node.label;
    } else if (kind === "pill") {
      el.classList.add("pill");
      const color = node.color || "#999";
      el.style.background = color;
      el.style.color = luminance(color) > 0.6 ? "#1b2320" : "#fdfdfc";
      el.textContent = node.label;
      if (node.children.length) {
        el.classList.add("has-children", node.expanded ? "expanded" : "collapsed");
      }
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (node.children.length) {
          node.expanded = !node.expanded;
          this.rebuild();
        }
        this.showDetail(node);
      });
    } else {
      el.classList.add("note");
      el.style.setProperty("--note-c", node.color || "#999");
      const text = document.createElement("div");
      text.textContent = node.content || node.label;
      el.appendChild(text);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showDetail(node);
      });
    }
    node.el = el;
    this.nodesLayer.appendChild(el);
  }

  showDetail(node) {
    const el = document.getElementById("detail");
    el.innerHTML = `
      <span class="close">✕</span>
      <div class="type">${node.type || ""}${node.readingLevel ? " · " + node.readingLevel : ""}</div>
      <h2>${node.label}</h2>
      <p>${node.content || ""}</p>
    `;
    el.classList.add("open");
    el.querySelector(".close").addEventListener("click", () => el.classList.remove("open"));
  }

  halfDiag(n) {
    return Math.sqrt(n.w * n.w + n.h * n.h) / 2;
  }

  layoutBranch(branch) {
    const nodes = [];
    let maxLocalDepth = 0;
    (function dfs(node, depth, parent) {
      node.localDepth = depth;
      node.parent = parent;
      node.branchAngle = branch.angle;
      if (depth > maxLocalDepth) maxLocalDepth = depth;
      nodes.push(node);
      const kids = node.expanded ? node.children : [];
      kids.forEach((c) => dfs(c, depth + 1, node));
    })(branch, 0, this.root);

    nodes.forEach((n) => this.createEl(n));
    nodes.forEach((n) => {
      n.w = n.el.offsetWidth;
      n.h = n.el.offsetHeight;
    });

    const maxHalfDiag = [];
    nodes.forEach((n) => (maxHalfDiag[n.localDepth] = Math.max(maxHalfDiag[n.localDepth] || 0, this.halfDiag(n))));
    const colXLocal = [0];
    for (let d = 1; d <= maxLocalDepth; d++) colXLocal[d] = colXLocal[d - 1] + maxHalfDiag[d - 1] + maxHalfDiag[d] + COL_GAP;

    const place = (node, top) => {
      const kids = node.expanded ? node.children : [];
      if (!kids.length) {
        const hd = this.halfDiag(node);
        node.tang = top + hd;
        return hd * 2;
      }
      let cursor = top;
      kids.forEach((c, i) => {
        const h = place(c, cursor);
        cursor += h + (i < kids.length - 1 ? ROW_GAP : 0);
      });
      const span = cursor - top;
      node.tang = top + span / 2;
      return Math.max(this.halfDiag(node) * 2, span);
    };
    const curSpan = place(branch, 0);

    const branchTang = branch.tang;
    nodes.forEach((n) => {
      n.radiusOffset = colXLocal[n.localDepth];
      n.t = n.tang - branchTang;
    });
    return { nodes, curSpan };
  }

  toGlobal(angle, r, t, shiftX, shiftY) {
    return {
      x: shiftX + r * Math.cos(angle) - t * Math.sin(angle),
      y: shiftY + r * Math.sin(angle) + t * Math.cos(angle),
    };
  }

  rebuild() {
    this.nodesLayer.innerHTML = "";
    this.svg.innerHTML = "";

    this.createEl(this.root);
    this.root.w = this.root.el.offsetWidth;
    this.root.h = this.root.el.offsetHeight;
    const hubDiag = Math.sqrt(this.root.w * this.root.w + this.root.h * this.root.h) / 2;

    const n = this.root.children.length;
    this.root.children.forEach((b, i) => (b.angle = -Math.PI / 2 + (i * 2 * Math.PI) / n));

    const branches = this.root.children.map((b) => ({ branch: b, res: this.layoutBranch(b) }));

    let maxPillHalf = 0;
    branches.forEach((bb) => {
      bb.branch.w = bb.branch.el.offsetWidth;
      bb.branch.h = bb.branch.el.offsetHeight;
      maxPillHalf = Math.max(maxPillHalf, this.halfDiag(bb.branch));
    });
    let R0 = hubDiag + maxPillHalf + BRANCH_GAP;
    for (let i = 0; i < n; i++) {
      const a = branches[i], b = branches[(i + 1) % n];
      const dTheta = i === n - 1 ? a.branch.angle + 2 * Math.PI - branches[0].branch.angle : b.branch.angle - a.branch.angle;
      if (dTheta > 0) {
        const need = ((a.res.curSpan + b.res.curSpan) / 2 + BRANCH_GAP) / (2 * Math.sin(dTheta / 2));
        R0 = Math.max(R0, need);
      }
    }

    // The adjacent-branch check above only compares each branch's aggregate
    // span, which can still under-count clearance between deep nodes of
    // non-adjacent branches in an asymmetric tree. Belt-and-suspenders: lay
    // out at that R0, check every pair for actual bounding-box overlap, and
    // if any remain, push everything out a bit further and retry.
    let visible, minX, minY, maxX, maxY;
    for (let attempt = 0; attempt < 25; attempt++) {
      visible = [this.root];
      this.root.r = 0;
      this.root.t = 0;
      this.root.branchAngle = 0;
      branches.forEach((bb) => {
        bb.res.nodes.forEach((nd) => (nd.r = R0 + nd.radiusOffset));
        visible = visible.concat(bb.res.nodes);
      });

      visible.forEach((nd) => {
        const p = this.toGlobal(nd.branchAngle, nd.r, nd.t, 0, 0);
        nd.gx = p.x;
        nd.gy = p.y;
      });

      let overlapFound = false;
      for (let i = 0; i < visible.length && !overlapFound; i++) {
        for (let j = i + 1; j < visible.length; j++) {
          const a = visible[i], b = visible[j];
          if (Math.abs(a.gx - b.gx) < (a.w + b.w) / 2 && Math.abs(a.gy - b.gy) < (a.h + b.h) / 2) {
            overlapFound = true;
            break;
          }
        }
      }
      if (!overlapFound || attempt === 24) break;
      R0 += 60;
    }

    minX = Infinity;
    minY = Infinity;
    maxX = -Infinity;
    maxY = -Infinity;
    visible.forEach((nd) => {
      minX = Math.min(minX, nd.gx - nd.w / 2);
      maxX = Math.max(maxX, nd.gx + nd.w / 2);
      minY = Math.min(minY, nd.gy - nd.h / 2);
      maxY = Math.max(maxY, nd.gy + nd.h / 2);
    });
    const shiftX = MARGIN - minX, shiftY = MARGIN - minY;
    visible.forEach((nd) => {
      nd.x = nd.gx + shiftX;
      nd.y = nd.gy + shiftY;
    });

    const CANVAS_W = maxX - minX + MARGIN * 2;
    const CANVAS_H = maxY - minY + MARGIN * 2;
    this.stage.style.width = CANVAS_W + "px";
    this.stage.style.height = CANVAS_H + "px";
    this.svg.setAttribute("width", CANVAS_W);
    this.svg.setAttribute("height", CANVAS_H);
    this.nodesLayer.style.width = CANVAS_W + "px";
    this.nodesLayer.style.height = CANVAS_H + "px";

    visible.forEach((nd) => {
      nd.el.style.left = nd.x + "px";
      nd.el.style.top = nd.y + "px";
    });

    // solid parent -> child curves
    visible.forEach((nd) => {
      if (!nd.parent) return;
      const p = nd.parent;
      const dr = (nd.r - p.r) * 0.55;
      const localPts = [
        { r: p.r, t: p.t },
        { r: p.r + dr, t: p.t },
        { r: nd.r - dr, t: nd.t },
        { r: nd.r, t: nd.t },
      ];
      const g = localPts.map((pt) => this.toGlobal(nd.branchAngle, pt.r, pt.t, shiftX, shiftY));
      const path = document.createElementNS(this.svgNS, "path");
      path.setAttribute("d", `M ${g[0].x} ${g[0].y} C ${g[1].x} ${g[1].y}, ${g[2].x} ${g[2].y}, ${g[3].x} ${g[3].y}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", nd.color || "#999");
      path.setAttribute("stroke-width", Math.max(1.1, 3.2 - nd.localDepth * 0.5).toFixed(2));
      path.setAttribute("opacity", "0.55");
      this.svg.appendChild(path);
    });

    // dashed cross-links, only when both ends currently visible
    const visibleSet = {};
    visible.forEach((nd) => (visibleSet[nd.id] = true));
    this.links.forEach((l) => {
      if (!visibleSet[l.from] || !visibleSet[l.to]) return;
      const a = this.byId[l.from], b = this.byId[l.to];
      if (!a || !b || !a.x || !b.x) return;
      const x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const bow = Math.min(70, len * 0.28);
      const cx = mx + nx * bow, cy = my + ny * bow;
      const path = document.createElementNS(this.svgNS, "path");
      path.setAttribute("d", `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#8a7a4a");
      path.setAttribute("stroke-width", "1.6");
      path.setAttribute("stroke-dasharray", "1 6");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("opacity", "0.85");
      if (l.label) {
        const title = document.createElementNS(this.svgNS, "title");
        title.textContent = l.label;
        path.appendChild(title);
      }
      this.svg.appendChild(path);
    });

    this.visible = visible;
    this.centerIfFirst();
  }

  centerIfFirst() {
    if (this._centered) return;
    this._centered = true;
    const vw = this.viewport.clientWidth, vh = this.viewport.clientHeight;
    const stageW = parseFloat(this.stage.style.width), stageH = parseFloat(this.stage.style.height);
    this.panX = (vw - stageW) / 2;
    this.panY = (vh - stageH) / 2;
    this.applyTransform();
  }

  applyTransform() {
    this.stage.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
  }

  setupPanZoom() {
    let dragging = false, lastX = 0, lastY = 0;
    this.viewport.addEventListener("mousedown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      this.viewport.classList.add("grabbing");
    });
    window.addEventListener("mouseup", () => {
      dragging = false;
      this.viewport.classList.remove("grabbing");
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      this.panX += e.clientX - lastX;
      this.panY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      this.applyTransform();
    });
    this.viewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        this.zoomBy(delta, e.clientX, e.clientY);
      },
      { passive: false }
    );
    document.getElementById("zoomIn").addEventListener("click", () => this.zoomBy(0.15, innerWidth / 2, innerHeight / 2));
    document.getElementById("zoomOut").addEventListener("click", () => this.zoomBy(-0.15, innerWidth / 2, innerHeight / 2));
    document.getElementById("zoomReset").addEventListener("click", () => {
      this.scale = 1;
      this._centered = false;
      this.centerIfFirst();
    });
  }

  zoomBy(delta, cx, cy) {
    const newScale = Math.min(2.5, Math.max(0.25, this.scale + delta));
    const rect = this.viewport.getBoundingClientRect();
    const px = cx - rect.left, py = cy - rect.top;
    const wx = (px - this.panX) / this.scale, wy = (py - this.panY) / this.scale;
    this.scale = newScale;
    this.panX = px - wx * this.scale;
    this.panY = py - wy * this.scale;
    this.applyTransform();
  }

  expandPath(nodeId) {
    let id = nodeId;
    while (id) {
      const n = this.byId[id];
      if (!n) break;
      n.expanded = true;
      id = n.parentId;
    }
    this.rebuild();
  }

  search(query) {
    const q = query.toLowerCase();
    const match = Object.values(this.byId).find((n) => n.label && n.label.toLowerCase().includes(q));
    if (match) {
      this.expandPath(match.id);
      this.showDetail(match);
    }
  }
}

async function main() {
  const graphPath = qs("graph");
  const basePath = qs("base") || ".";
  if (!graphPath) {
    document.getElementById("nodesLayer").innerHTML = "<p style='padding:24px;color:#c0562f'>No ?graph= parameter given.</p>";
    return;
  }
  const doc = await fetch(graphPath).then((r) => r.json());
  const isMaster = Array.isArray(doc.sourceBooks);
  const { root, byId, links } = isMaster ? await buildMasterTree(doc, basePath) : buildBookTree(doc);

  document.getElementById("title").textContent = isMaster ? "Synthesis Across Books" : doc.book.title;
  document.getElementById("meta").textContent = isMaster ? `${doc.sourceBooks.length} book(s)` : `by ${doc.book.author}`;

  const map = new MindMap(document.getElementById("stage"), root, byId, links);
  window.__mindmap = map; // exposed for debugging / automated checks

  document.getElementById("search").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.value.trim()) map.search(e.target.value.trim());
  });
}

main().catch((err) => {
  document.getElementById("nodesLayer").innerHTML = `<p style="padding:24px;color:#c0562f">${err.message}</p>`;
});
