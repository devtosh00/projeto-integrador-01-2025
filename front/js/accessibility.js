// js/accessibility.js
(function () {
  const defaultSettings = { fontSize: 100, spacing: 100 };

  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem("a11ySettings")) || defaultSettings;
    applySettings(settings);
  }

  function saveSettings(settings) {
    localStorage.setItem("a11ySettings", JSON.stringify(settings));
  }

  function applySettings(s) {
    // aplica nas propriedades do body
    document.documentElement.style.setProperty("--a11y-font-scale", s.fontSize / 100);
    
     // Linha e espaçamento entre letras
    document.body.style.lineHeight = (s.spacing / 100 * 1.5) + "em";
    document.body.style.letterSpacing = ((s.spacing - 100) / 100) + "em";

    // Atualiza exibição dos valores
    const fontSpan = document.getElementById("a11y-font-value");
    const spacingSpan = document.getElementById("a11y-spacing-value");

    if (fontSpan) fontSpan.textContent = s.fontSize + "%";
    if (spacingSpan) spacingSpan.textContent = s.spacing + "%";
  }

  // expõe funções no escopo global (opcional: útil se tu mantiver onclick inline)
  window.changeFontSize = function (action) {
    let s = JSON.parse(localStorage.getItem("a11ySettings")) || defaultSettings;
    s.fontSize = action === "increase" ? s.fontSize + 10 : Math.max(80, s.fontSize - 10);
    applySettings(s);
    saveSettings(s);
  };

  window.changeSpacing = function (action) {
    let s = JSON.parse(localStorage.getItem("a11ySettings")) || defaultSettings;
    s.spacing = action === "increase" ? s.spacing + 10 : Math.max(80, s.spacing - 10);
    applySettings(s);
    saveSettings(s);
  };

  function init() {
    loadSettings();

    const btn = document.getElementById("accessibility-btn");
    const panel = document.getElementById("accessibility-panel");

    if (!btn || !panel) {
      // componente não encontrado — pode ser que o fetch tenha falhado ou caminho errado
      console.warn("Componente de acessibilidade não encontrado na página.");
      return;
    }

    // toggle do painel
    btn.addEventListener("click", () => {
      const isOpen = panel.style.display === "block";
      panel.style.display = isOpen ? "none" : "block";
      panel.setAttribute("aria-hidden", isOpen ? "true" : "false");
    });

    // acessibilidade por teclado (Enter / Space)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });

    // liga os botões por id (evita depender de onclick inline)
    const fInc = document.getElementById("a11y-font-increase");
    const fDec = document.getElementById("a11y-font-decrease");
    const sInc = document.getElementById("a11y-spacing-increase");
    const sDec = document.getElementById("a11y-spacing-decrease");

    if (fInc) fInc.addEventListener("click", () => window.changeFontSize("increase"));
    if (fDec) fDec.addEventListener("click", () => window.changeFontSize("decrease"));
    if (sInc) sInc.addEventListener("click", () => window.changeSpacing("increase"));
    if (sDec) sDec.addEventListener("click", () => window.changeSpacing("decrease"));
  }

  // Inicializa mesmo se o DOMContentLoaded JÁ tiver ocorrido (porque injetamos o HTML dinamicamente)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM pronto — inicializa na hora
    init();
  }
})();
