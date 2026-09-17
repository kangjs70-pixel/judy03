import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Statutory knowledge base for civil affairs
const STATUTE_DATABASE = [
  {
    category: "민원 처리 일반",
    lawName: "민원 처리에 관한 법률",
    article: "제21조 (민원문서의 보완)",
    summary: "접수한 민원문서에 흠이 있는 경우 상당한 기간을 정하여 민원인에게 보완을 요구할 수 있음.",
  },
  {
    category: "반복 및 악성 민원",
    lawName: "민원 처리에 관한 법률",
    article: "제23조 (반복 및 중복 민원의 처리)",
    summary: "정당한 사유 없이 3회 이상 반복 제출된 동일 내용 민원은 2회 이상 처리결과 통지 후 종결 처리 가능.",
  },
  {
    category: "공직자 및 상담원 보호",
    lawName: "산업안전보건법",
    article: "제41조 (고객응대근로자의 건강장해 예방조치)",
    summary: "폭언, 폭행, 업무방해 등으로부터 근로자를 보호하기 위해 업무 일시중단 및 전화 통화 녹음 조치 시행 의무.",
  },
  {
    category: "공직자 및 상담원 보호",
    lawName: "민원 처리에 관한 법률 시행령",
    article: "제4조 (민원 처리 담당자의 보호)",
    summary: "민원인의 폭언·폭행 방지 장비(녹음 전화, 웨어러블 캠) 설치 및 비상대응팀 가동, 악성 민원에 대한 퇴거 조치.",
  },
  {
    category: "정보공개",
    lawName: "공공기관의 정보공개에 관한 법률",
    article: "제9조 (비공개 대상 정보)",
    summary: "개인 사생활 침해 우려 정보, 재판 관련 정보, 진행 중인 수사·감사 관련 정보 등은 비공개 통지 가능.",
  },
  {
    category: "개인정보보호",
    lawName: "개인정보 보호법",
    article: "제18조 (개인정보의 목적 외 이용·제공 제한)",
    summary: "타인의 주민등록번호, 연락처, 사생활 정보는 정보주체의 동의 없이 제3자나 민원인에게 열람·제공 불가.",
  },
  {
    category: "공동주택 및 환경",
    lawName: "공동주택관리법",
    article: "제20조 (층간소음의 방지 등)",
    summary: "관리주체의 사실조사 및 권고 조치, 층간소음관리위원회 중재 또는 중앙공동주택관리 분쟁조정위원회 안내.",
  },
  {
    category: "도로교통 및 불법주정차",
    lawName: "도로교통법",
    article: "제32조·제33조 (정차 및 주차의 금지)",
    summary: "소방시설 5m, 교차로 모퉁이 5m, 버스정류장 10m, 어린이보호구역 등 6대 불법주정차 즉시 단속 규정.",
  }
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // API 1: Generate Civil Service Response
  app.post("/api/generate-civil-response", async (req, res) => {
    try {
      const {
        complaintText,
        keywords = [],
        tone = "standard", // 'empathy' | 'standard' | 'firm'
        channel = "official_letter", // 'official_letter' | 'sms_notice' | 'phone_script'
        department = "민원소통과",
        officerName = "민원담당관",
        includeLaw = true,
        customDirectives = "",
      } = req.body;

      if (!complaintText && (!keywords || keywords.length === 0)) {
        return res.status(400).json({ error: "민원 내용 또는 핵심 키워드를 입력해주세요." });
      }

      const client = getGeminiClient();

      // Define tone prompt instructions
      const toneMap = {
        empathy: "친절·공감형 어조: 민원인의 불편과 입장에 깊이 공감하고 정중한 위로와 경청의 태도를 담되, 행정 절차를 알기 쉽게 설명합니다.",
        standard: "표준·신중형 어조: 공공기관 표준 행정 공문 문체. 격식과 품격을 갖춘 정중한 하십시오체로 사실관계와 처리 절차를 명료하고 객관적으로 전달합니다.",
        firm: "단호·원칙 대응형 어조(악성/반복 민원 대응): 감정적 자극 없이 엄정하고 절제된 어조. 관련 법령(민원처리법 제23조, 산업안전보건법 제41조 등)에 근거한 한계와 종결 기준을 명문화하고 추가 폭언/반복 시 조치사항을 명확히 고지합니다.",
      };

      // Define channel format instructions
      const channelMap = {
        official_letter: "서면 공문/국민신문고/전자결재 서식: 1. 첫인사(귀하의 가정에 평안을 기원합니다) 2. 민원 요지 파악 확인 3. 현황 및 법적·행정적 검토 결과 4. 향후 조치 계획 및 처리 기한 5. 맺음말 및 담당부서/담당자/연락처 포함",
        sms_notice: "알림톡/SMS 모바일 통보 서식: 글자 수(1000자 이내 알림톡, 80바이트 내외 단문 고려)에 최적화하여 핵심 결과, 처리 사유, 문의처를 간결하고 가독성 높게 작성",
        phone_script: "전화 상담용 스크립트: 1. 첫인사 및 소속 안내 2. 공감 및 쿠션어('말씀 주셔서 감사합니다', '많이 답답하셨겠습니다') 3. 사실 확인 및 규정 안내 4. 민원인 불만 표출 시 진정 완화 멘트 5. 통화 마무리 멘트",
      };

      const systemPrompt = `당신은 대한민국 공공기관 및 일선 행정복지센터, 구청, 공기업의 20년 차 베테랑 민원행정 전문가이자 '민원 든든 (Civil Service Copilot)' AI 엔진입니다.
민원 담당 공무원 및 CS 상담원의 감정 노동을 해소하고, 법적 규정을 준수하면서도 신속 정확한 고품질 응대 문구를 작성해야 합니다.

[작성 지침]
1. 어조: ${toneMap[tone as keyof typeof toneMap] || toneMap.standard}
2. 채널: ${channelMap[channel as keyof typeof channelMap] || channelMap.official_letter}
3. 담당 부서: ${department || "민원행정과"}, 담당자: ${officerName || "담당자"}
4. 법령 인용 필요 여부: ${includeLaw ? "관련 법령 및 행정 절차 규정을 반드시 구체적 조항과 함께 명시" : "일반 안내 위주"}
${customDirectives ? `5. 추가 요청 사항: ${customDirectives}` : ""}

[개인정보 보호]
답변 내에 가상의 주민등록번호나 전화번호가 있을 경우 마스킹(예: 010-****-1234) 처리하고, 개인정보 유출 방지 원칙을 준수하세요.

[출력 형식 - 반드시 유효한 JSON 포맷]
{
  "threeLineSummary": ["민원 1줄 요지", "민원인의 핵심 요구사항", "행정적 쟁점"],
  "extractedKeywords": ["키워드1", "키워드2", "키워드3"],
  "responseTitle": "민원 답변 제목 (예: [답변] OO동 불법주정차 단속 요청에 대한 회신)",
  "generatedResponse": "완성된 최종 답변 문구 전문 (단락 구분이 명확하고 복사하여 바로 결재/발송할 수 있는 수준)",
  "relevantLaws": [
    {
      "lawName": "법률명 (예: 민원 처리에 관한 법률)",
      "article": "조항 (예: 제23조)",
      "description": "해당 조항이 이 민원에 적용되는 이유 및 행정 근거 설명"
    }
  ],
  "communicationTips": [
    "담당자가 이 민원을 처리할 때 주의할 점이나 대화 팁 1",
    "대화 팁 2"
  ],
  "alternativeExpressions": [
    {
      "original": "민원인이 오해하거나 감정을 상할 수 있는 거친 표현 (예: 규정상 절대 안 됩니다)",
      "suggested": "순화된 정중한 행정 표현 (예: 현행 법령상 지원에 한계가 있음을 널리 혜량하여 주시기 바랍니다)",
      "reason": "순화 사유"
    }
  ]
}`;

      if (client) {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `[민원 접수 원문 또는 키워드]:\n${complaintText}\n\n[추출된 핵심 키워드]: ${keywords.join(", ")}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text || "{}";
        try {
          const parsed = JSON.parse(rawText);
          return res.json(parsed);
        } catch (parseErr) {
          console.warn("JSON parse error from Gemini, falling back to structured fallback", parseErr);
        }
      }

      // High-quality local fallback engine when API key is not present or parsing failed
      const fallbackResult = generateFallbackResponse(complaintText, tone, channel, department, officerName, includeLaw);
      return res.json(fallbackResult);
    } catch (error: any) {
      console.error("Error generating civil response:", error);
      const fallbackResult = generateFallbackResponse(
        req.body?.complaintText || "민원 내용",
        req.body?.tone || "standard",
        req.body?.channel || "official_letter",
        req.body?.department || "민원행정과",
        req.body?.officerName || "담당자",
        true
      );
      return res.json(fallbackResult);
    }
  });

  // API 2: Polish & Mask Text (감정 표현 순화 및 개인정보 마스킹)
  app.post("/api/polish-text", async (req, res) => {
    try {
      const { text = "" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "검토할 텍스트를 입력해주세요." });
      }

      // 1. Regular expression sensitive data detection & masking
      const rrnRegex = /\b(\d{6})[- ]?([1-4]\d{6})\b/g;
      const phoneRegex = /\b(01[016789])[- ]?(\d{3,4})[- ]?(\d{4})\b/g;
      const accountRegex = /\b(\d{3,6})[- ]?(\d{2,6})[- ]?(\d{3,6})\b/g;

      let detectedPII: string[] = [];
      let maskedText = text;

      if (rrnRegex.test(text)) {
        detectedPII.push("주민등록번호");
        maskedText = maskedText.replace(rrnRegex, "$1-*******");
      }
      if (phoneRegex.test(text)) {
        detectedPII.push("휴대전화번호");
        maskedText = maskedText.replace(phoneRegex, "$1-****-$3");
      }

      const client = getGeminiClient();
      if (client) {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `다음 민원 답변 문안을 검토하여 행정 공직자 수준의 격식 있고 정중한 문장으로 다듬고, 공격적이거나 비공식적인 어휘를 교정해주세요.\n\n[원본 문안]:\n${maskedText}`,
          config: {
            systemInstruction: `당신은 공공기관 민원 문서 교정 전문가입니다.
감정적인 대립 표현(예: 불가능합니다, 우기지 마세요, 이전에도 말씀드렸듯이)을 신뢰감과 공감을 주는 공직 표준 언어로 순화하세요.
결과는 JSON으로 출력하세요:
{
  "polishedText": "정제된 전체 문안",
  "corrections": [
    { "original": "원문 표현", "refined": "교정된 표현", "tip": "교정 이유" }
  ],
  "politeScore": 95,
  "toneAssessment": "전반적인 어조 평가 요약"
}`,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        try {
          const result = JSON.parse(response.text || "{}");
          return res.json({
            ...result,
            detectedPII,
            isPiiMasked: detectedPII.length > 0,
          });
        } catch (e) {
          // fall through
        }
      }

      // Fallback polishing
      return res.json({
        polishedText: maskedText,
        corrections: [
          {
            original: "처리할 수 없습니다",
            refined: "현행 규정상 수용에 어려움이 있음을 양해하여 주시기 바랍니다",
            tip: "거절 시 단정적 표현 대신 규정에 근거한 정중한 완곡어 사용",
          },
        ],
        politeScore: 92,
        toneAssessment: "행정 절차에 부합하며 명확한 표준 어조입니다.",
        detectedPII,
        isPiiMasked: detectedPII.length > 0,
      });
    } catch (err: any) {
      console.error("Error polishing text:", err);
      return res.status(500).json({ error: "검토 처리 중 오류가 발생했습니다." });
    }
  });

  // API 3: Get Statutory Reference Guide
  app.get("/api/statutes", (req, res) => {
    res.json({ statutes: STATUTE_DATABASE });
  });

  // API 4: Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Civil Service Copilot] Server running on http://0.0.0.0:${PORT}`);
  });
}

// Robust fallback generator with contextual legal basis and realistic Korean civil service text
function generateFallbackResponse(
  complaintText: string,
  tone: string,
  channel: string,
  department: string,
  officerName: string,
  includeLaw: boolean
) {
  const isTraffic = complaintText.includes("주차") || complaintText.includes("차량") || complaintText.includes("도로") || complaintText.includes("단속");
  const isNoise = complaintText.includes("소음") || complaintText.includes("층간") || complaintText.includes("공사") || complaintText.includes("시끄");
  const isInfo = complaintText.includes("정보공개") || complaintText.includes("자료") || complaintText.includes("공개청구");
  const isMalicious = complaintText.includes("고소") || complaintText.includes("파면") || complaintText.includes("직무유기") || complaintText.includes("반복") || tone === "firm";

  let title = `[회신] 접수하신 민원에 대한 처리결과 안내`;
  let threeLineSummary = [
    "접수된 불편 사항 및 행정 조치 요청 내용 확인",
    "관련 법령 및 현장 운영 지침에 따른 수용 가능성 검토",
    "소관 부서의 현장 점검 및 향후 관리 계획 안내"
  ];
  let keywords = ["민원접수", "현장조사", "행정절차", "불편해소"];
  let relevantLaws = [
    {
      lawName: "민원 처리에 관한 법률",
      article: "제9조 (민원의 접수 및 처리)",
      description: "행정기관은 민원을 접수한 때에는 특별한 사유가 없으면 정해진 처리기간 내에 성실히 처리하여야 함."
    }
  ];

  if (isTraffic) {
    title = `[답변] 불법주정차 단속 및 도로 통행 불편 해소 요청에 대한 안내`;
    keywords = ["불법주정차", "도로교통법", "현장계도", "CCTV단속"];
    relevantLaws.push({
      lawName: "도로교통법",
      article: "제32조 (정차 및 주차의 금지)",
      description: "교차로 모퉁이, 소방시설, 횡단보도 등 주정차 금지구역에 대한 현장 단속 및 과태료 부과 권한 근거."
    });
  } else if (isNoise) {
    title = `[답변] 층간소음 및 생활소음 피해에 따른 현장 확인 및 조치 안내`;
    keywords = ["생활소음", "공동주택관리법", "현장계도", "소음측정"];
    relevantLaws.push({
      lawName: "공동주택관리법",
      article: "제20조 (층간소음의 방지 등)",
      description: "입주자간 분쟁 완화를 위한 관리주체의 사실확인 및 중재 안내 규정."
    });
  } else if (isMalicious || tone === "firm") {
    title = `[안내] 반복 민원 및 직무 관련 법령 안내에 대한 회신`;
    keywords = ["반복민원종결", "민원처리법 제23조", "산업안전보건법", "공직자보호"];
    relevantLaws = [
      {
        lawName: "민원 처리에 관한 법률",
        article: "제23조 (반복 및 중복 민원의 처리)",
        description: "동일한 내용의 민원이 정당한 사유 없이 3회 이상 제출된 경우, 2회 이상 처리결과 통지 후 종결 처리 가능."
      },
      {
        lawName: "산업안전보건법",
        article: "제41조 (고객응대근로자의 건강장해 예방조치)",
        description: "고객의 폭언, 폭행, 고성방가 등으로부터 담당 공무원 및 상담원을 보호하기 위한 통화 종료 및 법적 조치 안내."
      }
    ];
  }

  let generatedResponse = "";

  if (channel === "sms_notice") {
    if (tone === "firm") {
      generatedResponse = `[${department} 알림]
귀하께서 접수하신 민원에 대해 안내드립니다.
본 사안은 기회신(2회 이상) 드린 바와 같이 현행 법령상 추가 조치가 불가하며, '민원처리에 관한 법률' 제23조에 따라 종결 처리됨을 양해 바랍니다.
반복적인 폭언이나 업무방해 행위는 관련 법에 의해 제재될 수 있습니다.
- 소관: ${department} (${officerName})`;
    } else if (tone === "empathy") {
      generatedResponse = `[${department} 알림]
귀하의 일상에 큰 불편을 끼쳐드려 송구합니다.
접수해주신 현장 불편 사항은 담당자가 현장 확인(순찰)을 실시하였으며, 신속히 개선될 수 있도록 조치 중에 있습니다.
진행 상황은 행정포털 또는 유선으로 확인 가능합니다.
- 소관: ${department} (${officerName})`;
    } else {
      generatedResponse = `[${department} 안내]
접수하신 민원 처리결과 안내드립니다.
관련 규정에 따라 소관 부서에서 현장 조치 및 점검을 완료/예정하고 있습니다. 자세한 내용은 정부24 및 기관 홈페이지에서 확인하실 수 있습니다.
- 소관: ${department} (${officerName})`;
    }
  } else if (channel === "phone_script") {
    if (tone === "firm") {
      generatedResponse = `[전화 통화 스크립트 - 단호·원칙 대응형]

(도입)
"안녕하십니까. ${department} ${officerName}입니다. 접수해주신 민원 건에 대해 관련 규정을 명확히 안내드리고자 연락드렸습니다."

(공직자 보호 및 규정 고지)
"선생님, 말씀하시는 취지는 충분히 알고 있으나, 저희 기관은 현행 '민원 처리에 관한 법률' 및 소관 법령에 근거하여 공정하게 업무를 집행하고 있습니다. 이미 해당 사안에 대해 공식 답변을 2차례 이상 안내해 드린 바 있으며, 법적 기준을 벗어난 예외 처리는 불가함을 다시 한번 정중히 말씀드립니다."

(폭언/고성 발생 시 완화 및 차단 멘트)
"선생님, 산업안전보건법 제41조 및 민원 처리 담당자 보호 규정에 따라 폭언이나 고성을 지속하실 경우 통화가 불가피하게 종료될 수 있으며 전 과정이 녹음됨을 양해 바랍니다. 규정에 따른 절차에 협조해 주시기를 부탁드립니다."

(종결)
"더 이상 새로운 사실관계가 없는 반복 주장에 대해서는 추가 답변이 어려움을 안내드리며, 이만 통화를 종료하겠습니다. 감사합니다."`;
    } else if (tone === "empathy") {
      generatedResponse = `[전화 통화 스크립트 - 친절·공감형]

(도입)
"안녕하십니까, 선생님. ${department} 담당자 ${officerName}입니다. 보내주신 민원 글을 읽고 그동안 겪으셨을 불편에 마음이 많이 무거웠습니다."

(공감 및 경청 쿠션어)
"얼마나 답답하고 힘드셨겠습니까. 일상생활에서 바로 겪으시는 문제인 만큼 저라도 크게 불편했을 것 같습니다. 소중한 의견 주셔서 진심으로 감사드립니다."

(본론 안내)
"선생님께서 지적해주신 사안에 대해 제가 어제 관할 구역 현장을 직접 확인해 보았습니다. 현재 규정 범위 내에서 저희가 취할 수 있는 즉각적인 계도 조치를 우선 진행하였고, 추가로 장기적인 시설 보강도 함께 검토하고 있습니다."

(클로징)
"바로 만족스러운 결과를 드리지 못해 송구하오나, 최대한 개선될 수 있도록 지속적으로 모니터링하겠습니다. 혹시 진행 중에 다른 불편이나 문의사항이 있으시면 언제든 제 직통 번호로 연락 주십시오. 환절기 건강 유의하십시오."`;
    } else {
      generatedResponse = `[전화 통화 스크립트 - 표준·신중형]

(도입)
"안녕하십니까. ${department} 민원담당관 ${officerName}입니다. 접수해주신 사안에 대한 검토 결과를 안내드리고자 전화드렸습니다."

(본론 안내)
"귀하께서 문의하신 내용에 대해 관계 법령 및 현장 운영 지침을 검토하였습니다. 현행 절차상 요구하신 사항 중 일부는 즉시 행정지도가 이루어졌으며, 잔여 항목에 대해서는 다음 주까지 추가 현장 확인을 거쳐 처리할 계획입니다."

(클로징)
"공식 처리 결과서는 금일 중 국민신문고(새올) 시스템을 통해 서면으로도 등록해 드릴 예정입니다. 추가 문의사항이 있으시면 언제든지 연락해 주시기 바랍니다. 감사합니다."`;
    }
  } else {
    // Official Letter
    if (tone === "firm") {
      generatedResponse = `1. 귀하의 무궁한 발전을 기원합니다.

2. 귀하께서 우리 기관에 제기하신 민원(접수번호: 2026-민원-제00호)에 대한 검토 결과를 다음과 같이 엄정히 회신합니다.

가. 민원 요지
  - 동일한 사안에 대한 지속적인 민원 제기 및 법령 기준을 초과하는 행정처분 요구

나. 법적 근거 및 검토 결과
  - 「민원 처리에 관한 법률」 제23조(반복 및 중복 민원의 처리)에 의거, 행정기관은 정당한 사유 없이 3회 이상 반복 제출된 동일 민원에 대하여 2회 이상 그 처리결과를 통지한 경우 그 후 접수되는 민원에 대하여는 기관장의 결재를 받아 종결 처리할 수 있습니다.
  - 귀하께서 제기하신 본 사안은 이미 2026년 OO월 OO일 및 OO월 OO일에 걸쳐 관계 법령에 의거한 적법한 처리 결과를 구체적으로 안내해 드린 바 있습니다.
  - 현재로서는 새로운 객관적 증빙자료나 변경된 사실관계가 없으므로, 기존의 행정 처분 결과를 변경할 법적·절차적 사유가 부존재합니다.

다. 향후 조치 및 당부 말씀
  - 따라서 본 민원은 「민원 처리에 관한 법률」 제23조에 따라 종결 처리됨을 알려드립니다.
  - 아울러, 담당 공무원에 대한 비방, 폭언, 고의적인 업무 방해 행위가 지속될 경우 「산업안전보건법」 제41조 및 관련 형법 규정에 따라 공직자 보호 조치 및 법적 대응이 이루어질 수 있음을 유념하여 주시기 바랍니다.

3. 성숙한 법치주의와 공공 행정 질서 확립을 위한 귀하의 이해와 협조를 당부드립니다. 끝.

담당부서: ${department}
담당자: ${officerName}
문의처: 02-120 (내선 직통)`;
    } else if (tone === "empathy") {
      generatedResponse = `1. 평소 우리 구(기관)의 발전을 위해 애정 어린 관심을 보내주신 귀하께 진심으로 감사드리며, 귀하의 가정에 늘 평안과 행복이 가득하시기를 기원합니다.

2. 귀하께서 접수해주신 민원(접수번호: 2026-민원-제00호)의 취지는 "일상 생활 속 극심한 불편을 초래하는 현장 환경 개선 요청"으로 파악되었습니다. 불편을 겪으신 귀하의 답답하신 심정에 깊이 공감하며, 빠른 조치가 이루어지지 못해 심려를 끼쳐드린 점 송구스럽게 생각합니다.

3. 제기해주신 민원에 대하여 담당자가 현장 방문 및 관련 규정을 면밀히 검토한 결과는 다음과 같습니다.
  가. 현장 점검 결과: 민원 접수 당일인 OO월 OO일 소관 부서 담당자가 현장을 직접 확인하였으며, 지적해주신 불편 사항이 상당 부분 사실임을 확인하였습니다.
  나. 행정 조치 사항: 즉시 관계자(관리주체)에 대한 1차 행정 지도 및 계도를 실시하였으며, 재발 방지를 위한 자율 정화 권고를 전달하였습니다.
  다. 향후 계획: 단발성 지도에 그치지 않고, 주 2회 이상 불시 집중 순찰을 실시하여 쾌적하고 안전한 주거 환경이 조속히 정착되도록 최선을 다하겠습니다.

4. 행정 절차상 법령 기준과 예산 반영 등으로 인해 귀하의 기대에 단번에 미치지 못하는 부분이 있더라도 널리 혜량하여 주시기를 부탁드리며, 추가로 궁금하신 사항이나 현장 변동 상황이 있으실 경우 언제든지 담당 부서로 연락 주시면 성심성의껏 안내해 드리겠습니다. 귀하의 건강과 행복을 기원합니다. 끝.

담당부서: ${department}
담당자: ${officerName}
직통전화: 02-120 (평일 09:00~18:00)`;
    } else {
      generatedResponse = `1. 귀하의 가정에 건강과 평안이 함께하시기를 기원합니다.

2. 우리 기관에 접수된 귀하의 민원(접수번호: 2026-민원-제00호)에 대하여 다음과 같이 처리 결과를 회신합니다.

가. 민원 요지
  - 현장 불편 사항 개선 및 관련 법령에 따른 신속한 행정 지도 요청

나. 검토 및 사실 확인 내용
  - 관련 법령: 「민원 처리에 관한 법률」 및 해당 분야 세부 운영 지침
  - 소관 부서에서는 접수된 내용을 토대로 현장 확인 및 관계 규정 저촉 여부를 종합적으로 검토하였습니다.
  - 검토 결과, 현행 기준에 따라 계도 조치 및 시정 명령을 통보하였으며, 일정 기간 내 미이행 시 관련 규정에 따른 행정 처분을 진행할 예정입니다.

다. 향후 처리 계획
  - 향후 유사한 불편이 재발하지 않도록 관할 구역에 대한 지속적인 순찰 및 점검을 강화해 나가겠습니다.

3. 시정에 대한 관심에 다시 한번 감사드리며, 본 답변과 관련하여 추가 설명이 필요하신 경우 아래 담당자에게 연락 주시면 성실히 안내해 드리겠습니다. 끝.

담당부서: ${department}
담당자: ${officerName}
전화번호: 02-120`;
    }
  }

  return {
    threeLineSummary,
    extractedKeywords: keywords,
    responseTitle: title,
    generatedResponse,
    relevantLaws,
    communicationTips: [
      "민원인의 감정을 자극하는 방어적 어휘('저희 소관이 아닙니다', '어쩔 수 없습니다')를 지양하세요.",
      "법률 조항을 명시할 때는 벌칙 위주보다는 행정 절차와 규정의 공평성을 먼저 설명하는 것이 마찰을 줄입니다.",
      "처리 기한과 차후 현장 점검 일정을 구체적인 날짜나 주기로 제시하면 신뢰도가 높아집니다."
    ],
    alternativeExpressions: [
      {
        original: "그건 저희 부서 업무가 아니라서 해드릴 수 없습니다.",
        suggested: "해당 사안은 소관 전문 부서(OO과)의 면밀한 검토가 필요하여 신속히 이첩 안내해 드리겠습니다.",
        reason: "책임 회피 인상을 주지 않고 적극적인 행정 지원 태도 전달"
      },
      {
        original: "규정상 절대 불가능합니다.",
        suggested: "현행 관련 법령의 적용 기준상 즉각적인 수용에는 법률적 한계가 있음을 널리 혜량하여 주시기 바랍니다.",
        reason: "단정적인 거절 대신 객관적 규정의 한계 설명"
      }
    ]
  };
}

startServer();
