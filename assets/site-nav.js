// Smith River Press — shared nav + footer renderer.
// Builds the "Apps & Databases" dropdown and the footer from the data in
// /assets/nav-data.js. Any page just needs:
//   <div id="nav-dropdown-mount"></div>   (where the dropdown should appear)
//   <footer id="site-footer-mount"></footer>
// plus these two scripts loaded, in this order, after nav-data.js:
//   <script src="/assets/nav-data.js"></script>
//   <script src="/assets/site-nav.js"></script>

(function () {
  "use strict";

  function renderNavDropdown(mount) {
    if (!mount || typeof NAV_ITEMS === "undefined") return;

    var itemsHtml = NAV_ITEMS.map(function (item) {
      return (
        '<a class="nav-dropdown__item" role="menuitem" href="' + item.href + '">' +
          '<span class="nav-dropdown__item-title">' + item.title + '</span>' +
          '<span class="nav-dropdown__item-desc">' + item.desc + '</span>' +
        '</a>'
      );
    }).join('');

    mount.innerHTML =
      '<div class="nav-dropdown" id="explore-dropdown">' +
        '<button type="button" class="nav-dropdown__toggle" id="explore-toggle" aria-haspopup="true" aria-expanded="false">' +
          'Apps &amp; Databases ' +
          '<span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>' +
        '</button>' +
        '<div class="nav-dropdown__menu" id="explore-menu" role="menu" aria-labelledby="explore-toggle">' +
          itemsHtml +
        '</div>' +
      '</div>';

    var dropdown = mount.querySelector('#explore-dropdown');
    var toggle = mount.querySelector('#explore-toggle');

    function closeDropdown() {
      dropdown.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function openDropdown() {
      dropdown.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (dropdown.classList.contains('is-open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDropdown();
        toggle.focus();
      }
    });
  }

  function renderFooter(mount) {
    if (!mount || typeof FOOTER_LINE_1 === "undefined") return;
    var year = new Date().getFullYear();
    mount.innerHTML = FOOTER_LINE_1 + '<br>&copy; ' + year + ' Smith River Press. All rights reserved.';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderNavDropdown(document.getElementById('nav-dropdown-mount'));
    renderFooter(document.getElementById('site-footer-mount'));
  });
})();