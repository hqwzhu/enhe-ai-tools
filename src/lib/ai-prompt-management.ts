export type AiPromptManagementPrompt = {
  id: string;
  category: string;
  title: string;
  summary: string;
  prompt: string;
  tags: string[];
};

export type AiPromptManagementDataset = {
  generatedAt: string;
  total: number;
  categories: string[];
  entries: AiPromptManagementPrompt[];
};

export function filterAiPromptManagementPrompts(
  prompts: AiPromptManagementPrompt[],
  input: {
    query: string;
    category: string;
    allLabel: string;
  },
) {
  const query = input.query.trim().toLocaleLowerCase();

  return prompts.filter((prompt) => {
    if (
      input.category &&
      input.category !== input.allLabel &&
      prompt.category !== input.category
    ) {
      return false;
    }
    if (!query) return true;

    return [
      prompt.title,
      prompt.summary,
      prompt.prompt,
      prompt.tags.join(" "),
    ]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query);
  });
}
