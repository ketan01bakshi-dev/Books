// Shared graph viewer. Loads a book-graph.schema.json or master-graph.schema.json
// document from ?graph=<relative-path>, renders it with vis-network, and expands
// progressively by readingLevel (inspectional-only until a node is clicked).

const TYPE_COLOR = {
  book: "#5fa8ff",
  root: "#5fa8ff",
  theme: "#7fd1ae",
  topic: "#e0c46c",
  concept: "#e08a6c",
  quote: "#c98ce0",
  example: "#8ce0d8",
  vocabulary: "#e0e06c",
};

function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

async function loadGraph(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

function isMasterGraph(doc) {
  return Array.isArray(doc.sourceBooks);
}

// Normalizes either schema into vis-network {nodes, edges}, and keeps
// a lookup of raw node data for the detail panel.
function buildVisData(doc) {
  const raw = {};
  const nodes = [];
  const edges = [];

  if (isMasterGraph(doc)) {
    // Master graphs don't carry their own node list — they reference
    // book-graph nodes by id. Render questions/vocabulary/conflict
    // clusters as synthetic nodes plus cross-edges; book content nodes
    // are expected to already be loaded (see loadMaster()).
    doc.questions.forEach((q) => {
      raw[q.id] = { id: q.id, type: "vocabulary", label: q.prompt, readingLevel: "syntopical", content: q.prompt };
      nodes.push({ id: q.id, label: `❓ ${truncate(q.prompt, 40)}`, color: colorFor("vocabulary"), shape: "box" });
      q.answeringNodeIds.forEach((nid) => edges.push({ from: q.id, to: nid, dashes: true, color: "#5fa8ff", label: "answers" }));
    });
    doc.vocabularyClusters.forEach((vc) => {
      raw[vc.id] = { id: vc.id, type: "vocabulary", label: vc.canonicalTerm, readingLevel: "syntopical", content: vc.definition };
      nodes.push({ id: vc.id, label: `📖 ${vc.canonicalTerm}`, color: colorFor("vocabulary"), shape: "box" });
      vc.termsByBook.forEach((t) => edges.push({ from: vc.id, to: t.nodeId, dashes: true, color: "#e0e06c", label: t.termAsUsed }));
    });
    doc.conflictClusters.forEach((cc) => {
      raw[cc.id] = { id: cc.id, type: "concept", label: cc.topic, readingLevel: "syntopical", content: cc.topic };
      nodes.push({ id: cc.id, label: `⚡ ${truncate(cc.topic, 40)}`, color: "#e05a5a", shape: "box" });
      cc.positions.forEach((p) => edges.push({ from: cc.id, to: p.nodeId, dashes: true, color: "#e05a5a", label: p.stance ? truncate(p.stance, 30) : "" }));
    });
    doc.crossEdges.forEach((e) => edges.push({ from: e.source, to: e.target, dashes: true, color: "#9aa3b0", label: e.label || e.relation }));
    return { raw, nodes, edges, master: true };
  }

  doc.nodes.forEach((n) => {
    raw[n.id] = n;
    nodes.push({
      id: n.id,
      label: n.label,
      color: colorFor(n.type),
      shape: n.type === "book" ? "star" : n.type === "quote" ? "box" : "dot",
      hidden: n.readingLevel === "analytical" || n.readingLevel === "syntopical",
    });
  });
  doc.edges.forEach((e) => {
    edges.push({
      from: e.source,
      to: e.target,
      dashes: e.relation !== "contains",
      color: e.relation === "conflicts_with" ? "#e05a5a" : e.relation === "contains" ? "#4a5060" : "#7a8296",
      label: e.label || (e.relation === "contains" ? "" : e.relation),
      arrows: e.relation === "contains" ? undefined : "to",
    });
  });
  return { raw, nodes, edges, master: false };
}

function colorFor(type) {
  return TYPE_COLOR[type] || "#9aa3b0";
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// For a master-graph.schema.json document, also fetch each sourceBook's
// own graph.json so its nodes exist for the cross-edges to point at.
async function loadMaster(doc, basePath) {
  const bookNodes = {};
  const bookEdges = [];
  for (const bookId of doc.sourceBooks) {
    const bookDoc = await loadGraph(`${basePath}/books/${bookId}/graph.json`);
    bookDoc.nodes.forEach((n) => (bookNodes[n.id] = n));
    bookDoc.edges.forEach((e) => bookEdges.push(e));
  }
  return { bookNodes, bookEdges };
}

async function main() {
  const graphPath = qs("graph");
  const basePath = qs("base") || ".";
  if (!graphPath) {
    document.getElementById("graph").innerHTML = "<p style='color:#e08a6c;padding:24px'>No ?graph= parameter given.</p>";
    return;
  }

  const doc = await loadGraph(graphPath);
  const { raw, nodes, edges, master } = buildVisData(doc);
  document.getElementById("title").textContent = master ? "Master Graph" : doc.book.title;
  document.getElementById("meta").textContent = master
    ? `${doc.sourceBooks.length} book(s) synthesized`
    : `by ${doc.book.author}`;

  if (master) {
    const { bookNodes, bookEdges } = await loadMaster(doc, basePath);
    Object.values(bookNodes).forEach((n) => {
      raw[n.id] = n;
      nodes.push({
        id: n.id,
        label: n.label,
        color: colorFor(n.type),
        shape: n.type === "book" ? "star" : "dot",
        hidden: n.readingLevel !== "elementary" && n.readingLevel !== "inspectional",
      });
    });
    bookEdges.forEach((e) => {
      if (e.relation === "contains") {
        edges.push({ from: e.source, to: e.target, color: "#3a3f4a" });
      }
    });
  }

  const nodesDS = new vis.DataSet(nodes);
  const edgesDS = new vis.DataSet(edges);
  const network = new vis.Network(
    document.getElementById("graph"),
    { nodes: nodesDS, edges: edgesDS },
    {
      nodes: { font: { color: "#e8eaed", size: 14 }, borderWidth: 1 },
      edges: { font: { color: "#9aa3b0", size: 10, strokeWidth: 0 }, smooth: { type: "curvedCW", roundness: 0.15 } },
      physics: { stabilization: true, barnesHut: { gravitationalConstant: -4000, springLength: 120 } },
      interaction: { hover: true, tooltipDelay: 100 },
    }
  );

  // Progressive disclosure: clicking a hidden-children node reveals its
  // direct children (readingLevel analytical/syntopical) instead of
  // showing the whole book graph at once.
  network.on("click", (params) => {
    if (!params.nodes.length) return;
    const id = params.nodes[0];
    const node = raw[id];
    showDetail(node);
    const childIds = edgesDS.get().filter((e) => e.from === id).map((e) => e.to);
    childIds.forEach((cid) => {
      const n = nodesDS.get(cid);
      if (n && n.hidden) nodesDS.update({ id: cid, hidden: false });
    });
  });

  document.getElementById("search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    if (!q) return;
    const match = nodes.find((n) => n.label.toLowerCase().includes(q));
    if (match) {
      nodesDS.update({ id: match.id, hidden: false });
      network.focus(match.id, { scale: 1.2, animation: true });
    }
  });
}

function showDetail(node) {
  const el = document.getElementById("detail");
  el.innerHTML = `
    <span class="close" onclick="document.getElementById('detail').classList.remove('open')">✕</span>
    <div class="type">${node.type}${node.readingLevel ? " · " + node.readingLevel : ""}</div>
    <h2>${node.label}</h2>
    <p>${node.content || ""}</p>
  `;
  el.classList.add("open");
}

main().catch((err) => {
  document.getElementById("graph").innerHTML = `<p style="color:#e05a5a;padding:24px">${err.message}</p>`;
});
