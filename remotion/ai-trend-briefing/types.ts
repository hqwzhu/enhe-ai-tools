export type AiTrendVideoScene = {
  title: string;
  body: string;
  heat?: number | null;
  accent?: string | null;
};

export type AiTrendVideoProps = {
  date: string;
  title: string;
  coreConclusion: string;
  summary: string;
  sourceCount: number;
  directions: string[];
  scenes: AiTrendVideoScene[];
};
