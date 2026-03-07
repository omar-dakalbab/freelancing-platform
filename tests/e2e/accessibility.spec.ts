import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicPages = [
  { path: "/", name: "Homepage" },
  { path: "/login", name: "Login" },
  { path: "/register", name: "Register" },
  { path: "/jobs", name: "Job Listing" },
];

for (const page of publicPages) {
  test.describe(`${page.name} (${page.path})`, () => {
    test("should have no WCAG AA violations", async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page: browserPage })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .exclude(".skip-a11y") // escape hatch for known third-party issues
        .analyze();

      const violations = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.length,
      }));

      expect(
        violations,
        `Found ${violations.length} accessibility violation(s):\n${JSON.stringify(violations, null, 2)}`
      ).toHaveLength(0);
    });

    test("should have no color contrast violations", async ({ page: browserPage }) => {
      await browserPage.goto(page.path);
      await browserPage.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page: browserPage })
        .withRules(["color-contrast"])
        .analyze();

      expect(results.violations).toHaveLength(0);
    });
  });
}
