import React from "react";
import { Composition } from "remotion";
import { AiTrendBriefingVideo } from "./AiTrendBriefingVideo";
import type { AiTrendVideoProps } from "./types";

const defaultProps: AiTrendVideoProps = {
  date: "2026-06-30",
  title: "AI 需求趋势分析",
  coreConclusion: "用户更愿意为节省时间、提升交付质量的 AI 工作流买单。",
  summary: "本期聚焦工作效率、视频生成、内容创作和搜索研究四个高频方向。",
  sourceCount: 6,
  directions: ["工作效率", "视频生成", "内容创作", "搜索研究"],
  scenes: [
    {
      title: "工作效率持续领先",
      body: "会议纪要、邮件草拟、表格清洗和流程同步，仍是最容易量化节省时间的 AI 任务。",
      heat: 96
    },
    {
      title: "视频生成保持高热",
      body: "需求从尝鲜转向批量生产、版权合规和可复用模板，创业机会集中在垂直场景。",
      heat: 92
    },
    {
      title: "搜索研究进入任务化阶段",
      body: "用户不只要答案，还要可引用来源、证据链和可交付的研究包。",
      heat: 79
    }
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AiTrendBriefing"
      component={AiTrendBriefingVideo}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={270}
      defaultProps={defaultProps}
    />
  );
};
