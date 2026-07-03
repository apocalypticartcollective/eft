// assets/js/toggle-order.js
// Toggle the home post order (newest-first <-> oldest-first).
// - Persists choice in localStorage key 'posts-order' with values 'desc' (newest-first) or 'asc' (oldest-first).
// - Button text shows the action (what will happen when clicked): "Oldest First" when currently newest-first, and vice versa.
// - While the toggle is hovered/focused the post list is dimmed; hovering a post highlights it.

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

  // Helpers
  function isAsc() {
    return localStorage.getItem(STORAGE_KEY) === 'asc';
  }
  function setPrefAsc(v) {
    localStorage.setItem(STORAGE_KEY, v ? 'asc' : 'desc');
  }

  function setButtonText() {
    // Button shows the action: if current is newest-first (desc), button says "Oldest First"
    var currentlyAsc = isAsc();
    btn.textContent = currentlyAsc ? 'Newest First' : 'Oldest First';
    btn.setAttribute('aria-pressed', String(currentlyAsc));
  }

  function reverseListDom() {
    // Reverse the DOM order of immediate <li> children
    var nodes = Array.prototype.slice.call(list.children);
    for (var i = nodes.length - 1; i >= 0; i--) {
      list.appendChild(nodes[i]);
    }
  }

  function applyOrderFromPref() {
    // Default: site is newest-first (desc). If pref is asc, reverse once.
    var prefAsc = isAsc();
    if (prefAsc) reverseListDom();
    setButtonText();
  }

  // Toggle handler: reverse DOM and update preference
  btn.addEventListener('click', function (ev) {
    ev.preventDefault();
    // Reverse DOM
    reverseListDom();
    // Toggle pref
    var nowAsc = !isAsc();
    setPrefAsc(nowAsc);
    setButtonText();
    // ensure keyboard focus remains on the button
    btn.focus();
  });

  // Dim interaction: when button hovered/focused, dim the list; hovering individual items highlights them
  function addDimBehavior() {
    function addDim() { list.classList.add('dimmed'); }
    function removeDim() {
      list.classList.remove('dimmed');
      Array.prototype.forEach.call(list.children, function (li) { li.classList.remove('hovered'); });
    }

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
