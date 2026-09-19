(function () {
  const book = window.WISDOM_BRIDGE;
  const canvas = document.getElementById("canvas");
  const panel = document.getElementById("panel");
  const viewButtons = document.querySelectorAll("[data-view]");
  const ns = "http://www.w3.org/2000/svg";

  let view = "map";
  let selected = { type: "center" };

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function asLearning(item) {
    return typeof item === "string" ? { text: item, short: item } : item;
  }

  function chapterLearnings(chapter) {
    return (chapter.learnings || []).map(asLearning);
  }

  function learningCount(principle) {
    return (
      (principle.learnings || []).length +
      principle.chapters.reduce((n, ch) => n + chapterLearnings(ch).length, 0)
    );
  }

  function allLearnings(principle) {
    return [
      ...(principle.learnings || []).map((item) => asLearning(item)),
      ...principle.chapters.flatMap((ch) =>
        chapterLearnings(ch).map((item) => ({ ...item, chapter: ch.n }))
      ),
    ];
  }

  function findInsight(id) {
    for (const principle of book.principles) {
      for (const note of allLearnings(principle)) {
        if (note.id === id) return { principle, note };
      }
    }
    return null;
  }

  function allBookLearnings() {
    return book.principles.flatMap((principle) =>
      allLearnings(principle).map((note) => ({ ...note, principle }))
    );
  }

  function polar(cx, cy, r, angle) {
    const a = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function el(name, attrs, text) {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) node.setAttribute(key, value);
    });
    if (text != null) node.textContent = text;
    return node;
  }

  function select(next) {
    selected = next;
    render();
  }

  function bindSelect(node, next) {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      select(next);
    });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(next);
      }
    });
  }

  function render() {
    if (view === "map") renderMap();
    else if (view === "bridge") renderBridge();
    else if (view === "heart") renderHeart();
    else renderJourney();
    renderPanel();
  }

  function renderMap() {
    const w = 1100;
    const h = 720;
    const cx = 550;
    const cy = 360;
    const r = 248;
    const svg = el("svg", {
      viewBox: `0 0 ${w} ${h}`,
      class: "map",
      role: "img",
      "aria-label": "Mind map of the nine principles",
    });

    const defs = el("defs");
    defs.innerHTML = `
      <radialGradient id="echo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4b36a" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#d4b36a" stop-opacity="0"/>
      </radialGradient>
    `;
    svg.appendChild(defs);

    [90, 160, 230].forEach((radius, i) => {
      svg.appendChild(
        el("circle", {
          cx,
          cy,
          r: radius,
          fill: "none",
          stroke: "rgba(176,137,62,0.18)",
          "stroke-width": i === 2 ? "1.25" : "1",
        })
      );
    });
    svg.appendChild(el("circle", { cx, cy, r: 86, fill: "url(#echo)" }));

    book.principles.forEach((principle, index) => {
      const angle = -90 + index * 40;
      const pos = polar(cx, cy, r, angle);
      const mid = polar(cx, cy, r * 0.55, angle + (index % 2 === 0 ? 8 : -8));
      const faded = selected.type !== "center" && selected.id !== principle.id && selected.principleId !== principle.id;
      svg.appendChild(
        el("path", {
          d: `M ${cx} ${cy} Q ${mid.x} ${mid.y} ${pos.x} ${pos.y}`,
          fill: "none",
          stroke: principle.color,
          "stroke-opacity": faded ? "0.22" : "0.7",
          "stroke-width": "1.6",
        })
      );
    });

    book.principles.forEach((principle, index) => {
      const angle = -90 + index * 40;
      const pos = polar(cx, cy, r, angle);
      const g = el("g", {
        class: "node",
        tabindex: "0",
        role: "button",
        "aria-label": `Principle ${principle.id}: ${principle.title}`,
      });
      bindSelect(g, { type: "principle", id: principle.id });

      const active =
        (selected.type === "principle" && selected.id === principle.id) ||
        selected.principleId === principle.id;
      const notes = learningCount(principle);
      g.appendChild(
        el("circle", {
          cx: pos.x,
          cy: pos.y,
          r: active ? 46 : 40,
          fill: active ? principle.color : "#fbf6ec",
          stroke: principle.color,
          "stroke-width": notes ? "3" : "2.2",
        })
      );
      g.appendChild(
        el("text", {
          x: pos.x,
          y: pos.y - 6,
          "text-anchor": "middle",
          fill: active ? "#fbf6ec" : principle.color,
          "font-size": "11",
          "letter-spacing": "0.12em",
        }, String(principle.id).padStart(2, "0"))
      );
      g.appendChild(
        el("text", {
          x: pos.x,
          y: pos.y + 12,
          "text-anchor": "middle",
          fill: active ? "#fbf6ec" : "#2a2218",
          "font-size": "13",
          "font-weight": "500",
        }, principle.short)
      );
      if (notes) {
        g.appendChild(el("circle", { cx: pos.x + 28, cy: pos.y - 28, r: 11, fill: "#b0893e" }));
        g.appendChild(
          el("text", {
            x: pos.x + 28,
            y: pos.y - 24,
            "text-anchor": "middle",
            fill: "#fbf6ec",
            "font-size": "11",
            "font-weight": "500",
          }, String(notes))
        );
      }
      svg.appendChild(g);

      if (active) {
        principle.chapters.forEach((chapter, chapterIndex) => {
          const spread = 32;
          const start = angle - ((principle.chapters.length - 1) * spread) / 2;
          const chapterPos = polar(pos.x, pos.y, 118, start + chapterIndex * spread);
          const filled = chapterLearnings(chapter).length > 0;
          const chapterActive = selected.type === "chapter" && selected.chapter === chapter.n;
          svg.appendChild(
            el("line", {
              x1: pos.x,
              y1: pos.y,
              x2: chapterPos.x,
              y2: chapterPos.y,
              stroke: principle.color,
              "stroke-opacity": "0.35",
            })
          );
          const ch = el("g", {
            class: "node",
            tabindex: "0",
            role: "button",
            "aria-label": `Chapter ${chapter.n}: ${chapter.title}`,
          });
          bindSelect(ch, { type: "chapter", id: principle.id, principleId: principle.id, chapter: chapter.n });
          ch.appendChild(
            el("circle", {
              cx: chapterPos.x,
              cy: chapterPos.y,
              r: chapterActive ? 12 : 8,
              fill: filled ? principle.color : "#fbf6ec",
              stroke: principle.color,
              "stroke-width": "2",
            })
          );
          ch.appendChild(
            el("text", {
              x: chapterPos.x,
              y: chapterPos.y + 24,
              "text-anchor": "middle",
              "font-size": "11",
              fill: "#5d4f3c",
            }, filled ? `Ch. ${chapter.n} · ${chapterLearnings(chapter).length}` : `Ch. ${chapter.n}`)
          );
          svg.appendChild(ch);
        });
      }
    });

    const core = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": book.title,
    });
    bindSelect(core, { type: "center" });
    core.appendChild(el("circle", { cx, cy, r: 78, fill: "#2a2218" }));
    core.appendChild(
      el("text", {
        x: cx,
        y: cy - 6,
        "text-anchor": "middle",
        class: "center-title",
        fill: "#fbf6ec",
      }, "Wisdom Bridge")
    );
    core.appendChild(
      el("text", {
        x: cx,
        y: cy + 18,
        "text-anchor": "middle",
        class: "center-sub",
        fill: "#d4b36a",
      }, "Nine principles")
    );
    svg.appendChild(core);

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderBridge() {
    const svg = el("svg", {
      viewBox: "0 0 1100 720",
      class: "bridge",
      role: "img",
      "aria-label": "The nine principles as pillars of a bridge",
    });
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
      const g = el("g", {
        class: "node",
        tabindex: "0",
        role: "button",
        "aria-label": `Principle ${principle.id}: ${principle.short}`,
      });
      bindSelect(g, { type: "principle", id: principle.id });
      const notes = learningCount(principle);
      g.appendChild(
        el("rect", {
          x: x - 10,
          y: "250",
          width: "20",
          height: "210",
          rx: "4",
          fill: principle.color,
        })
      );
      g.appendChild(
        el("circle", {
          cx: x,
          cy: "248",
          r: selected.type === "principle" && selected.id === principle.id ? "16" : "12",
          fill: "#fbf6ec",
          stroke: principle.color,
          "stroke-width": notes ? "4" : "3",
        })
      );
      if (notes) {
        g.appendChild(el("circle", { cx: x + 18, cy: 232, r: 10, fill: "#b0893e" }));
        g.appendChild(
          el("text", {
            x: x + 18,
            y: 236,
            "text-anchor": "middle",
            fill: "#fbf6ec",
            "font-size": "10",
          }, String(notes))
        );
      }
      g.appendChild(
        el("text", {
          x,
          y: "488",
          "text-anchor": "middle",
          fill: principle.color,
          "font-size": "13",
        }, String(principle.id))
      );
      g.appendChild(
        el("text", {
          x,
          y: "510",
          "text-anchor": "middle",
          fill: "#2a2218",
          "font-size": "12",
        }, principle.short)
      );
      svg.appendChild(g);
    });

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderHeart() {
    const svg = el("svg", {
      viewBox: "0 0 1100 720",
      class: "heart",
      role: "img",
      "aria-label": "The heart field, chakras, and the triad of will, faith, and confidence",
    });
    const defs = el("defs");
    defs.innerHTML = `
      <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c45c4a" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#c45c4a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="fieldGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d4b36a" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#d4b36a" stop-opacity="0"/>
      </radialGradient>
    `;
    svg.appendChild(defs);

    svg.appendChild(el("rect", { x: 0, y: 0, width: 1100, height: 720, fill: "#f7efde" }));
    svg.appendChild(
      el("text", {
        x: 70,
        y: 54,
        fill: "#b0893e",
        "font-size": "12",
        "letter-spacing": "0.2em",
      }, "PRINCIPLE 4  ·  THE HEART FIELD")
    );
    svg.appendChild(
      el("text", {
        x: 70,
        y: 92,
        fill: "#2a2218",
        "font-size": "28",
        "font-family": "Cormorant Garamond, serif",
      }, "The heart is the seat of the soul")
    );

    const spineX = 250;
    svg.appendChild(
      el("line", {
        x1: spineX,
        y1: 148,
        x2: spineX,
        y2: 560,
        stroke: "#c4b392",
        "stroke-width": "3",
        "pointer-events": "none",
      })
    );

    const chakras = [
      { y: 160, r: 12, id: "brahmarandhra", label: "Brahmarandhra", sub: "Soul enters · first 3 months" },
      { y: 222, r: 8, id: "chakras" },
      { y: 272, r: 8, id: "chakras" },
      { y: 372, r: 22, id: "seat-of-soul", heart: true },
      { y: 458, r: 8, id: "chakras" },
      { y: 508, r: 8, id: "chakras" },
      { y: 556, r: 8, id: "life-force" },
    ];

    svg.appendChild(
      el("circle", {
        cx: spineX,
        cy: 372,
        r: 130,
        fill: "url(#fieldGlow)",
        class: "pulse",
        "pointer-events": "none",
      })
    );
    [56, 92, 128].forEach((radius, i) => {
      svg.appendChild(
        el("circle", {
          cx: spineX,
          cy: 372,
          r: radius,
          fill: "none",
          stroke: "#c45c4a",
          "stroke-opacity": 0.22 + i * 0.08,
          "stroke-width": i === 2 ? 1.5 : 1,
          class: "pulse",
          "pointer-events": "none",
        })
      );
    });

    chakras.forEach((chakra, index) => {
      const g = el("g", {
        class: "node",
        tabindex: "0",
        role: "button",
        "aria-label": chakra.label || "Chakra",
      });
      bindSelect(g, { type: "insight", id: chakra.id, principleId: 4 });
      const active = selected.type === "insight" && selected.id === chakra.id;
      g.appendChild(
        el("circle", {
          cx: spineX,
          cy: chakra.y,
          r: chakra.heart ? 48 : 18,
          fill: "transparent",
        })
      );
      if (chakra.heart) {
        g.appendChild(el("circle", { cx: spineX, cy: chakra.y, r: 36, fill: "url(#heartGlow)", "pointer-events": "none" }));
      }
      g.appendChild(
        el("circle", {
          cx: spineX,
          cy: chakra.y,
          r: active ? chakra.r + 3 : chakra.r,
          fill: chakra.heart ? "#a85a3a" : "#fbf6ec",
          stroke: chakra.heart ? "#7a3d32" : "#b0893e",
          "stroke-width": chakra.heart ? 3 : 2,
          "pointer-events": "none",
        })
      );
          if (index === 0) {
        g.appendChild(
          el("path", {
            d: `M ${spineX} 78 C ${spineX - 8} 110, ${spineX + 8} 130, ${spineX} 148`,
            fill: "none",
            stroke: "#b0893e",
            "stroke-width": 2,
            "stroke-dasharray": "4 4",
            "pointer-events": "none",
          })
        );
      }
      svg.appendChild(g);
    });

    svg.appendChild(
      el("text", {
        x: spineX + 28,
        y: 156,
        fill: "#2a2218",
        "font-size": "14",
        "font-weight": "500",
      }, "Brahmarandhra")
    );
    svg.appendChild(
      el("text", {
        x: spineX + 28,
        y: 176,
        fill: "#8a7a64",
        "font-size": "12",
      }, "Near the occipital area · soul enters")
    );
    svg.appendChild(
      el("text", {
        x: spineX + 148,
        y: 368,
        fill: "#a85a3a",
        "font-size": "14",
        "font-weight": "500",
      }, "Heart")
    );
    svg.appendChild(
      el("text", {
        x: spineX + 148,
        y: 388,
        fill: "#8a7a64",
        "font-size": "12",
      }, "Seat of the soul · life force to every chakra")
    );
    const fieldLabel = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "Heart electromagnetic field about three feet",
    });
    bindSelect(fieldLabel, { type: "insight", id: "em-field", principleId: 4 });
    fieldLabel.appendChild(
      el("text", {
        x: spineX - 20,
        y: 372,
        "text-anchor": "end",
        fill: "#8a7a64",
        "font-size": "12",
      }, "Vibratory field")
    );
    fieldLabel.appendChild(
      el("text", {
        x: spineX - 20,
        y: 390,
        "text-anchor": "end",
        fill: "#8a7a64",
        "font-size": "12",
      }, "measurable ~ 3 ft")
    );
    svg.appendChild(fieldLabel);

    const firstOrgan = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "The first organ that forms is the heart",
    });
    bindSelect(firstOrgan, { type: "insight", id: "heart-first", principleId: 4 });
    firstOrgan.appendChild(
      el("text", {
        x: 70,
        y: 620,
        fill: "#5d4f3c",
        "font-size": "13",
      }, "The first organ that forms in the foetus is the heart.")
    );
    svg.appendChild(firstOrgan);

    const channelNote = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "Seven chakras along the spine",
    });
    bindSelect(channelNote, { type: "insight", id: "energy-channels", principleId: 4 });
    channelNote.appendChild(
      el("text", {
        x: 70,
        y: 642,
        fill: "#8a7a64",
        "font-size": "13",
      }, "Seven chakras along the spine channel the life force.")
    );
    svg.appendChild(channelNote);

    const soulNote = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "The soul enters within the first three months",
    });
    bindSelect(soulNote, { type: "insight", id: "soul-enters", principleId: 4 });
    soulNote.appendChild(
      el("text", {
        x: 70,
        y: 664,
        fill: "#8a7a64",
        "font-size": "13",
      }, "The soul enters through the Brahmarandhra within the first three months.")
    );
    svg.appendChild(soulNote);

    svg.appendChild(
      el("text", {
        x: 620,
        y: 54,
        fill: "#b0893e",
        "font-size": "12",
        "letter-spacing": "0.2em",
      }, "PRINCIPLE 3  ·  PREPARATION")
    );
    svg.appendChild(
      el("text", {
        x: 620,
        y: 92,
        fill: "#2a2218",
        "font-size": "28",
        "font-family": "Cormorant Garamond, serif",
      }, "Will · Faith · Confidence")
    );

    const triad = [
      { id: "three-needs", x: 820, y: 210, label: "Will" },
      { id: "three-needs", x: 720, y: 370, label: "Faith" },
      { id: "three-needs", x: 920, y: 370, label: "Confidence" },
    ];
    svg.appendChild(
      el("path", {
        d: "M 820 210 L 720 370 L 920 370 Z",
        fill: "none",
        stroke: "#6b7a4a",
        "stroke-width": 1.6,
      })
    );
    triad.forEach((node) => {
      const g = el("g", {
        class: "node",
        tabindex: "0",
        role: "button",
        "aria-label": node.label,
      });
      bindSelect(g, { type: "insight", id: node.id, principleId: 3 });
      const active = selected.type === "insight" && selected.id === node.id;
      g.appendChild(
        el("circle", {
          cx: node.x,
          cy: node.y,
          r: 44,
          fill: "transparent",
        })
      );
      g.appendChild(
        el("circle", {
          cx: node.x,
          cy: node.y,
          r: active ? 38 : 34,
          fill: "#fbf6ec",
          stroke: "#6b7a4a",
          "stroke-width": 2.2,
          "pointer-events": "none",
        })
      );
      g.appendChild(
        el("text", {
          x: node.x,
          y: node.y + 5,
          "text-anchor": "middle",
          fill: "#2a2218",
          "font-size": "14",
          "font-weight": "500",
        }, node.label)
      );
      svg.appendChild(g);
    });

    const doubt = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "Doubt poisons the will",
    });
    bindSelect(doubt, { type: "insight", id: "doubt", principleId: 3 });
    doubt.appendChild(
      el("text", {
        x: 980,
        y: 188,
        fill: "#7a3d4a",
        "font-size": "13",
        "font-weight": "500",
      }, "Doubt")
    );
    doubt.appendChild(
      el("text", {
        x: 980,
        y: 206,
        fill: "#8a7a64",
        "font-size": "12",
      }, "poisons the will")
    );
    svg.appendChild(doubt);

    const prepare = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "Meditation prepares peace and harmony",
    });
    bindSelect(prepare, { type: "insight", id: "meditation", principleId: 3 });
    prepare.appendChild(
      el("ellipse", {
        cx: 820,
        cy: 530,
        rx: 150,
        ry: 48,
        fill: "rgba(61, 107, 99, 0.12)",
        stroke: "#3d6b63",
        "stroke-width": 1.5,
      })
    );
    prepare.appendChild(
      el("text", {
        x: 820,
        y: 524,
        "text-anchor": "middle",
        fill: "#2a2218",
        "font-size": "16",
        "font-weight": "500",
      }, "Meditation")
    );
    prepare.appendChild(
      el("text", {
        x: 820,
        y: 546,
        "text-anchor": "middle",
        fill: "#5d4f3c",
        "font-size": "12",
      }, "prepares peace and harmony · dissolves doubt")
    );
    svg.appendChild(prepare);

    const prepareNote = el("g", {
      class: "node",
      tabindex: "0",
      role: "button",
      "aria-label": "To eliminate doubt, one must prepare",
    });
    bindSelect(prepareNote, { type: "insight", id: "prepare", principleId: 3 });
    prepareNote.appendChild(
      el("text", {
        x: 820,
        y: 612,
        "text-anchor": "middle",
        fill: "#5d4f3c",
        "font-size": "13",
      }, "To eliminate doubt, one must prepare.")
    );
    svg.appendChild(prepareNote);

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderJourney() {
    const wrap = document.createElement("div");
    wrap.className = "journey visible";
    wrap.innerHTML = book.principles
      .map((principle) => {
        const notes = learningCount(principle);
        return `
        <article class="p-card ${notes ? "has-notes" : ""}" data-id="${principle.id}">
          <div class="p-num">${String(principle.id).padStart(2, "0")}</div>
          <div>
            <h3>${escapeHtml(principle.title)}</h3>
            <p>${principle.chapters.length} chapters · ${notes} learning${notes === 1 ? "" : "s"}</p>
          </div>
        </article>`;
      })
      .join("");
    wrap.querySelectorAll(".p-card").forEach((card) => {
      card.addEventListener("click", () => {
        select({ type: "principle", id: Number(card.dataset.id) });
      });
    });
    canvas.innerHTML = "";
    canvas.appendChild(wrap);
  }

  function renderNotes(notes) {
    if (!notes.length) {
      return `<p class="empty">No notes yet. Add them in learnings.md as you read, and we will fold them into this principle.</p>`;
    }
    return `<ul class="insight-list">${notes
      .map(
        (note) => `
      <li>
        ${note.chapter ? `<span class="ch-n">Chapter ${note.chapter}</span>` : ""}
        <span class="insight-short">${escapeHtml(note.short || "")}</span>
        <span class="insight-text">${escapeHtml(note.text)}</span>
      </li>`
      )
      .join("")}</ul>`;
  }

  function renderPanel() {
    if (selected.type === "insight") {
      const found = findInsight(selected.id);
      if (!found) {
        selected = { type: "center" };
        return renderPanel();
      }
      const { principle, note } = found;
      const siblings = allLearnings(principle);
      panel.innerHTML = `
        <p class="panel-kicker">Principle ${String(principle.id).padStart(2, "0")} · ${escapeHtml(principle.short)}</p>
        <h2>${escapeHtml(note.short || principle.title)}</h2>
        <p class="lead">${escapeHtml(note.text)}</p>
        <div class="learnings">
          <h3>Held with</h3>
          ${renderNotes(siblings.filter((item) => item.id !== note.id))}
        </div>
      `;
      return;
    }

    if (selected.type === "center") {
      const captured = allBookLearnings();
      panel.innerHTML = `
        <p class="panel-kicker">The map</p>
        <h2>${escapeHtml(book.title)}</h2>
        <p class="lead">${escapeHtml(book.subtitle)}. Nine principles, read as a bridge from the village we inherit to the life we pass on.</p>
        <ul class="chapters">
          ${book.principles
            .map((p) => {
              const n = learningCount(p);
              return `<li class="${n ? "active" : ""}" data-principle="${p.id}">
                <span class="ch-n">Principle ${p.id}${n ? ` · ${n} learnings` : ""}</span>
                <span class="ch-title">${escapeHtml(p.title)}</span>
              </li>`;
            })
            .join("")}
        </ul>
        <div class="learnings">
          <h3>Learnings so far</h3>
          ${
            captured.length
              ? renderNotes(captured)
              : `<p class="empty">As you capture insights from each chapter, they will gather here and light up on the map.</p>`
          }
        </div>
      `;
      panel.querySelectorAll("[data-principle]").forEach((item) => {
        item.style.cursor = "pointer";
        item.addEventListener("click", () => select({ type: "principle", id: Number(item.dataset.principle) }));
      });
      return;
    }

    const principleId = selected.principleId || selected.id;
    const principle = book.principles.find((item) => item.id === principleId);
    const chapter = selected.type === "chapter"
      ? principle.chapters.find((item) => item.n === selected.chapter)
      : null;
    const notes = chapter ? chapterLearnings(chapter).map((item) => ({ ...item, chapter: chapter.n })) : allLearnings(principle);

    panel.innerHTML = `
      <p class="panel-kicker">Principle ${String(principle.id).padStart(2, "0")}</p>
      <h2>${escapeHtml(chapter ? chapter.title : principle.title)}</h2>
      <p class="lead">${escapeHtml(chapter ? `Chapter ${chapter.n} · p. ${chapter.page}` : principle.essence || `${principle.chapters.length} chapters in this span of the bridge.`)}</p>
      <ul class="chapters">
        ${principle.chapters
          .map((ch) => {
            const filled = chapterLearnings(ch).length;
            const active = chapter && chapter.n === ch.n;
            return `
          <li class="${active ? "active" : ""} ${filled ? "has-notes" : ""}" data-chapter="${ch.n}">
            <span class="ch-n">Chapter ${ch.n} · p. ${ch.page}${filled ? ` · ${filled}` : ""}</span>
            <span class="ch-title">${escapeHtml(ch.title)}</span>
          </li>`;
          })
          .join("")}
      </ul>
      <div class="learnings">
        <h3>Learnings</h3>
        ${renderNotes(notes)}
      </div>
    `;
    panel.querySelectorAll("[data-chapter]").forEach((item) => {
      item.style.cursor = "pointer";
      item.addEventListener("click", () =>
        select({ type: "chapter", id: principle.id, principleId: principle.id, chapter: Number(item.dataset.chapter) })
      );
    });
  }

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view;
      viewButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      if (view === "heart" && selected.type === "center") {
        selected = { type: "insight", id: "seat-of-soul", principleId: 4 };
      }
      render();
    });
  });

  render();
})();
