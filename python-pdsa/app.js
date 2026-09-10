(function () {
  const course = window.PDSA_COURSE;
  const canvas = document.getElementById("canvas");
  const panel = document.getElementById("panel");
  const viewButtons = document.querySelectorAll("[data-view]");

  let view = "map";
  let selected = { type: "center" };

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
    return week.lectures.find((lecture) => lecture.n === lectureN);
  }

  function polar(cx, cy, r, angle) {
    const a = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    if (view === "map") renderMap();
    else if (view === "trace") renderTrace();
    else renderJourney();
    renderPanel();
  }

  function selectWeek(id) {
    selected = { type: "week", id };
    render();
  }

  function selectLecture(weekId, lectureN) {
    selected = { type: "lecture", id: weekId, lecture: lectureN };
    render();
  }

  function isWeekActive(week) {
    return (
      (selected.type === "week" || selected.type === "lecture") &&
      selected.id === week.id
    );
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
    svg.setAttribute("aria-label", "Mind map of the eight course weeks");

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

    course.weeks.forEach((week, index) => {
      const angle = -90 + index * 45;
      const pos = polar(cx, cy, r, angle);
      const path = document.createElementNS(ns, "path");
      const mid = polar(cx, cy, r * 0.55, angle + (index % 2 === 0 ? 8 : -8));
      path.setAttribute("d", `M ${cx} ${cy} Q ${mid.x} ${mid.y} ${pos.x} ${pos.y}`);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", week.color);
      path.setAttribute(
        "stroke-opacity",
        selected.type !== "center" && selected.id !== week.id ? "0.22" : "0.7"
      );
      path.setAttribute("stroke-width", "1.6");
      svg.appendChild(path);
    });

    course.weeks.forEach((week, index) => {
      const angle = -90 + index * 45;
      const pos = polar(cx, cy, r, angle);
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", "node");
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", `Week ${week.id}: ${week.title}`);
      const choose = () => selectWeek(week.id);
      g.addEventListener("click", choose);
      g.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          choose();
        }
      });

      const circle = document.createElementNS(ns, "circle");
      const active = isWeekActive(week);
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", active ? 46 : 40);
      circle.setAttribute("fill", active ? week.color : "#fbf6ec");
      circle.setAttribute("stroke", week.color);
      circle.setAttribute("stroke-width", weekNoteCount(week) ? "3" : "2.2");
      g.appendChild(circle);

      const num = document.createElementNS(ns, "text");
      num.setAttribute("x", pos.x);
      num.setAttribute("y", pos.y - 6);
      num.setAttribute("text-anchor", "middle");
      num.setAttribute("fill", active ? "#fbf6ec" : week.color);
      num.setAttribute("font-size", "11");
      num.setAttribute("letter-spacing", "0.12em");
      num.textContent = `W${String(week.id).padStart(2, "0")}`;
      g.appendChild(num);

      const label = document.createElementNS(ns, "text");
      label.setAttribute("x", pos.x);
      label.setAttribute("y", pos.y + 12);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("fill", active ? "#fbf6ec" : "#2a2218");
      label.setAttribute("font-size", "13");
      label.setAttribute("font-weight", "500");
      label.textContent = week.short;
      g.appendChild(label);
      svg.appendChild(g);

      if (active) {
        week.lectures.forEach((lecture, lectureIndex) => {
          const spread = Math.min(26, 140 / Math.max(week.lectures.length, 1));
          const start = angle - ((week.lectures.length - 1) * spread) / 2;
          const lecturePos = polar(pos.x, pos.y, 108, start + lectureIndex * spread);
          const link = document.createElementNS(ns, "line");
          link.setAttribute("x1", pos.x);
          link.setAttribute("y1", pos.y);
          link.setAttribute("x2", lecturePos.x);
          link.setAttribute("y2", lecturePos.y);
          link.setAttribute("stroke", week.color);
          link.setAttribute("stroke-opacity", "0.35");
          svg.appendChild(link);

          const ch = document.createElementNS(ns, "g");
          ch.setAttribute("class", "node");
          ch.setAttribute("tabindex", "0");
          ch.setAttribute("role", "button");
          ch.setAttribute("aria-label", lecture.title);
          ch.addEventListener("click", (event) => {
            event.stopPropagation();
            selectLecture(week.id, lecture.n);
          });
          const filled = hasNotes(lecture);
          const chosen = selected.type === "lecture" && selected.lecture === lecture.n;
          const dot = document.createElementNS(ns, "circle");
          dot.setAttribute("cx", lecturePos.x);
          dot.setAttribute("cy", lecturePos.y);
          dot.setAttribute("r", chosen ? "10" : filled ? "8" : "6");
          dot.setAttribute("fill", filled ? week.color : "#fbf6ec");
          dot.setAttribute("stroke", week.color);
          dot.setAttribute("stroke-width", "2");
          ch.appendChild(dot);
          const chLabel = document.createElementNS(ns, "text");
          chLabel.setAttribute("x", lecturePos.x);
          chLabel.setAttribute("y", lecturePos.y + 22);
          chLabel.setAttribute("text-anchor", "middle");
          chLabel.setAttribute("font-size", "11");
          chLabel.setAttribute("fill", "#5d4f3c");
          chLabel.textContent = filled ? "notes" : `L${lecture.n}`;
          ch.appendChild(chLabel);
          svg.appendChild(ch);
        });
      }
    });

    const core = document.createElementNS(ns, "g");
    core.setAttribute("class", "node");
    core.setAttribute("tabindex", "0");
    core.setAttribute("role", "button");
    core.setAttribute("aria-label", course.title);
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
    t1.setAttribute("y", cy - 8);
    t1.setAttribute("text-anchor", "middle");
    t1.setAttribute("class", "center-title");
    t1.setAttribute("fill", "#fbf6ec");
    t1.textContent = "PDSA Python";
    core.appendChild(t1);
    const t2 = document.createElementNS(ns, "text");
    t2.setAttribute("x", cx);
    t2.setAttribute("y", cy + 16);
    t2.setAttribute("text-anchor", "middle");
    t2.setAttribute("class", "center-sub");
    t2.setAttribute("fill", "#d4b36a");
    t2.textContent = `${totalNotes()} topics ready`;
    core.appendChild(t2);
    svg.appendChild(core);

    canvas.innerHTML = "";
    canvas.appendChild(svg);
  }

  function renderTrace() {
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

  function renderJourney() {
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

  function renderNotes(notes) {
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

    return `
      <p class="idea">${escapeHtml(notes.idea)}</p>
      ${list("Why it works", notes.why)}
      ${list("Versus the slower version", notes.versus)}
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
          <span class="badge">Interview cards</span>
          <span class="badge">8 weeks</span>
        </div>
        <ul class="chapters">
          ${course.weeks
            .map((week) => {
              const ready = weekNoteCount(week);
              return `<li>
                <span class="ch-n">Week ${week.id}${ready ? " · notes" : ""}</span>
                <span class="ch-title">${escapeHtml(week.title)}</span>
              </li>`;
            })
            .join("")}
        </ul>
        <div class="learnings">
          <h3>How notes appear</h3>
          <p class="empty">Filled lectures light up on the map. Empty ones stay as placeholders until you add them in learnings.md.</p>
        </div>
      `;
      return;
    }

    const week = getWeek(selected.id);
    if (selected.type === "week") {
      panel.innerHTML = `
        <button type="button" class="back" data-back="center">← Course</button>
        <p class="panel-kicker">Week ${String(week.id).padStart(2, "0")}</p>
        <h2>${escapeHtml(week.title)}</h2>
        <p class="lead">${week.lectures.length} lectures in this span. Open a filled lecture for the interview sheet.</p>
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
      panel.querySelector("[data-back]").addEventListener("click", () => {
        selected = { type: "center" };
        render();
      });
      bindLectureButtons(week);
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
             ${renderNotes(lecture.notes)}`
          : `<p class="lead">${escapeHtml(lecture.title)}</p>
             <div class="learnings"><p class="empty">No notes yet. Capture them in learnings.md under this lecture, and they will appear here for revision.</p></div>`
      }
    `;
    panel.querySelector("[data-back]").addEventListener("click", () => selectWeek(week.id));
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
