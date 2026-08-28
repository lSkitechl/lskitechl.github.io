// Single list driving the nav / module browser — add an entry here and it shows up everywhere.
export interface SiteModule {
  id: string;
  slug: string;
  title: string;
  order: number;
  enabled: boolean;
}

export const modules: SiteModule[] = [
  { id: "projects", slug: "/projects", title: "PROJECTS", order: 10, enabled: true },
  { id: "tools", slug: "/tools", title: "TOOLS", order: 20, enabled: true },
  { id: "gaming", slug: "/gaming", title: "GAMING", order: 30, enabled: true },
  { id: "lab", slug: "/lab", title: "LAB", order: 40, enabled: false },
  { id: "about", slug: "/about", title: "ABOUT", order: 50, enabled: true },
];
