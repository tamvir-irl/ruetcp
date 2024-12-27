export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "RUET CP PEOPLE",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Contests",
      href: "/contests",
    },
    {
      label: "Rating",
      href: "/rating",
    },
    {
      label: "Resources",
      href: "/resources",
    },
  ],

  links: {
    discord: "https://discord.gg/8q5UvbDNHX",
    codeforces: "https://codeforces.com/group/vbb0gSG3se",
    api: "http://localhost:8080/api"
  },
};
