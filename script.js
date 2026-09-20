(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Mobile navigation
  const menuButton = $(".mobile-menu");
  const mainNav = $(".main-nav");
  if (menuButton && mainNav) {
    menuButton.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "×" : "☰";
    });
    $$(".main-nav a").forEach(link => link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "☰";
    }));
  }

  // Mobile dropdowns
  $$(".nav-drop-btn").forEach(button => {
    button.addEventListener("click", () => {
      const parent = button.closest(".nav-dropdown");
      if (window.matchMedia("(max-width: 760px)").matches) parent.classList.toggle("open");
    });
  });

  // Theme toggle
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("toolsda-theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  if (themeToggle) {
    themeToggle.textContent = document.body.classList.contains("dark") ? "☾" : "☼";
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const dark = document.body.classList.contains("dark");
      localStorage.setItem("toolsda-theme", dark ? "dark" : "light");
      themeToggle.textContent = dark ? "☾" : "☼";
    });
  }

  // Search / filter
  const searchForm = $("#toolSearch");
  const searchInput = $("#searchInput");
  const searchMessage = $("#searchMessage");
  const cards = $$(".tool-card");
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", event => event.preventDefault());
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const matches = !query || (card.dataset.search || "").includes(query);
        card.hidden = !matches;
        if (matches) visible++;
      });
      if (searchMessage) {
        searchMessage.textContent = query ? `${visible} matching tool${visible === 1 ? "" : "s"} found.` : "";
      }
    });
  }

  // Reusable calculator engine
  function makeCalculator(displaySelector, buttonSelector) {
    const display = $(displaySelector);
    if (!display) return;
    let expression = "";
    let justEvaluated = false;

    const render = value => {
      display.textContent = value || "0";
    };

    const safeEvaluate = input => {
      const normalized = input.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("−", "-");
      if (!/^[0-9+*/().% -]+$/.test(normalized)) throw new Error("Invalid expression");
      const result = Function(`"use strict"; return (${normalized})`)();
      if (!Number.isFinite(result)) throw new Error("Math error");
      return Math.round((result + Number.EPSILON) * 1e10) / 1e10;
    };

    const press = key => {
      if (key === "clear" || key === "AC") {
        expression = ""; justEvaluated = false; render("0"); return;
      }
      if (key === "back") {
        expression = expression.slice(0, -1); render(expression); return;
      }
      if (key === "percent") {
        const match = expression.match(/([0-9.]+)$/);
        if (match) {
          const number = parseFloat(match[1]);
          expression = expression.slice(0, -match[1].length) + String(number / 100);
          render(expression);
        }
        return;
      }
      if (key === "=") {
        if (!expression) return;
        try {
          expression = String(safeEvaluate(expression));
          render(expression);
          justEvaluated = true;
        } catch {
          render("Error");
          expression = "";
        }
        return;
      }
      if (justEvaluated && /[0-9.]/.test(key)) {
        expression = "";
        justEvaluated = false;
      } else if (justEvaluated && /[+−×÷]/.test(key)) {
        justEvaluated = false;
      }
      if (key === ".") {
        const current = expression.split(/[+−×÷]/).pop();
        if (current.includes(".")) return;
      }
      if (/[+−×÷]/.test(key)) {
        if (!expression && key !== "−") return;
        if (/[+−×÷]$/.test(expression)) expression = expression.slice(0, -1);
      }
      expression += key;
      render(expression);
    };

    $$(buttonSelector).forEach(button => button.addEventListener("click", () => press(button.dataset.calc || button.dataset.largeCalc)));

    return { press };
  }

  const miniCalc = makeCalculator("#calcDisplay", "[data-calc]");
  const largeCalc = makeCalculator("#largeCalcDisplay", "[data-large-calc]");

  // Keyboard support for the large calculator.
  document.addEventListener("keydown", event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const keyMap = { "/":"÷", "*":"×", "-":"−", "+":"+", ".":".", "%":"percent", "Enter":"=", "=":"=", "Backspace":"back", "Escape":"clear" };
    if (/^[0-9]$/.test(event.key)) {
      largeCalc?.press(event.key);
    } else if (keyMap[event.key]) {
      largeCalc?.press(keyMap[event.key]);
    } else return;
    event.preventDefault();
  });
})();
