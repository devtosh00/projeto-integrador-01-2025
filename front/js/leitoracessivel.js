(function () {
  'use strict';

  // ============================================================
  // LeitorAcessivel: Enhanced minimal, persistent implementation
  // ============================================================
  
  class LeitorAcessivel {
    constructor() {
      this.synth = window.speechSynthesis;
      this.voice = null;
      this.rate = 1;
      this.pitch = 1;
      this._speaking = false;
      this._loadVoices();
      this._loadSettings(); // Carrega configurações salvas
    }

    // Carrega configurações do localStorage
    _loadSettings() {
      try {
        const saved = localStorage.getItem('leitor-acessivel-config');
        if (saved) {
          const config = JSON.parse(saved);
          this.rate = config.rate || 1;
          this.pitch = config.pitch || 1;
        }
      } catch (e) {
        console.warn('Erro ao carregar configurações:', e);
      }
    }

    // Salva configurações no localStorage
    _saveSettings() {
      try {
        localStorage.setItem('leitor-acessivel-config', JSON.stringify({
          rate: this.rate,
          pitch: this.pitch,
          enabled: true
        }));
      } catch (e) {
        console.warn('Erro ao salvar configurações:', e);
      }
    }

    _loadVoices() {
      const setVoice = () => {
        const voices = this.synth.getVoices();
        // Prioriza voz em português
        this.voice = voices.find(v => /pt(-|_)?br/i.test(v.lang)) ||
                     voices.find(v => /pt(-|_)?/i.test(v.lang)) ||
                     voices[0] || null;
      };
      setVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = setVoice;
      }
    }

    // Verifica se elemento está visível e acessível
    isVisible(element) {
      if (!element) return false;
      
      // Ignora elementos com aria-hidden="true"
      if (element.getAttribute('aria-hidden') === 'true') return false;
      
      // Ignora elementos com atributo hidden
      if (element.hasAttribute('hidden')) return false;
      
      // Ignora elementos desabilitados
      if (element.disabled) return false;
      
      // Verifica CSS
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || 
          style.visibility === 'hidden' || 
          parseFloat(style.opacity) === 0) {
        return false;
      }
      
      // Verifica se está fora da viewport (opcional, pode remover se muito restritivo)
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      
      return true;
    }

    // Extrai texto limpo e relevante do elemento
    extractCleanText(element) {
      if (!element || !this.isVisible(element)) return '';
      
      // Prioridade: data-read-text > aria-label > aria-labelledby > value > textContent
      if (element.getAttribute && element.getAttribute('data-read-text')) {
        return element.getAttribute('data-read-text').trim();
      }
      
      if (element.getAttribute && element.getAttribute('aria-label')) {
        return element.getAttribute('aria-label').trim();
      }
      
      // Para inputs e selects
      if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent.trim();
        if (element.placeholder) return element.placeholder.trim();
        if (element.value) return element.value.trim();
      }
      
      // Para botões
      if (element.tagName === 'BUTTON') {
        return element.textContent.trim() || 'Botão';
      }
      
      // Texto padrão, mas remove espaços múltiplos e quebras
      return element.textContent.replace(/\s+/g, ' ').trim();
    }

    isSpeaking() {
      return this._speaking;
    }

    setRate(rate) {
      this.rate = Math.max(0.1, Math.min(10, rate));
      this._saveSettings();
    }

    setPitch(pitch) {
      this.pitch = Math.max(0, Math.min(2, pitch));
      this._saveSettings();
    }

    speak(text, opts = {}) {
      return new Promise((resolve, reject) => {
        if (!text || typeof text !== 'string') return resolve();
        if (!this.synth) return reject(new Error('SpeechSynthesis não disponível'));

        // Remove espaços extras e normaliza
        text = text.replace(/\s+/g, ' ').trim();
        if (!text) return resolve();

        const utter = new SpeechSynthesisUtterance(text);
        if (this.voice) utter.voice = this.voice;
        utter.rate = opts.rate || this.rate;
        utter.pitch = opts.pitch || this.pitch;
        utter.lang = this.voice?.lang || opts.lang || 'pt-BR';

        utter.onstart = () => { this._speaking = true; };
        utter.onend = () => { this._speaking = false; resolve(); };
        utter.onerror = (e) => { this._speaking = false; reject(e); };

        try {
          this.synth.speak(utter);
        } catch (err) {
          this._speaking = false;
          reject(err);
        }
      });
    }

    speakTextForElement(el) {
      if (!el) return Promise.resolve();
      const text = this.extractCleanText(el);
      if (!text) return Promise.resolve();
      return this.speak(text);
    }

    cancel() {
      if (this.synth) {
        try { this.synth.cancel(); } catch (e) { /* swallow */ }
      }
      this._speaking = false;
    }
  }

  // ============================================================
  // initLeitorAcessivel: Controller com persistência e MutationObserver
  // ============================================================
  
  function initLeitorAcessivel(opts = {}) {
    const leitor = new LeitorAcessivel();
    let active = false;
    let observer = null;
    const bound = { mouseover: null, focusin: null, click: null };
    
    const STORAGE_KEY = 'leitor-acessivel-state';
    
    // Carrega estado anterior do localStorage
    function loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const state = JSON.parse(saved);
          return state.active || false;
        }
      } catch (e) {
        console.warn('Erro ao carregar estado:', e);
      }
      return false;
    }
    
    // Salva estado no localStorage
    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ active }));
      } catch (e) {
        console.warn('Erro ao salvar estado:', e);
      }
    }

    // MutationObserver para monitorar conteúdo dinâmico
    function setupMutationObserver(root) {
      if (observer) return; // Já existe
      
      observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          // Quando novos elementos são adicionados, anexa eventos
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                attachEventsToElement(node);
              }
            });
          }
        });
      });
      
      observer.observe(root, {
        childList: true,
        subtree: true,
        attributes: false // Não precisa monitorar atributos por performance
      });
    }
    
    // Anexa eventos a um elemento específico
    function attachEventsToElement(element) {
      const readableElements = element.querySelectorAll('[data-readable], article, h1, h2, h3, p, button, a');
      readableElements.forEach(el => {
        if (!el.hasAttribute('data-leitor-attached')) {
          el.setAttribute('data-leitor-attached', 'true');
          el.style.cursor = 'pointer';
        }
      });
    }

    function activate() {
      if (active) return;
      active = true;
      saveState();
      
      const mainSelector = opts.mainSelector || 'main';
      const root = document.querySelector(mainSelector) || document.body;
      
      // Evento de mouseover para ler ao passar o mouse
      bound.mouseover = (e) => {
        const el = e.target.closest('[data-readable], article, h1, h2, h3, h4, h5, p, button, a, input, select, textarea, label, span');
        if (el && leitor.isVisible(el)) {
          leitor.cancel(); // Para leitura anterior
          leitor.speakTextForElement(el).catch(() => {});
        }
      };
      
      // Evento de focus para acessibilidade via teclado
      bound.focusin = (e) => {
        const el = e.target;
        if (leitor.isVisible(el)) {
          leitor.cancel();
          leitor.speakTextForElement(el).catch(() => {});
        }
      };
      
      // Evento de click para elementos interativos
      bound.click = (e) => {
        if (!active) return; // Se não estiver ativo, ignora
        // ✨ Ignora o painel de acessibilidade
        if (e.target.closest('#accessibility-panel, #accessibility-btn')) return;
        const el = e.target.closest('[data-readable], button, a');

        if (el && leitor.isVisible(el)) {
          leitor.speakTextForElement(el).catch(() => {});
        }
      };
        bound.selection = (e) => {
            if (!active) return;
            if (e.target.closest('#accessibility-panel, #accessibility-btn')) return;

            // Pequeno delay para garantir que a seleção foi completada
            setTimeout(() => {
                const selectedText = window.getSelection().toString().trim();

                // Só fala se tiver texto selecionado (mais de 1 caractere)
                if (selectedText && selectedText.length > 1) {
                    leitor.cancel();
                    leitor.speak(selectedText).catch(() => { });
                    console.log('📝 Texto selecionado:', selectedText.substring(0, 50));
                }
            }, 10);
        };
      document.addEventListener('mouseup', bound.selection); // ✨ NOVO
      document.addEventListener('mouseover', bound.mouseover, { passive: true });
      document.addEventListener('focusin', bound.focusin, true);
      document.addEventListener('click', bound.click, { passive: true });
      
      // Ativa MutationObserver para conteúdo dinâmico
      setupMutationObserver(root);
      
      // Anexa cursor pointer aos elementos existentes
      attachEventsToElement(root);
      
      console.log('LeitorAcessivel ativado');
    }

    function deactivate() {
      if (!active) return;
      active = false;
      saveState();
      
          
      if (bound.mouseover){ document.removeEventListener('mouseover', bound.mouseover); bound.mouseover = null; }
      if (bound.focusin) {document.removeEventListener('focusin', bound.focusin, true); bound.focusin = null; }
      if (bound.click) {document.removeEventListener('click', bound.click, true); bound.click = null; }
      if (bound.selection) { 
            document.removeEventListener('mouseup', bound.selection);
            bound.selection = null;
    }

      // Desconecta MutationObserver
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      leitor.cancel();
      console.log('LeitorAcessivel desativado');
    }

    function toggle() {
      if (active) {
        deactivate();
      } else {
        activate();
      }
      return active;
    }

    function isActive() { 
      return active; 
    }
    
    // Auto-ativa se estava ativo na última sessão
    if (opts.autoRestore !== false && loadState()) {
      // Aguarda DOM carregar completamente
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', activate);
      } else {
        activate();
      }
    }

    return {
      leitor,
      activate,
      deactivate,
      toggle,
      isActive
    };
  }

  // ============================================================
  // Expõe API global
  // ============================================================
  
  window.LeitorAcessivel = LeitorAcessivel;
  window.createLeitorInstance = () => new LeitorAcessivel();
  window.initLeitorAcessivel = initLeitorAcessivel;
  
  console.log('LeitorAcessivel carregado. Use initLeitorAcessivel() para iniciar.');
})();
