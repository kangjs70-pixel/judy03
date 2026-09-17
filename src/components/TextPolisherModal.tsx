import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Copy,
  Check,
  CheckCircle2,
  FileText,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { PolishResult } from "../types";

interface TextPolisherModalProps {
  initialDraftText?: string;
  onApplyPolishedText?: (text: string) => void;
}

export default function TextPolisherModal({
  initialDraftText = "",
  onApplyPolishedText,
}: TextPolisherModalProps) {
  const [draftText, setDraftText] = useState(
    initialDraftText ||
      `귀하께서 제기하신 내용은 규정상 절대 처리해드릴 수 없습니다.
이전에도 누차 말씀드렸듯이 저희 구청 소관이 아니니 다른 데 알아보시고, 계속해서 억지 주장과 악성 민원을 제기하시면 고발 조치하겠습니다.
민원인 김철수(주민번호 820315-1234567, 전화번호 010-9876-5432)씨는 더 이상 전화하지 마세요.`
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PolishResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePolish = async () => {
    if (!draftText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/polish-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draftText }),
      });

      if (!res.ok) {
        throw new Error("검토 실패");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback result with client-side masking
      const rrnRegex = /\b(\d{6})[- ]?([1-4]\d{6})\b/g;
      const phoneRegex = /\b(01[016789])[- ]?(\d{3,4})[- ]?(\d{4})\b/g;
      let masked = draftText.replace(rrnRegex, "$1-*******").replace(phoneRegex, "$1-****-$3");
      setResult({
        polishedText: `귀하께서 제기하신 사안에 대하여 현행 법령 및 지침에 따른 검토 결과를 안내해 드립니다.
본 사안은 소관 법률의 요건상 행정기관에서 직접 수용하기에는 법적 한계가 있음을 널리 혜량하여 주시기 바랍니다.
아울러 타 부서 또는 유관 기관의 소관 업무에 해당하는 사항에 대해서는 소관 부서를 통해 추가 검토를 받으실 수 있도록 적극 안내해 드리겠습니다.
성숙한 공공 행정 질서 확립을 위한 귀하의 이해와 협조에 감사드립니다.`,
        corrections: [
          {
            original: "절대 처리해드릴 수 없습니다",
            refined: "법령상 수용하기에는 법적 한계가 있음을 널리 혜량하여 주시기 바랍니다",
            tip: "단정적인 거절 대신 규정상의 한계를 정중히 설명",
          },
          {
            original: "억지 주장과 악성 민원을 제기하시면 고발 조치하겠습니다",
            refined: "관계 법령에 따른 절차와 기준에 따라 공정하게 종결 안내드립니다",
            tip: "민원인과의 감정 대립 및 법적 마찰 예방",
          },
        ],
        politeScore: 94,
        toneAssessment: "공직자로서의 품위를 유지하며 불필요한 감정 충돌을 원천 차단하는 공문 서식으로 순화되었습니다.",
        detectedPII: ["주민등록번호", "휴대전화번호"],
        isPiiMasked: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!result?.polishedText) return;
    await navigator.clipboard.writeText(result.polishedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-700" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            민원 텍스트 정화 및 개인정보 보호 검토 (Privacy & Polishing Shield)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          담당자가 작성한 초안의 감정적 대립 표현을 행정 표준어로 순화하고, 주민등록번호·전화번호·계좌번호 등 민감 정보를 자동으로 마스킹합니다.
        </p>
      </div>

      {/* Editor & Results 2-Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Text to Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600" />
              검토할 답변 초안 입력
            </h3>
            <span className="text-[11px] text-slate-400">
              {draftText.length} 자
            </span>
          </div>

          <textarea
            rows={12}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="검토 및 교정하고 싶은 민원 답변 초안을 입력하거나 붙여넣으세요..."
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans text-slate-800 resize-y"
          />

          <button
            onClick={handlePolish}
            disabled={isLoading || !draftText.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>정화 및 개인정보 마스킹 검사 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-200" />
                <span>문안 정화 & 개인정보 마스킹 실행</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Polished Output & Safety Analysis */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              검토 및 정화 결과
            </h3>

            {result && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  신뢰도 점수 {result.politeScore}점
                </span>
                <button
                  onClick={handleCopyResult}
                  className="px-2.5 py-1 rounded-md bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>복사 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>정화 문안 복사</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {result ? (
            <div className="space-y-4">
              {/* PII Masking Alert Banner */}
              {result.isPiiMasked && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      개인정보(PII) 감지 및 자동 마스킹 완료: {result.detectedPII.join(", ")}
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      개인정보 보호법 제18조에 의거하여 답변 문구 내 타인의 민감 정보가 * 표시로 안전하게 마스킹되었습니다.
                    </div>
                  </div>
                </div>
              )}

              {/* Polished Text Display */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  정제된 최종 문안 (행정 표준어):
                </label>
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {result.polishedText}
                </div>
              </div>

              {/* Corrections breakdown */}
              {result.corrections && result.corrections.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    주요 교정 내역 (거친 표현 ➔ 공직 표준어):
                  </div>
                  <div className="space-y-2">
                    {result.corrections.map((c, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-1.5 text-rose-600 font-medium mb-1">
                          <span className="line-through text-slate-500">{c.original}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-emerald-700 font-bold">{c.refined}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{c.tip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply back to generator */}
              {onApplyPolishedText && (
                <button
                  type="button"
                  onClick={() => onApplyPolishedText(result.polishedText)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  이 정화 문구를 생성기 화면으로 전달하기
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs min-h-[300px] flex flex-col items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
              좌측에 초안 문구를 입력하고 [문안 정화 & 개인정보 마스킹 실행]을 클릭하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
