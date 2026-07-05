import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("P1 content reduction source contracts", () => {
  it("keeps skill-learning route and FAQ guidance inside nested folds", () => {
    const skillLearning = read("src/app/skill-learning/page-shell.tsx");
    const globals = read("src/app/globals.css");

    expect(skillLearning).toContain("skill-learning-path-fold-list");
    expect(skillLearning).toContain("skill-learning-geo-fold-list");
    expect(skillLearning).toContain("skill-learning-outcome-fold-list");
    expect(skillLearning).toContain("ProductSeoDisclosure");
    expect(skillLearning).toContain("buildFaqSchema");
    expect(globals).toContain(".skill-learning-path-fold-list");
    expect(globals).toContain(".skill-learning-outcome-fold-list");
  });

  it("folds AI topic intent paths and comparison guidance without removing schema", () => {
    const aiTopics = read("src/app/ai-topics/page-shell.tsx");

    expect(aiTopics).toContain("TopicContentFold");
    expect(aiTopics).toContain("ai-topic-intent-grid");
    expect(aiTopics).toContain("ai-topic-comparison-fold");
    expect(aiTopics).toContain("buildAiTopicCollectionSchema");
    expect(aiTopics).toContain("buildFaqSchema");
  });

  it("keeps Build Your Own X learning context folded before the interactive navigator", () => {
    const byox = read("src/app/build-your-own-x/page-shell.tsx");
    const globals = read("src/app/globals.css");

    expect(byox).toContain("byox-fit-fold");
    expect(byox.indexOf('className="byox-fit-fold"')).toBeLessThan(
      byox.indexOf("<BuildYourOwnXNavigator"),
    );
    expect(byox).toContain("ContentFold");
    expect(globals).toContain(".byox-fit-fold .byox-fit-grid");
  });
});
