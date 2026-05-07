(function () {
  var STAGGER = 0.1;
  var SECTION_GAP = 200;
  var pending = [];
  var rafId = null;
  var revealed = {};

  function isRevealed() { return !!revealed[location.pathname]; }
  function markRevealed() { revealed[location.pathname] = true; }

  var _push = history.pushState.bind(history);
  history.pushState = function (state, unused, url) {
    markRevealed();
    return _push(state, unused, url);
  };

  var _replace = history.replaceState.bind(history);
  history.replaceState = function (state, unused, url) {
    markRevealed();
    return _replace(state, unused, url);
  };

  window.addEventListener('popstate', markRevealed);

  function revealImmediate(el) {
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }

  function processBatch() {
    if (!pending.length) return;
    pending.sort(function (a, b) { return a.top - b.top; });
    var running = 0;
    var prevTop = pending[0].top;
    for (var i = 0; i < pending.length; i++) {
      var item = pending[i];
      if (item.top - prevTop > SECTION_GAP) running = 0;
      prevTop = item.top;
      var el = item.el;
      var base = parseFloat(el.style.transitionDelay) || 0;
      var eff = Math.max(base, running);
      el.style.transitionDelay = eff + 's';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
      running = eff + STAGGER;
    }
    pending = [];
  }

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        pending.push({ el: entries[i].target, top: entries[i].boundingClientRect.top });
        observer.unobserve(entries[i].target);
      }
    }
    if (pending.length && !rafId) {
      rafId = requestAnimationFrame(function () { processBatch(); rafId = null; });
    }
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });

  function processElement(el) {
    if (isRevealed() || el.getBoundingClientRect().bottom < 0) {
      revealImmediate(el);
    } else {
      observer.observe(el);
    }
  }

  function observeAll(root) {
    root.querySelectorAll('[data-reveal]').forEach(processElement);
  }

  observeAll(document);

  var rootEl = document.getElementById('root');
  if (rootEl) {
    new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          if (nodes[j].nodeType !== 1) continue;
          if (nodes[j].hasAttribute('data-reveal')) processElement(nodes[j]);
          observeAll(nodes[j]);
        }
      }
    }).observe(rootEl, { childList: true, subtree: true });
  }
})();
