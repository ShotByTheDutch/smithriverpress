(function () {
  "use strict";

  var PAGE_SIZE = 20;

  // ---------------------------------------------------------------
  // Tabs
  // ---------------------------------------------------------------
  var tabBrowse = document.getElementById("tab-browse");
  var tabSearch = document.getElementById("tab-search");
  var panelBrowse = document.getElementById("panel-browse");
  var panelSearch = document.getElementById("panel-search");

  function activateTab(name) {
    var browseActive = name === "browse";
    tabBrowse.setAttribute("aria-selected", String(browseActive));
    tabSearch.setAttribute("aria-selected", String(!browseActive));
    panelBrowse.classList.toggle("is-hidden", !browseActive);
    panelSearch.classList.toggle("is-hidden", browseActive);
  }

  tabBrowse.addEventListener("click", function () { activateTab("browse"); });
  tabSearch.addEventListener("click", function () {
    activateTab("search");
    document.getElementById("q-first").focus();
  });

  // ---------------------------------------------------------------
  // Populate service-type dropdown from data.js
  // ---------------------------------------------------------------
  var typeSelect = document.getElementById("q-type");
  SERVICE_TYPES.forEach(function (t) {
    var opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    typeSelect.appendChild(opt);
  });

  // ---------------------------------------------------------------
  // Rendering helpers shared by Browse & Search
  // ---------------------------------------------------------------
  function displayName(r) {
    var name = r.last.toUpperCase() + ", " + r.first;
    return name;
  }

  function isRefused(r) {
    return r.tags.indexOf("Refused Oath") !== -1;
  }

  function sealSvg(refused, extraClass) {
    return (
      '<svg class="seal ' + (extraClass || "") + (refused ? " is-refused" : "") + '" viewBox="0 0 64 64" aria-hidden="true">' +
      '<use href="#tricorn-shape"></use>' +
      "</svg>"
    );
  }

  function tagChipsHtml(tags) {
    return tags
      .map(function (t) {
        var refusedClass = t === "Refused Oath" ? " is-refused" : "";
        return '<span class="tag-chip' + refusedClass + '">' + escapeHtml(t) + "</span>";
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderRow(r) {
    var li = document.createElement("li");
    li.className = "ledger-row";
    var refused = isRefused(r);
    var hasNote = !!(r.doss_notes && r.doss_notes.trim());
    li.innerHTML =
      sealSvg(refused) +
      '<div class="ledger-row__body">' +
      '<p class="ledger-row__name">' +
      escapeHtml(displayName(r)) +
      (r.prefix ? ' <span class="prefix">' + escapeHtml(r.prefix) + "</span>" : "") +
      (hasNote ? ' <span class="note-flag" title="Has a Doss note">&#9998; Note</span>' : "") +
      "</p>" +
      '<div class="ledger-tags">' + tagChipsHtml(r.tags) + "</div>" +
      '<p class="ledger-row__snippet">' + escapeHtml(r.detail || r.source) + "</p>" +
      "</div>" +
      '<button class="ledger-row__action" data-id="' + r.id + '">View record &rarr;</button>';
    return li;
  }

  function renderList(container, items) {
    container.innerHTML = "";
    var frag = document.createDocumentFragment();
    items.forEach(function (r) { frag.appendChild(renderRow(r)); });
    container.appendChild(frag);
  }

  function renderPager(container, page, totalPages, onGo) {
    container.innerHTML = "";
    if (totalPages <= 1) return;
    var prev = document.createElement("button");
    prev.textContent = "\u2039 Prev";
    prev.disabled = page <= 1;
    prev.addEventListener("click", function () { onGo(page - 1); });

    var folio = document.createElement("span");
    folio.className = "folio";
    folio.textContent = "Folio " + page + " of " + totalPages;

    var next = document.createElement("button");
    next.textContent = "Next \u203a";
    next.disabled = page >= totalPages;
    next.addEventListener("click", function () { onGo(page + 1); });

    container.appendChild(prev);
    container.appendChild(folio);
    container.appendChild(next);
  }

  // Event delegation for "View record" buttons
  function wireRowClicks(container) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest(".ledger-row__action");
      if (!btn) return;
      var id = Number(btn.getAttribute("data-id"));
      var record = PATRIOTS.find(function (r) { return r.id === id; });
      if (record) openModal(record);
    });
  }

  // ---------------------------------------------------------------
  // Browse
  // ---------------------------------------------------------------
  var browseList = document.getElementById("browse-list");
  var browsePager = document.getElementById("browse-pager");
  var browseCount = document.getElementById("browse-count");
  var browseSort = document.getElementById("browse-sort");
  var browsePage = 1;

  function sortedPatriots() {
    var arr = PATRIOTS.slice();
    var mode = browseSort.value;
    if (mode === "first-asc") {
      arr.sort(function (a, b) {
        return a.first.toUpperCase().localeCompare(b.first.toUpperCase()) ||
               a.last.toUpperCase().localeCompare(b.last.toUpperCase());
      });
    } else if (mode === "source") {
      arr.sort(function (a, b) {
        return a.source.localeCompare(b.source) ||
               a.last.toUpperCase().localeCompare(b.last.toUpperCase());
      });
    }
    // default: already sorted last-asc from data.js generation, but re-sort
    // defensively in case order was disturbed.
    else {
      arr.sort(function (a, b) {
        return a.last.toUpperCase().localeCompare(b.last.toUpperCase()) ||
               a.first.toUpperCase().localeCompare(b.first.toUpperCase());
      });
    }
    return arr;
  }

  function renderBrowsePage(page) {
    var arr = sortedPatriots();
    var totalPages = Math.max(1, Math.ceil(arr.length / PAGE_SIZE));
    browsePage = Math.min(Math.max(1, page), totalPages);
    var start = (browsePage - 1) * PAGE_SIZE;
    var slice = arr.slice(start, start + PAGE_SIZE);

    browseCount.textContent =
      "Showing " + (start + 1) + "\u2013" + (start + slice.length) +
      " of " + arr.length + " records";

    renderList(browseList, slice);
    renderPager(browsePager, browsePage, totalPages, function (p) {
      renderBrowsePage(p);
      panelBrowse.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  browseSort.addEventListener("change", function () { renderBrowsePage(1); });
  wireRowClicks(browseList);

  // ---------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------
  var searchForm = document.getElementById("search-form");
  var searchList = document.getElementById("search-list");
  var searchPager = document.getElementById("search-pager");
  var searchCount = document.getElementById("search-count");
  var searchToolbar = document.getElementById("search-toolbar");
  var searchEmpty = document.getElementById("search-empty");
  var qFirst = document.getElementById("q-first");
  var qLast = document.getElementById("q-last");
  var qClear = document.getElementById("q-clear");
  var searchPage = 1;
  var lastResults = [];

  function matchesNamePart(record, needle, structuredValue) {
    if (!needle) return true;
    if (structuredValue.toLowerCase().indexOf(needle) !== -1) return true;
    // Some records (esp. court-record entries) name several people in one
    // sentence but only the primary subject is captured in first/last --
    // fall back to the full detail text (and any curator note) so a
    // search for a name mentioned elsewhere in the entry still finds it.
    var haystack = record.detail + " " + (record.doss_notes || "");
    return haystack.toLowerCase().indexOf(needle) !== -1;
  }

  function runSearch() {
    var first = qFirst.value.trim().toLowerCase();
    var last = qLast.value.trim().toLowerCase();
    var type = typeSelect.value;

    lastResults = PATRIOTS.filter(function (r) {
      if (first && !matchesNamePart(r, first, r.first)) return false;
      if (last && !matchesNamePart(r, last, r.last)) return false;
      if (type && r.tags.indexOf(type) === -1) return false;
      return true;
    }).sort(function (a, b) {
      return a.last.toUpperCase().localeCompare(b.last.toUpperCase()) ||
             a.first.toUpperCase().localeCompare(b.first.toUpperCase());
    });

    renderSearchPage(1);
  }

  function renderSearchPage(page) {
    var totalPages = Math.max(1, Math.ceil(lastResults.length / PAGE_SIZE));
    searchPage = Math.min(Math.max(1, page), totalPages);
    var start = (searchPage - 1) * PAGE_SIZE;
    var slice = lastResults.slice(start, start + PAGE_SIZE);

    var hasQuery = qFirst.value.trim() || qLast.value.trim() || typeSelect.value;

    if (!hasQuery) {
      searchToolbar.classList.add("is-hidden");
      searchEmpty.classList.add("is-hidden");
      searchList.innerHTML = "";
      searchPager.innerHTML = "";
      return;
    }

    if (lastResults.length === 0) {
      searchToolbar.classList.add("is-hidden");
      searchEmpty.classList.remove("is-hidden");
      searchList.innerHTML = "";
      searchPager.innerHTML = "";
      return;
    }

    searchEmpty.classList.add("is-hidden");
    searchToolbar.classList.remove("is-hidden");
    searchCount.textContent =
      "Found " + lastResults.length + " matching record" + (lastResults.length === 1 ? "" : "s") +
      " \u2014 showing " + (start + 1) + "\u2013" + (start + slice.length);

    renderList(searchList, slice);
    renderPager(searchPager, searchPage, totalPages, function (p) {
      renderSearchPage(p);
      panelSearch.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    runSearch();
  });

  qClear.addEventListener("click", function () {
    qFirst.value = "";
    qLast.value = "";
    typeSelect.value = "";
    lastResults = [];
    renderSearchPage(1);
  });

  wireRowClicks(searchList);

  // ---------------------------------------------------------------
  // Modal
  // ---------------------------------------------------------------
  var overlay = document.getElementById("modal-overlay");
  var modal = document.getElementById("modal");
  var modalClose = document.getElementById("modal-close");
  var modalName = document.getElementById("modal-name");
  var modalMeta = document.getElementById("modal-meta");
  var modalTags = document.getElementById("modal-tags");
  var modalFields = document.getElementById("modal-fields");
  var modalCitation = document.getElementById("modal-citation");
  var modalNote = document.getElementById("modal-doss-note");
  var modalSeal = document.getElementById("modal-seal");
  var lastFocused = null;

  function field(dt, dd) {
    if (!dd) return "";
    return "<dt>" + escapeHtml(dt) + "</dt><dd>" + escapeHtml(dd) + "</dd>";
  }

  function openModal(r) {
    lastFocused = document.activeElement;
    var refused = isRefused(r);

    modalSeal.classList.toggle("seal--modal", true);
    modalSeal.classList.toggle("is-refused", refused);

    modalName.textContent = displayName(r) + (r.prefix ? ", " + r.prefix : "");
    modalMeta.textContent = r.source + (r.sourceList ? " \u2014 " + r.sourceList : "");
    modalTags.innerHTML = tagChipsHtml(r.tags);

    modalFields.innerHTML =
      field("Also recorded as", r.alternate) +
      field("Rank", r.rank) +
      field("Service detail", r.detail) +
      field("Dates", r.dates);

    modalCitation.textContent = r.citation;

    if (r.doss_notes && r.doss_notes.trim()) {
      modalNote.textContent = r.doss_notes;
      modalNote.classList.remove("is-hidden");
    } else {
      modalNote.textContent = "";
      modalNote.classList.add("is-hidden");
    }

    overlay.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    overlay.classList.add("is-hidden");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  modalClose.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.classList.contains("is-hidden")) closeModal();
  });

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  renderBrowsePage(1);
  renderSearchPage(1);
})();