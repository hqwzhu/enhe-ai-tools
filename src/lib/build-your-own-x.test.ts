import { describe, expect, it } from "vitest";
import {
  buildYourOwnXCategories,
  buildYourOwnXProjects,
  buildYourOwnXRoutes,
  getBuildYourOwnXProjectsByRoute,
  getBuildYourOwnXStats,
  getBuildYourOwnXTopLanguages,
} from "@/lib/build-your-own-x";

describe("Build Your Own X navigator data", () => {
  it("ships a useful static index without runtime GitHub dependency", () => {
    const stats = getBuildYourOwnXStats();

    expect(stats.projectCount).toBeGreaterThan(300);
    expect(stats.categoryCount).toBeGreaterThan(20);
    expect(stats.languageCount).toBeGreaterThan(10);
    expect(stats.routeCount).toBe(5);
  });

  it("keeps project slugs unique and source URLs valid", () => {
    const slugs = new Set<string>();

    for (const project of buildYourOwnXProjects) {
      expect(project.slug).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.has(project.slug)).toBe(false);
      expect(project.title.length).toBeGreaterThan(4);
      expect(project.category.length).toBeGreaterThan(1);
      expect(project.url).toMatch(/^https?:\/\//);
      expect(project.goals.length).toBeGreaterThan(0);
      slugs.add(project.slug);
    }
  });

  it("keeps curated routes connected to existing categories", () => {
    const categoryNames = new Set<string>(
      buildYourOwnXCategories.map((category) => category.name),
    );

    for (const route of buildYourOwnXRoutes) {
      expect(route.categories.length).toBeGreaterThan(2);
      for (const category of route.categories) {
        expect(categoryNames.has(category)).toBe(true);
      }
      expect(getBuildYourOwnXProjectsByRoute(route).length).toBeGreaterThan(5);
    }
  });

  it("exposes common language filters for the client navigator", () => {
    const topLanguages = getBuildYourOwnXTopLanguages(12).map((item) => item.name);

    expect(topLanguages).toContain("Python");
    expect(topLanguages).toContain("JavaScript");
    expect(topLanguages).toContain("C++");
  });
});
