// Smith River Press — shared nav + footer renderer.
// Builds the header's dropdown tabs (Publications / Articles / Apps &
// Databases / etc.) and the footer from /assets/nav-data.js. Any page
// just needs:
//   <div id="nav-dropdown-mount"></div>   (where the tabs should appear)
//   <footer id="site-footer-mount"></footer>
// plus these two scripts loaded, in this order, after nav-data.js:
//   <script src="/assets/nav-data.js"></script>
//   <script src="/assets/site-nav.js"></script>

(function () {
  "use strict";

  function itemHtml(item) {
    var statusHtml = item.status
      ? '<span class="nav-dropdown__item-status">' + item.status + '</span>'
      : '';
    return (
      '<a class="nav-dropdown__item" role="menuitem" href="' + item.href + '">' +
        '<span class="nav-dropdown__item-title">' + item.title + statusHtml + '</span>' +
        '<span class="nav-dropdown__item-desc">' + item.desc + '</span>' +
      '</a>'
    );
  }

  function emptyMenuHtml(menu) {
    return (
      '<p class="nav-dropdown__empty">Nothing posted here yet &mdash; check back soon.</p>'
    );
  }

  function renderNavMenus(mount) {
    if (!mount || typeof NAV_MENUS === "undefined") return;

    var html = NAV_MENUS.map(function (menu, i) {
      var id = 'nav-menu-' + i;
      var innerHtml = (menu.items && menu.items.length)
        ? menu.items.map(itemHtml).join('')
        : emptyMenuHtml(menu);

      return (
        '<div class="nav-dropdown" data-nav-dropdown>' +
          '<button type="button" class="nav-dropdown__toggle" id="' + id + '-toggle" aria-haspopup="true" aria-expanded="false">' +
            menu.title + ' ' +
            '<span class="nav-dropdown__chevron" aria-hidden="true">&#9662;</span>' +
          '</button>' +
          '<div class="nav-dropdown__menu" id="' + id + '-menu" role="menu" aria-labelledby="' + id + '-toggle">' +
            innerHtml +
          '</div>' +
        '</div>'
      );
    }).join('');

    mount.innerHTML = html;

    var dropdowns = Array.prototype.slice.call(mount.querySelectorAll('[data-nav-dropdown]'));

    function closeAll(except) {
      dropdowns.forEach(function (d) {
        if (d === except) return;
        d.classList.remove('is-open');
        var t = d.querySelector('.nav-dropdown__toggle');
        if (t) t.setAttribute('aria-expanded', 'false');
      });
    }

    dropdowns.forEach(function (dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown__toggle');

      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = dropdown.classList.contains('is-open');
        closeAll();
        if (!isOpen) {
          dropdown.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', function (e) {
      var clickedInside = dropdowns.some(function (d) { return d.contains(e.target); });
      if (!clickedInside) closeAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeAll();
      }
    });
  }

  function renderFooter(mount) {
    if (!mount || typeof FOOTER_LINE_1 === "undefined") return;
    var year = new Date().getFullYear();
    mount.innerHTML = FOOTER_LINE_1 + '<br>&copy; ' + year + ' Smith River Press. All rights reserved.';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderNavMenus(document.getElementById('nav-dropdown-mount'));
    renderFooter(document.getElementById('site-footer-mount'));
  });
})();