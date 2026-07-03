// assets/js/toggle-order.js
// Toggle the home post order (newest-first <-> oldest-first).
// - Persists choice in localStorage key 'posts-order' with values 'desc' (newest-first) or 'asc' (oldest-first).
// - Button text shows the action (what will happen when clicked): "Oldest First" when currently newest-first, and vice versa.
// - While the toggle is hovered/focused the post list is dimmed; hovering a post highlights it.
//
// Fixes:
// - Avoids leaving the toggle focused after click (btn.blur()) so the "dimmed" state doesn't persist on mobile.
// - Guards localStorage access with try/catch for browsers/private modes that disable storage.

(function () {
  var STORAGE_KEY = 'posts-order';
  var list = document.getElementById('post-list');
  var btn = document.getElementById('toggle-post-order');
  if (!list || !btn) return;

  // Prepare stable original index on each li
  var items = Array.prototype.slice.call(list.children);
  items.forEach(function (li, idx) {
    if (!li.hasAttribute('data-original-index')) li.setAttribute('data-original-index', idx);
  });

  // Storage helpers (fallback to in-memory when localStorage is unavailable)
  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return (window.__postsOrderPref || null);
    }
  }
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // fallback to in-memory global for this session
      window.__postsOrderPref = value;
    }
  }

  function isAsc() {
    return safeGet(STORAGE_KEY) === 'asc';
  }
  function setPrefAsc(v) {
    safeSet(STORAGE_KEY, v ? 'asc' : 'desc');
  }

  function setButtonText() {
    var currentlyAsc = isAsc();
    btn.textContent = currentlyAsc ? 'Newest First' : 'Oldest First';
    btn.setAttribute('aria-pressed', String(currentlyAsc));
  }

  function reverseListDom() {
    var nodes = Array.prototype.slice.call(list.children);
    for (var i = nodes.length - 1; i >= 0; i--) {
      list.appendChild(nodes[i]);
    }
  }

  function applyOrderFromPref() {
    var prefAsc = isAsc();
    if (prefAsc) reverseListDom();
    setButtonText();
  }

  // Dim / highlight helpers placed in outer scope so click can clear them
  function addDim() { list.classList.add('dimmed'); }
  function removeDim() {
    list.classList.remove('dimmed');
    Array.prototype.forEach.call(list.children, function (li) { li.classList.remove('hovered'); });
  }

  // Toggle handler: reverse DOM and update preference
  btn.addEventListener('click', function (ev) {
    ev.preventDefault();
    reverseListDom();
    var nowAsc = !isAsc();
    setPrefAsc(nowAsc);
    setButtonText();
    // On many mobile browsers the element keeps focus after touch; blur to remove lingering :focus styles
    try { btn.blur(); } catch (e) { /* ignore */ }
    // Ensure the dimmed state is removed after toggling so mobile doesn't stay faded
    removeDim();
  });

  // Dim interaction: when button hovered/focused, dim the list; hovering individual items highlights them
  function addDimBehavior() {
    btn.addEventListener('mouseenter', addDim);
    btn.addEventListener('mouseleave', removeDim);
    btn.addEventListener('focus', addDim);
    btn.addEventListener('blur', removeDim);

    // When dimmed, hovering a post should highlight it
    Array.prototype.forEach.call(list.children, function (li) {
      var link = li.querySelector('a') || li;
      link.addEventListener('mouseenter', function () {
        if (list.classList.contains('dimmed')) {
          li.classList.add('hovered');
        }
      });
      link.addEventListener('mouseleave', function () {
        li.classList.remove('hovered');
      });
      // keyboard: when a post link receives focus, highlight it while dimmed
      link.addEventListener('focus', function () {
        if (list.classList.contains('dimmed')) li.classList.add('hovered');
      }, true);
      link.addEventListener('blur', function () {
        li.classList.remove('hovered');
      }, true);
    });
  }

  // Initialize
  applyOrderFromPref();
  addDimBehavior();
})();
