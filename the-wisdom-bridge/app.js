(function () {
  const book = window.WISDOM_BRIDGE;
  const canvas = document.getElementById("canvas");
  const panel = document.getElementById("panel");
  const viewButtons = document.querySelectorAll("[data-view]");

  let view = "map";
  let selected = { type: "center" };

  function learningCount(principle) {
    return (
      principle.learnings.length +
      principle.chapters.reduce((n, ch) => n + ch.learnings.length, 0)
    );
  }

  function allLearnings(principle) {
    return [
      ...principle.learnings,
      ...principle.chapters.flatMap((ch) =>
        ch.learnings.map((item) => ({ ...item, chapter: ch.n }))
      ),
    ];
  }

  function polar(cx, cy, r, angle) {
    const a = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function render() {
    if (view === "map") renderMap();
    else if (view === "bridge") renderBridge();
    else renderJourney();
    renderPanel();
  }

  function renderMap() {
    const w = 1100;
    const h = 720;
    const cx = 550;
    const cy = 360;
    const r = 248;
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.setAttribute("class", "map");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Mind map of the nine principles");

    const defs = document.createElementNS(ns, "defs");
    defs.innerHTML = `
      <radialGradient id="echo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4b36a" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#d4b36a" stop-opacity="0"/>
      </radialGradient>
    `;
    svg.appendChild(defs);

    [90, 160, 230].forEach((radius, i) => {
      const ring = document.createElementNS(ns, "circle");
      ring.setAttribute("cx", cx);
      ring.setAttribute("cy", cy);
      ring.setAttribute("r", radius);
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", "rgba(176,137,62,0.18)");
      ring.setAttribute("stroke-width", i === 2 ? "1.25" : "1");
      svg.appendChild(ring);
    });

    const glow = document.createElementNS(ns, "circle");
    glow.setAttribute("cx", cx);
    glow.setAttribute("cy", cy);
    glow.setAttribute("r", 86);
    glow.setAttribute("fill", "url(#echo)");
    svg.appendChild(glow);

    book.principles.forEach((principle, index) => {
      const angle = -90 + index * 40;
      const pos = polar(cx, cy, r, angle);
      const path = document.createElementNS(ns, "path");
      const mid = polar(cx, cy, r * 0.55, angle + (index % 2 === 0 ? 8 : -8));
      path.setAttribute("d", `M ${cx} ${cy} Q ${mid.x} ${mid.y} ${pos.x} ${pos.y}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", principle.color);
      path.setAttribute("stroke-opacity", selected.type === "principle" && selected.id !== principle.id ? "0.22" : "0.7");
      path.setAttribute("stroke-width", "1.6");
      svg.appendChild(path);
    });

    book.principles.forEach((principle, index) => {
      const angle = -90 + index * 40;
      const pos = polar(cx, cy, r, angle);
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Principle ${principle.id}: ${principle.title}`);
      g.addEventListener("click", () => {
        selected = { type: "principle", id: principle.id };
        render();
      });
      g.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selected = { type: "principle", id: principle.id };
          render();
        }
      });

      const circle = document.createElementNS(ns, "circle");
      const active = selected.type === "principle" && selected.id === principle.id;
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", active ? 46 : 40);
      circle.setAttribute("fill", active ? principle.color : "#fbf6ec");
      circle.setAttribute("stroke", principle.color);
      circle.setAttribute("stroke-width", "2.2");
      g.appendChild(circle);

      const num = document.createElementNS(ns, "text");
      num.setAttribute("x", pos.x);
      num.setAttribute("y", pos.y - 6);
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("fill", active ? "#fbf6ec" : principle.color);
      num.setAttribute("font-size", "11");
      num.setAttribute("letter-spacing", "0.12em");
      num.textContent = String(principle.id).padStart(2, "0");
      g.appendChild(num);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", pos.x);
      label.setAttribute("y", pos.y + 12);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", active ? "#fbf6ec" : "#2a2218");
      label.setAttribute("font-size", "13");
      label.setAttribute("font-weight", "500");
      label.textContent = principle.short;
      g.appendChild(label);

      svg.appendChild(g);

      if (active) {
        principle.chapters.forEach((chapter, chapterIndex) => {
          const spread = 28;
          const start = angle - ((principle.chapters.length - 1) * spread) / 2;
          const chapterPos = polar(pos.x, pos.y, 108, start + chapterIndex * spread);
          const link = document.createElementNS(ns, "line");
          link.setAttribute("x1", pos.x);
          link.setAttribute("y1", pos.y);
          link.setAttribute("x2", chapterPos.x);
          link.setAttribute("y2", chapterPos.y);
          link.setAttribute("stroke", principle.color);
          link.setAttribute("stroke-opacity", "0.35");
          svg.appendChild(link);

          const ch = document.createElementNS(ns, "g");
          ch.setAttribute("class", "node");
          const dot = document.createElementNS(ns, "circle");
          dot.setAttribute("cx", chapterPos.x);
          dot.setAttribute("cy", chapterPos.y);
          dot.setAttribute("r", "7");
          dot.setAttribute("fill", principle.color);
          ch.appendChild(dot);
          const chLabel = document.createElementNS(ns, "text");
          chLabel.setAttribute("x", chapterPos.x);
          chLabel.setAttribute("y", chapterPos.y + 22);
          chLabel.setAttribute("text-anchor", "middle");
          chLabel.setAttribute("font-size", "11");
          chLabel.setAttribute("fill", "#5d4f3c");
          chLabel.textContent = `Ch. ${chapter.n}`;
          ch.appendChild(chLabel);
          svg.appendChild(ch);
        });
      }
    });

    const core = document.createElementNS(ns, "g");
    core.setAttribute("class", "node");
    core.setAttribute("tabindex", "0");
    core.setAttribute("role", "button");
    core.setAttribute("aria-label", book.title);
    core.addEventListener("click", () => {
      selected = { type: "center" };
      render();
    });
    const coreCircle = document.createElementNS(ns, "circle");
    coreCircle.setAttribute("cx", cx);
    coreCircle.setAttribute("cy", cy);
    coreCircle.setAttribute("r", "78");
    coreCircle.setAttribute("fill", "#2a2218");
    core.appendChild(coreCircle);
    const t1 = document.createElementNS(ns, "text");
    t1.setAttribute("x", cx);
    t1.setAttribute("y", cy - 6);
    t1.setAttribute("text-anchor", "middle");
    t1.setAttribute("class", "center-title");
    t1.setAttribute("fill", "#fbf6ec");
    t1.textContent = "Wisdom Bridge";
    core.appendChild(t1);
    const t2 = document.createElementNS(ns, "text");
    t2.setAttribute("x", cx);
    t2.setAttribute("y", cy + 18);
    t2.setAttribute("text-anchor", "middle");
    t2.setAttribute("class", "center-sub");
    t2.setAttribute("fill", "#d4b36a");
    t2.textContent = "Nine principles";
    core.appendChild(t2);
    svg.appendChild(core);

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderBridge() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1100 720");
    svg.setAttribute("class", "bridge");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "The nine principles as pillars of a bridge");

    svg.innerHTML = `
      <rect x="0" y="0" width="1100" height="720" fill="#f7efde"/>
      <path d="M0 430 C 180 390, 280 470, 420 430 S 700 390, 1100 450 L 1100 720 L 0 720 Z" fill="#d9c7a5" opacity="0.55"/>
      <path d="M0 510 C 220 470, 360 560, 540 520 S 860 470, 1100 540 L 1100 720 L 0 720 Z" fill="#7a9a96" opacity="0.28"/>
      <text x="70" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">WHAT WE INHERIT</text>
      <text x="860" y="180" fill="#8a7a64" font-size="14" letter-spacing="0.18em">WHAT WE PASS ON</text>
      <path d="M90 250 C 300 210, 800 210, 1010 250" fill="none" stroke="#b0893e" stroke-width="3"/>
      <path d="M90 250 L 90 430 M1010 250 L 1010 430" stroke="#8a5a3b" stroke-width="8"/>
      <path d="M90 250 L 1010 250" stroke="#5d4f3c" stroke-width="10"/>
      <path d="M90 262 L 1010 262" stroke="#d4b36a" stroke-width="2"/>
    `;

    book.principles.forEach((principle, index) => {
      const x = 160 + index * 96;
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Principle ${principle.id}: ${principle.short}`);
      const select = () => {
        selected = { type: "principle", id: principle.id };
        render();
      };
      g.addEventListener("click", select);
      g.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      });

      const pier = document.createElementNS(ns, "rect");
      pier.setAttribute("x", x - 10);
      pier.setAttribute("y", "250");
      pier.setAttribute("width", "20");
      pier.setAttribute("height", "210");
      pier.setAttribute("rx", "4");
      pier.setAttribute("fill", principle.color);
      g.appendChild(pier);

      const cap = document.createElementNS(ns, "circle");
      cap.setAttribute("cx", x);
      cap.setAttribute("cy", "248");
      cap.setAttribute("r", selected.type === "principle" && selected.id === principle.id ? "16" : "12");
      cap.setAttribute("fill", "#fbf6ec");
      cap.setAttribute("stroke", principle.color);
      cap.setAttribute("stroke-width", "3");
      g.appendChild(cap);

      const num = document.createElementNS(ns, "text");
      num.setAttribute("x", x);
      num.setAttribute("y", "488");
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("fill", principle.color);
      num.setAttribute("font-size", "13");
      num.textContent = String(principle.id);
      g.appendChild(num);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", x);
      label.setAttribute("y", "510");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", "#2a2218");
      label.setAttribute("font-size", "12");
      label.textContent = principle.short;
      g.appendChild(label);

      svg.appendChild(g);
    });

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderJourney() {
    const wrap = document.createElement("div");
    wrap.className = "journey visible";
    wrap.innerHTML = book.principles
      .map(
        (principle) => `
        <article class="p-card" data-id="${principle.id}">
          <div class="p-num">${String(principle.id).padStart(2, "0")}</div>
          <div>
            <h3>${principle.title}</h3>
            <p>${principle.chapters.length} chapters · ${learningCount(principle)} learnings</p>
          </div>
        </article>`
      )
      .join("");
    wrap.querySelectorAll(".p-card").forEach((card) => {
      card.addEventListener("click", () => {
        selected = { type: "principle", id: Number(card.dataset.id) };
        render();
      });
    });
    canvas.innerHTML = "";
    canvas.appendChild(wrap);
  }

  function renderPanel() {
    if (selected.type === "center") {
      panel.innerHTML = `
        <p class="panel-kicker">The map</p>
        <h2>${book.title}</h2>
        <p class="lead">${book.subtitle}. Nine principles, read as a bridge from the village we inherit to the life we pass on.</p>
        <ul class="chapters">
          <li><span class="ch-n">Opening</span><span class="ch-title">${book.opening.title}</span></li>
          ${book.principles
            .map(
              (p) =>
                `<li><span class="ch-n">Principle ${p.id}</span><span class="ch-title">${p.title}</span></li>`
            )
            .join("")}
        </ul>
        <div class="learnings">
          <h3>Learnings</h3>
          <p class="empty">As you capture insights from each chapter, they will gather here and light up on the map.</p>
        </div>
      `;
      return;
    }

    const principle = book.principles.find((item) => item.id === selected.id);
    const notes = allLearnings(principle);
    panel.innerHTML = `
      <p class="panel-kicker">Principle ${String(principle.id).padStart(2, "0")}</p>
      <h2>${principle.title}</h2>
      <p class="lead">${principle.chapters.length} chapters in this span of the bridge.</p>
      <ul class="chapters">
        ${principle.chapters
          .map(
            (ch) => `
          <li>
            <span class="ch-n">Chapter ${ch.n} · p. ${ch.page}</span>
            <span class="ch-title">${ch.title}</span>
          </li>`
          )
          .join("")}
      </ul>
      <div class="learnings">
        <h3>Learnings</h3>
        ${
          notes.length
            ? `<ul>${notes.map((n) => `<li>${n.text || n}</li>`).join("")}</ul>`
            : `<p class="empty">No notes yet. Add them in learnings.md as you read, and we will fold them into this principle.</p>`
        }
      </div>
    `;
  }

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      viewButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      render();
    });
  });

  render();
})();
