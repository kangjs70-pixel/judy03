export type ToneType = "empathy" | "standard" | "firm";
export type ChannelType = "official_letter" | "sms_notice" | "phone_script";

export interface RelevantLaw {
  lawName: string;
  article: string;
  description: string;
  url?: string;
}

export interface AlternativeExpression {
  original: string;
  suggested: string;
  reason: string;
}

export interface CivilResponseData {
  threeLineSummary: string[];
  extractedKeywords: string[];
  responseTitle: string;
  generatedResponse: string;
  relevantLaws: RelevantLaw[];
  communicationTips: string[];
  alternativeExpressions: AlternativeExpression[];
  timestamp?: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: "교통·도로" | "환경·소음" | "정보공개" | "악성·반복" | "시설·보수" | "일반행정";
  tone: ToneType;
  channel: ChannelType;
  summary: string;
  content: string;
  isOfficial: boolean;
  department?: string;
  tags: string[];
  lastUpdated?: string;
}

export interface SampleComplaint {
  id: string;
  title: string;
  category: string;
  recommendedTone: ToneType;
  recommendedChannel: ChannelType;
  text: string;
  keywords: string[];
}

export interface PolishResult {
  polishedText: string;
  corrections: Array<{
    original: string;
    refined: string;
    tip: string;
  }>;
  politeScore: number;
  toneAssessment: string;
  detectedPII: string[];
  isPiiMasked: boolean;
}
