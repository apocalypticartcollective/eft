// assets/js/toggle-order.js
// Toggle the home post order (newest-first <-> oldest-first).
// - Persists choice in localStorage key 'posts-order' with values 'desc' (newest-first) or 'asc' (oldest-first).
// - Button text shows the action (what will happen when clicked).
// - While the toggle is hovered/focused the post list is dimmed; hovering a post highlights it.
//
// Logic:
// - Posts are served in chronological order (oldest first) by Jekyll/Liquid
// - isAsc() = true: oldest first (default, no reversal needed)
// - isAsc() = false: newest first (need to reverse DOM)
// - Button text describes what WILL happen when clicked (toggle to opposite state)
//
// Fixes:
// - Avoids leaving the toggle focused after click (btn.blur()) so the "dimmed" state doesn't persist on mobile.
// - Guards localStorage access with try/catch for browsers/private modes that disable storage.
// - Adds pointerup/touchend handlers to ensure dim is cleared after touch interactions.

(function () {
  var STORAGE_KEY = 'posts-order';
  var DEFAULT_ORDER = 'asc'; // Default to oldest-first (chronological order)
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
    var stored = safeGet(STORAGE_KEY);
    return stored === null ? DEFAULT_ORDER === 'asc' : stored === 'asc';
  }
  function setPrefAsc(v) {
    safeSet(STORAGE_KEY, v ? 'asc' : 'desc');
  }

 function setButtonText() {
  var currentlyAsc = isAsc();
  // Label describes the ACTION (what clicking will do), i.e. the opposite of current state
  btn.textContent = currentlyAsc ? '(Show me: newest to oldest)' : '(Show me: oldest to newest)';
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
  // Jekyll serves site.posts newest-first (reverse-chronological) natively.
  // prefAsc = true (oldest-first desired): reverse the native DOM order.
  // prefAsc = false (newest-first desired): native order already matches, no change.
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
    // extra delayed blur for stubborn browsers
    setTimeout(function () { try { btn.blur(); } catch (e) {} }, 20);
    // Ensure the dimmed state is removed after toggling so mobile doesn't stay faded
    removeDim();
  });

  // Clear dim on pointerup/touchend as a safety net for touch interactions
  try {
    btn.addEventListener('pointerup', function () { removeDim(); try { btn.blur(); } catch (e) {} });
  } catch (e) { /* pointer events may not be supported */ }
  try {
    btn.addEventListener('touchend', function () { removeDim(); try { btn.blur(); } catch (e) {} }, { passive: true });
  } catch (e) { /* ignore */ }

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
