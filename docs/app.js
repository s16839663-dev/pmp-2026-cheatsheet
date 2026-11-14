(() => {
  const ECO = window.PMP_ECO || [];
  const TOOLS = window.PMP_TOOLS || [];
  const QUIZ = window.PMP_QUIZ || [];

  const STORAGE_DONE = "pmp2026_done_ids_v1";
  let doneSet = new Set(JSON.parse(localStorage.getItem(STORAGE_DONE) || "[]"));

  let state = {
    tab: "eco",
    filter: "ALL",
    query: "",
    quizOrder: QUIZ.map((_, i) => i),
    quizAnswers: {} // questionId -> chosenIndex
  };

  const $ = (sel) => document.querySelector(sel);
  const contentArea = $("#contentArea");
  const filterBar = $("#filterBar");
  const statsBar = $("#statsBar");
  const searchInput = $("#searchInput");
  const clearSearchBtn = $("#clearSearchBtn");
  const progressPill = $("#progressPill");

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const norm = (s) => String(s ?? "").normalize("NFKC").toLowerCase();

  function highlight(text, words) {
    const safe = esc(text);
    if (!words.length) return safe;
    const pattern = words.map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    return safe.replace(new RegExp(`(${pattern})`, "gi"), "<mark>$1</mark>");
  }

  function saveDone() {
    localStorage.setItem(STORAGE_DONE, JSON.stringify([...doneSet]));
    updateProgressPill();
  }

  function updateProgressPill() {
    const total = ECO.length + TOOLS.length;
    progressPill.textContent = `${doneSet.size} / ${total} 済`;
  }

  function getWords() {
    const raw = searchInput.value.normalize("NFKC").trim();
    return raw ? raw.split(/\s+/) : [];
  }

  function matchesQuery(obj, words) {
    if (!words.length) return true;
    const hay = norm(JSON.stringify(obj));
    return words.every((w) => hay.includes(norm(w)));
  }

  function setTab(tab) {
    state.tab = tab;
    state.filter = "ALL";
    document.querySelectorAll(".tab-btn, .bnav-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function domainBadgeClass(domain) {
    if (domain === "People") return "people";
    if (domain === "Process") return "process";
    return "biz";
  }

  function renderFilterChips(chips) {
    filterBar.innerHTML = chips
      .map(
        (c) =>
          `<button class="chip ${state.filter === c.value ? "active" : ""}" data-filter="${esc(c.value)}">${esc(c.label)}</button>`
      )
      .join("");
  }

  function renderEco(words) {
    const domains = [
      { value: "ALL", label: `すべて (${ECO.length})` },
      { value: "People", label: "People (33%)" },
      { value: "Process", label: "Process (41%)" },
      { value: "Business Environment", label: "Business Env (26%)" }
    ];
    renderFilterChips(domains);

    const list = ECO.filter(
      (t) => (state.filter === "ALL" || t.domain === state.filter) && matchesQuery(t, words)
    );
    statsBar.innerHTML = `<span>表示中: ${list.length} / ${ECO.length} タスク</span>`;

    if (!list.length) {
      contentArea.innerHTML = `<p>該当するタスクが見つかりませんでした。</p>`;
      return;
    }

    contentArea.innerHTML =
      `<div class="cards-grid">` +
      list
        .map((t) => {
          const isDone = doneSet.has(t.id);
          const enablers = (t.enablers || []).map((e) => `<li>${highlight(e, words)}</li>`).join("");
          const points = (t.key_points || []).map((p) => `<li>${highlight(p, words)}</li>`).join("");
          const tools = (t.related_tools || []).map((r) => `<span class="tag">${highlight(r, words)}</span>`).join("");
          const pred = t.approach_diff?.predictive || "";
          const agile = t.approach_diff?.agile_hybrid || "";
          return `
            <article class="card" data-domain="${esc(t.domain)}">
              <div class="card-head">
                <div>
                  <div class="badge-row">
                    <span class="badge ${domainBadgeClass(t.domain)}">${esc(t.id)} · ${esc(t.domain)}</span>
                  </div>
                  <h2 class="card-title-ja">${highlight(t.title_ja, words)}</h2>
                  <p class="card-title-en">${highlight(t.title_en, words)}</p>
                </div>
                <button class="done-btn ${isDone ? "checked" : ""}" data-done="${esc(t.id)}">${isDone ? "✅ 済" : "☐ 未"}</button>
              </div>
              <p class="card-summary">${highlight(t.summary, words)}</p>
              <details class="card-details">
                <summary>詳細（Enablers・試験ポイント・手法比較）</summary>
                <div class="detail-section">
                  <h4>Enablers（主な実行項目）</h4>
                  <ul class="detail-list">${enablers}</ul>
                </div>
                <div class="detail-section">
                  <h4>試験での判断軸・ポイント</h4>
                  <ul class="detail-list">${points}</ul>
                </div>
                <div class="detail-section">
                  <h4>予測型 vs アジャイル/ハイブリッド</h4>
                  <div class="approach-box">
                    <div class="approach-item"><strong>予測型 (Predictive)</strong>${highlight(pred, words)}</div>
                    <div class="approach-item"><strong>アジャイル/ハイブリッド</strong>${highlight(agile, words)}</div>
                  </div>
                </div>
                ${
                  tools
                    ? `<div class="detail-section"><h4>関連ツール・成果物</h4><div class="tag-list">${tools}</div></div>`
                    : ""
                }
              </details>
            </article>
          `;
        })
        .join("") +
      `</div>`;
  }

  function renderTools(words, onlyFormulas = false) {
    const base = onlyFormulas ? TOOLS.filter((t) => t.formula && String(t.formula).trim() !== "") : TOOLS;
    const cats = ["ALL", ...new Set(base.map((t) => t.category))];
    renderFilterChips(
      cats.map((c) => ({
        value: c,
        label: c === "ALL" ? `すべて (${base.length})` : c
      }))
    );

    const list = base.filter(
      (t) => (state.filter === "ALL" || t.category === state.filter) && matchesQuery(t, words)
    );
    statsBar.innerHTML = `<span>表示中: ${list.length} / ${base.length} 件</span>`;

    if (!list.length) {
      contentArea.innerHTML = `<p>該当する項目が見つかりませんでした。</p>`;
      return;
    }

    contentArea.innerHTML =
      `<div class="cards-grid">` +
      list
        .map((t) => {
          const isDone = doneSet.has(t.id);
          const hasFormula = t.formula && String(t.formula).trim() !== "";
          return `
            <article class="card ${hasFormula ? "formula-card" : ""}">
              <div class="card-head">
                <div>
                  <div class="badge-row">
                    <span class="badge">${esc(t.id)} · ${esc(t.type)}</span>
                    <span class="badge">${esc(t.category)}</span>
                    ${hasFormula ? `<span class="badge formula">計算式あり</span>` : ""}
                  </div>
                  <h2 class="card-title-ja">${highlight(t.name_ja, words)}</h2>
                  <p class="card-title-en">${highlight(t.name_en, words)}</p>
                </div>
                <button class="done-btn ${isDone ? "checked" : ""}" data-done="${esc(t.id)}">${isDone ? "✅ 済" : "☐ 未"}</button>
              </div>
              <p class="card-summary">${highlight(t.overview, words)}</p>
              ${hasFormula ? `<div class="formula-box">${highlight(t.formula, words)}</div>` : ""}
              ${t.exam_tip ? `<div class="tip-box"><strong>試験Tip:</strong> ${highlight(t.exam_tip, words)}</div>` : ""}
            </article>
          `;
        })
        .join("") +
      `</div>`;
  }

  function renderQuiz(words) {
    const domains = [
      { value: "ALL", label: `全問 (${QUIZ.length})` },
      { value: "People", label: "People" },
      { value: "Process", label: "Process" },
      { value: "Business Environment", label: "Business Env" }
    ];
    renderFilterChips(domains);

    const ordered = state.quizOrder.map((i) => QUIZ[i]).filter(Boolean);
    const list = ordered.filter(
      (q) => (state.filter === "ALL" || q.domain === state.filter) && matchesQuery(q, words)
    );

    const answeredCount = Object.keys(state.quizAnswers).length;
    const correctCount = Object.entries(state.quizAnswers).filter(([qid, ans]) => {
      const q = QUIZ.find((x) => String(x.id) === String(qid));
      return q && q.answer_index === ans;
    }).length;
    const pct = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

    statsBar.innerHTML = `
      <span>表示中: ${list.length} / ${QUIZ.length} 問</span>
      <span>回答済: ${answeredCount} 問 · 正解: ${correctCount} 問 (${pct}%)</span>
    `;

    let html = `
      <div class="quiz-controls">
        <button class="btn" id="shuffleQuizBtn">🔀 出題順シャッフル</button>
        <button class="btn" id="resetQuizBtn">↺ 回答リセット</button>
      </div>
    `;

    if (!list.length) {
      contentArea.innerHTML = html + `<p>該当する問題がありません。</p>`;
      return;
    }

    html +=
      `<div class="cards-grid">` +
      list
        .map((q) => {
          const chosen = state.quizAnswers[q.id];
          const isAnswered = chosen !== undefined;
          const choicesHtml = (q.choices || [])
            .map((c, idx) => {
              let cls = "quiz-choice";
              if (isAnswered) {
                if (idx === q.answer_index) cls += " correct";
                else if (idx === chosen) cls += " wrong";
              }
              return `<li class="${cls}" data-qid="${esc(q.id)}" data-idx="${idx}">${"ABCD"[idx]}. ${highlight(c, words)}</li>`;
            })
            .join("");

          return `
            <article class="card quiz-card" data-domain="${esc(q.domain)}">
              <div class="badge-row">
                <span class="badge ${domainBadgeClass(q.domain)}">Q${esc(q.id)} · ${esc(q.domain)} (${esc(q.task_id)})</span>
              </div>
              <div class="quiz-question">${highlight(q.question, words)}</div>
              <ul class="quiz-choices">${choicesHtml}</ul>
              <div class="quiz-explanation ${isAnswered ? "show" : ""}">
                <strong>正解: ${"ABCD"[q.answer_index]}</strong><br>
                ${highlight(q.explanation, words)}
              </div>
            </article>
          `;
        })
        .join("") +
      `</div>`;

    contentArea.innerHTML = html;
  }

  function render() {
    const words = getWords();
    clearSearchBtn.hidden = searchInput.value === "";
    updateProgressPill();
    if (state.tab === "eco") renderEco(words);
    else if (state.tab === "tools") renderTools(words, false);
    else if (state.tab === "formulas") renderTools(words, true);
    else if (state.tab === "quiz") renderQuiz(words);
  }

  // Event Listeners
  document.querySelectorAll(".tab-btn, .bnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  filterBar.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    state.filter = chip.dataset.filter;
    render();
  });

  contentArea.addEventListener("click", (e) => {
    const doneBtn = e.target.closest("[data-done]");
    if (doneBtn) {
      const id = doneBtn.dataset.done;
      if (doneSet.has(id)) doneSet.delete(id);
      else doneSet.add(id);
      saveDone();
      render();
      return;
    }

    const choice = e.target.closest(".quiz-choice");
    if (choice) {
      const qid = choice.dataset.qid;
      const idx = Number(choice.dataset.idx);
      state.quizAnswers[qid] = idx;
      render();
      return;
    }

    if (e.target.id === "shuffleQuizBtn") {
      state.quizOrder.sort(() => Math.random() - 0.5);
      render();
    } else if (e.target.id === "resetQuizBtn") {
      state.quizAnswers = {};
      render();
    }
  });

  searchInput.addEventListener("input", render);
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    render();
    searchInput.focus();
  });

  render();
})();

