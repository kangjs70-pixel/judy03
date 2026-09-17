import { useState } from "react";
import { BookOpen, Search, Scale, Copy, Check, ExternalLink, ShieldCheck } from "lucide-react";
import { STATUTES_LIST } from "../data/initialData";
import { RelevantLaw } from "../types";

export default function StatuteGuideModal() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredStatutes = STATUTES_LIST.filter(
    (item) =>
      item.lawName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.article.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCitation = async (idx: number, law: RelevantLaw) => {
    const citation = `「${law.lawName}」 ${law.article}\n- 핵심 근거: ${law.description}`;
    try {
      await navigator.clipboard.writeText(citation);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-700" />
              민원 행정 법령 및 담당자 보호 규정 핸드북
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              국가법령정보센터 연계 · 민원처리법 제23조(반복민원 종결) · 산업안전보건법 제41조(폭언 차단 및 근로자 보호)
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="법령명, 조항, 키워드 검색..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Featured Officer Protection Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700/60 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-300 mb-1">
              [중요 행정 지침] 민원 처리 담당 공무원 및 상담원 법적 보호 안내
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-2">
              「민원 처리에 관한 법률 시행령」 제4조 및 「산업안전보건법」 제41조에 따라 민원인의 폭언, 욕설, 성희롱, 고의적인 업무 방해 발생 시 즉시 통화 녹음 고지 후 상담을 일시 중단하거나 전화를 종료할 수 있는 법적 권리가 보장됩니다.
            </p>
            <div className="text-[11px] text-sky-200 font-mono">
              반복·중복 민원은 2회 이상 처리결과 통지 후 3회차부터 종결 처리(민원처리법 제23조) 가능
            </div>
          </div>
        </div>
      </div>

      {/* Statutes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStatutes.map((law, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {law.lawName}
                </span>
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  {law.article}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed mt-2.5">
                {law.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                국가법령정보센터 표준 조항
              </span>
              <button
                onClick={() => handleCopyCitation(idx, law)}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>인용구 복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>법 조항 인용 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
