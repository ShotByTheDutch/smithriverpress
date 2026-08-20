// Smith River Press — shared site data
// Edit THIS file to change the site's nav menus or footer text everywhere.
// Every page pulls from here via /assets/site-nav.js — nothing else needs
// to change when you add a book, article, or app.
//
// Each menu in NAV_MENUS becomes one dropdown button in the header. An
// empty `items` array (like Articles below) shows a plain "nothing yet"
// message in the dropdown instead of a list.
//
// Add `status: "Coming soon"` (or any short label) to an item to show a
// small tag next to its title -- leave it off once the page is finished.

const NAV_MENUS = [
  {
    title: "Publications",
    href: "/publications/",
    items: [
      {
        title: "Cain Lackey — The Road to Grace",
        desc: "A story of hardship and redemption from the Blue Ridge foothills.",
        href: "/publications/cain-lackey/",
        status: "Coming soon"
      },
      {
        title: "Martinsville in the Civil War",
        desc: "A local history of Martinsville and Henry County during the war years.",
        href: "/publications/martinsville-in-the-civil-war/",
        status: "Coming soon"
      }
      // Add more books here as they go live.
    ]
  },
  {
    title: "Articles",
    href: "/articles/",
    items: [
      // No articles posted yet. Add entries here in the same shape as
      // Publications/Apps once the first one is ready.
    ]
  },
  {
    title: "Apps & Databases",
    href: "/apps/",
    items: [
      {
        title: "Henry County Patriots",
        desc: "A lookup tool for Revolutionary War patriots connected to Henry County.",
        href: "/apps/patriot-data/henry-county-virginia/"
      },
      {
        title: "More Apps & Databases",
        desc: "Additional lookup tools and county databases are in progress.",
        href: "/apps/coming-soon/",
        status: "In progress"
      }
      // Add more county databases/apps here as they go live.
    ]
  }
];

const FOOTER_LINE_1 = "Smith River Press &middot; Est. in Southern Virginia";