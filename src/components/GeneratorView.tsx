import { useState, useId } from "react";
import {
  Sparkles,
  FileText,
  MessageSquare,
  PhoneCall,
  Scale,
  ShieldAlert,
  HeartHandshake,
  Building,
  RotateCcw,
  Check,
  Plus,
  X,
  Clipboard,
  HelpCircle,
  Clock
} from "lucide-react";
import { SAMPLE_COMPLAINTS } from "../data/initialData";
import { ToneType, ChannelType, CivilResponseData, SampleComplaint } from "../types";
import { generateClientCivilResponse } from "../utils/civilGeneratorFallback";
import ResponseDisplay from "./ResponseDisplay";

interface GeneratorViewProps {
  onSendToPolisher: (text: string) => void;
  presetText?: string;
  presetTone?: ToneType;
  presetChannel?: ChannelType;
}

export default function GeneratorView({
  onSendToPolisher,
  presetText,
  presetTone,
  presetChannel,
}: GeneratorViewProps) {
  const [complaintText, setComplaintText] = useState(presetText || SAMPLE_COMPLAINTS[0].text);
  const [tone, setTone] = useState<ToneType>(presetTone || "standard");
  const [channel, setChannel] = useState<ChannelType>(presetChannel || "official_letter");
  const [department, setDepartment] = useState("교통행정과");
  const [officerName, setOfficerName] = useState("담당 주무관");
  const [keywords, setKeywords] = useState<string[]>(SAMPLE_COMPLAINTS[0].keywords);
  const [keywordInput, setKeywordInput] = useState("");
  const [includeLaw, setIncludeLaw] = useState(true);
  const [includeThreeLineSummary, setIncludeThreeLineSummary] = useState(true);
  const [customDirectives, setCustomDirectives] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<CivilResponseData | null>(null);

  const step1Id = useId();
  const step2Id = useId();

  // Load sample complaint
  const handleLoadSample = (sample: SampleComplaint) => {
    setComplaintText(sample.text);
    setTone(sample.recommendedTone);
    setChannel(sample.recommendedChannel);
    setKeywords(sample.keywords);
    if (sample.category.includes("교통")) setDepartment("교통행정과");
    else if (sample.category.includes("환경")) setDepartment("기후환경과");
    else if (sample.category.includes("정보공개")) setDepartment("열린민원과");
    else if (sample.category.includes("악성")) setDepartment("민원소통과 (공직자보호)");
  };

  // Add keyword
  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setKeywords(keywords.filter((k) => k !== kwToRemove));
  };

  // Paste from clipboard
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setComplaintText(text);
    } catch (err) {
      console.warn("Clipboard read error", err);
    }
  };

  // Trigger generation with guaranteed resilience & client fallback
  const handleGenerate = async () => {
    if (!complaintText.trim()) {
      setErrorMsg("민원 원문 또는 처리할 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setNoticeMsg(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch("/api/generate-civil-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          complaintText,
          keywords,
          tone,
          channel,
          department,
          officerName,
          includeLaw,
          customDirectives,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`서버 응답 오류 (${res.status})`);
      }

      const data = await res.json();
      if (data && (data.generatedResponse || data.threeLineSummary)) {
        setResponseData(data);
      } else {
        throw new Error("Invalid response schema");
      }
    } catch (err: any) {
      console.warn("서버 응답 지연/오류로 인하여 국가 표준 행정 지침 템플릿 엔진으로 즉시 대체 생성합니다:", err);
      // Seamlessly generate response via standard statutory template engine
      const clientResult = generateClientCivilResponse(
        complaintText,
        keywords,
        tone,
        channel,
        department,
        officerName,
        includeLaw,
        customDirectives
      );
      setResponseData(clientResult);
      setNoticeMsg("안내: 네트워크 및 서버 지연 시에도 업무 지장이 없도록 국가 표준 행정 지침 템플릿 엔진으로 즉시 생성되었습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3-Step Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Inputs & Conditions): lg:col-span-5 or 6 */}
        <div className="lg:col-span-6 space-y-5">
          {/* Step 1: Civil Complaint Input */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 id={step1Id} className="text-sm font-bold text-slate-900">
                  민원 원문 또는 핵심 요지 입력
                </h3>
              </div>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                클립보드 붙여넣기
              </button>
            </div>

            {/* Quick Sample Selector */}
            <div className="mb-3">
              <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center justify-between">
                <span>실무 다빈도 민원 프리셋 선택:</span>
                <span className="text-[10px] text-slate-400">클릭 시 자동 로드</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_COMPLAINTS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleLoadSample(sample)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {sample.title.length > 20 ? sample.title.slice(0, 18) + "..." : sample.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="relative">
              <textarea
                id="complaint-input-textarea"
                rows={6}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="국민신문고, 새올, 유선 녹취 또는 민원인이 제출한 원문 텍스트를 그대로 복사하여 붙여넣으세요..."
                className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent leading-relaxed text-slate-800 placeholder-slate-400 resize-y"
              />
              <div className="absolute right-2.5 bottom-2.5 text-[11px] text-slate-400 pointer-events-none">
                {complaintText.length} 자
              </div>
            </div>

            {/* Keywords Tag Manager */}
            <div className="mt-3">
              <div className="text-[11px] font-medium text-slate-600 mb-1">
                추출/강조 키워드:
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-medium"
                  >
                    #{kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddKeyword())}
                  placeholder="추가 키워드 입력 후 Enter"
                  className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Department & Officer Info */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-dept" className="block text-[11px] font-medium text-slate-600 mb-1">
                  소관 부서명
                </label>
                <input
                  id="input-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="예: 교통행정과, 주택과"
                  className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="input-officer" className="block text-[11px] font-medium text-slate-600 mb-1">
                  담당자 명칭/직함
                </label>
                <input
                  id="input-officer"
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="예: 담당 주무관, 팀장"
                  className="w-full text-xs px-2.5 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Tone, Channel & Legal Options */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h3 id={step2Id} className="text-sm font-bold text-slate-900">
                응대 어조(Tone) 및 채널(Channel) 선택
              </h3>
            </div>

            {/* Tone Selector (3 Cards) */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                1) 응대 어조 (Tone & Manner) 선택
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Empathy */}
                <button
                  type="button"
                  id="tone-btn-empathy"
                  onClick={() => setTone("empathy")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    tone === "empathy"
                      ? "border-rose-400 bg-rose-50/70 ring-2 ring-rose-300"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-1">
                    <HeartHandshake className="w-4 h-4" />
                    친절·공감형
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    민원인의 불편에 깊이 공감하고 위로와 충분한 경청의 태도를 표현
                  </p>
                </button>

                {/* Standard */}
                <button
                  type="button"
                  id="tone-btn-standard"
                  onClick={() => setTone("standard")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    tone === "standard"
                      ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-300"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs mb-1">
                    <Building className="w-4 h-4" />
                    표준·신중형
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    행정 절차와 규정에 충실한 공공기관 표준 품격의 하십시오체
                  </p>
                </button>

                {/* Firm */}
                <button
                  type="button"
                  id="tone-btn-firm"
                  onClick={() => setTone("firm")}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    tone === "firm"
                      ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-300"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                    <ShieldAlert className="w-4 h-4" />
                    단호·원칙 대응형
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    악성·반복 민원용. 법적 근거(민원처리법 제23조)에 따른 종결 고지
                  </p>
                </button>
              </div>
            </div>

            {/* Channel Selector (3 Options) */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                2) 답변 채널 (Channel) 형식 선택
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="channel-btn-letter"
                  onClick={() => setChannel("official_letter")}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    channel === "official_letter"
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-semibold"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 font-normal"
                  }`}
                >
                  <FileText className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <span className="text-xs block">서면(공문/신문고)</span>
                </button>

                <button
                  type="button"
                  id="channel-btn-sms"
                  onClick={() => setChannel("sms_notice")}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    channel === "sms_notice"
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-semibold"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 font-normal"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <span className="text-xs block">알림톡 / SMS</span>
                </button>

                <button
                  type="button"
                  id="channel-btn-phone"
                  onClick={() => setChannel("phone_script")}
                  className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    channel === "phone_script"
                      ? "border-blue-600 bg-blue-50 text-blue-800 font-semibold"
                      : "border-slate-200 hover:border-slate-300 text-slate-700 font-normal"
                  }`}
                >
                  <PhoneCall className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                  <span className="text-xs block">전화 응대 스크립트</span>
                </button>
              </div>
            </div>

            {/* Smart RAG & Additional Directives Options */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeLaw}
                    onChange={(e) => setIncludeLaw(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>
                    <strong>법령/지침 기반 답변 가이드 (RAG)</strong> 자동 연동
                  </span>
                </label>
                <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                  민원처리법·개인정보보호법
                </span>
              </div>

              <div>
                <input
                  type="text"
                  value={customDirectives}
                  onChange={(e) => setCustomDirectives(e.target.value)}
                  placeholder="특이 지침 (예: 이번 주 금요일까지 현장 방문 예정임을 포함할 것)"
                  className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Action Button: AI Generate */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="button"
              id="generate-response-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 응대 문구 생성 중 (3~5초 소요)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-200" />
                  <span>맞춤형 민원 응대 문구 즉시 생성</span>
                  <span className="text-xs text-blue-200 font-normal">➔</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (Results & Output Station): lg:col-span-6 */}
        <div className="lg:col-span-6 space-y-4">
          {noticeMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                <span>{noticeMsg}</span>
              </div>
              <button
                onClick={() => setNoticeMsg(null)}
                className="text-amber-600 hover:text-amber-900 cursor-pointer p-1"
                aria-label="알림 닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                공공 민원 표준 지침 및 관련 법령 검토 중
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                민원 요지 파악 ➔ 행정 법조항 자동 매칭 ➔ 선택 어조({tone === "firm" ? "단호·원칙" : tone === "empathy" ? "친절·공감" : "표준·신중"}) 맞춤 문안 작성
              </p>
              <div className="w-48 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-2/3"></div>
              </div>
            </div>
          ) : responseData ? (
            <ResponseDisplay
              data={responseData}
              tone={tone}
              channel={channel}
              onSendToPolisher={onSendToPolisher}
              onRegenerate={handleGenerate}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[420px] shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">
                준비가 완료되었습니다
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                좌측의 민원 내용과 어조/채널을 확인한 후 <strong>[맞춤형 민원 응대 문구 즉시 생성]</strong> 버튼을 누르면 3~5초 이내에 새올/국민신문고 규격 답변이 작성됩니다.
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-left text-xs text-slate-600 border border-slate-200 max-w-sm w-full space-y-1">
                <div className="font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  스마트 도우미 추천 사용 팁:
                </div>
                <div>• 악성/반복 민원은 <strong>단호·원칙 대응형</strong>을 선택하여 종결 근거를 확립하세요.</div>
                <div>• 문자 통보는 <strong>알림톡/SMS</strong> 채널을 선택하면 글자 수가 자동 압축됩니다.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
