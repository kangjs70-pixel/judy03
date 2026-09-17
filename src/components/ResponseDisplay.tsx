import { useState, useId } from "react";
import {
  Copy,
  Check,
  FileText,
  MessageSquare,
  PhoneCall,
  Scale,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  RotateCcw,
  Send,
  Eye,
  Edit3
} from "lucide-react";
import { CivilResponseData, ToneType, ChannelType } from "../types";

interface ResponseDisplayProps {
  data: CivilResponseData;
  tone: ToneType;
  channel: ChannelType;
  onSendToPolisher: (text: string) => void;
  onRegenerate: () => void;
}

export default function ResponseDisplay({
  data,
  tone,
  channel,
  onSendToPolisher,
  onRegenerate,
}: ResponseDisplayProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [editableResponse, setEditableResponse] = useState(data.generatedResponse);
  const [isEditing, setIsEditing] = useState(false);
  const titleId = useId();
  const summaryId = useId();

  // Keep editableResponse in sync when data changes
  if (data.generatedResponse !== editableResponse && !isEditing) {
    setEditableResponse(data.generatedResponse);
  }

  // Calculate characters and bytes (Korean = 2 bytes in EUC-KR, roughly 3 in UTF-8, standard Korean SMS uses 80/90 byte boundary)
  const charCount = editableResponse.length;
  const byteCount = new Blob([editableResponse]).size;

  const handleCopy = async (type: string, textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const getToneBadge = (t: ToneType) => {
    switch (t) {
      case "empathy":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">친절·공감형</span>;
      case "standard":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">표준·신중형</span>;
      case "firm":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">단호·원칙 대응형 (악성/반복 민원)</span>;
    }
  };

  const getChannelBadge = (c: ChannelType) => {
    switch (c) {
      case "official_letter":
        return <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium"><FileText className="w-3 h-3" /> 서면(공문/신문고)</span>;
      case "sms_notice":
        return <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium"><MessageSquare className="w-3 h-3" /> 알림톡/SMS</span>;
      case "phone_script":
        return <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium"><PhoneCall className="w-3 h-3" /> 전화 응대 스크립트</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Complaint 3-Line Summary & Keywords Banner (PRD 3.4) */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 id={summaryId} className="text-xs font-bold uppercase tracking-wider text-slate-300">
              민원 핵심 3줄 요약 & 추출 키워드
            </h3>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.extractedKeywords?.map((kw, idx) => (
              <span
                key={idx}
                className="bg-slate-800 text-sky-300 text-[11px] px-2 py-0.5 rounded-md border border-slate-700"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>

        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-200">
          {data.threeLineSummary?.map((line, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-sky-400 font-bold font-mono">0{idx + 1}.</span>
              <span className="leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Main Response Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header with Tone, Channel, and Copy Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getToneBadge(tone)}
              {getChannelBadge(channel)}
              <span className="text-[11px] text-slate-400">
                {charCount}자 / 약 {byteCount}바이트
              </span>
            </div>
            <h4 id={titleId} className="text-sm sm:text-base font-bold text-slate-900">
              {data.responseTitle || "민원 답변 회신문안"}
            </h4>
          </div>

          {/* Quick Copy Buttons tailored to official civil systems */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="copy-saeol-btn"
              onClick={() => handleCopy("saeol", editableResponse)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              title="새올/온나라 전자결재 및 국민신문고 본문에 바로 붙여넣기"
            >
              {copiedType === "saeol" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>새올/신문고 복사</span>
                </>
              )}
            </button>

            <button
              id="toggle-edit-btn"
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 transition-colors cursor-pointer ${
                isEditing
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? "편집 완료" : "문구 직접 수정"}</span>
            </button>

            <button
              id="send-to-polisher-btn"
              onClick={() => onSendToPolisher(editableResponse)}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="감정 표현 순화 및 개인정보(주민번호/연락처) 마스킹 검토"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>마스킹/순화 검토</span>
            </button>

            <button
              id="btn-regenerate"
              onClick={onRegenerate}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              title="현재 조건으로 다시 생성"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Response Body Text / Editor */}
        <div className="p-4 sm:p-5">
          {isEditing ? (
            <div>
              <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded-lg mb-2 border border-amber-200">
                <span>편집 모드: 필요에 따라 기관 세부 지침이나 날짜를 자유롭게 수정하세요.</span>
                <span className="font-mono">{charCount} 자</span>
              </div>
              <textarea
                id="response-textarea-edit"
                value={editableResponse}
                onChange={(e) => setEditableResponse(e.target.value)}
                rows={14}
                className="w-full text-xs sm:text-sm font-sans text-slate-800 bg-white border border-blue-400 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-normal resize-y"
              />
            </div>
          ) : (
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 font-sans text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap selection:bg-blue-100">
              {editableResponse}
            </div>
          )}

          {/* Quick Copy Notification Footer */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1 text-[11px]">
              <Check className="w-3.5 h-3.5 text-blue-600" />
              공문 기안 서식(두괄식 요지, 근거 조항, 종결 안내, 담당자 직통번호) 준수
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy("plain", editableResponse)}
                className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
              >
                일반 텍스트 복사
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Statutory Legal Basis Cards (PRD 3.1 RAG 연동) */}
      {data.relevantLaws && data.relevantLaws.length > 0 && (
        <div className="bg-blue-50/60 rounded-xl p-4 sm:p-5 border border-blue-200/70">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-blue-700" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              관련 법령 및 행정 가이드라인 (RAG 근거)
            </h4>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
              자동 매칭
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.relevantLaws.map((law, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-blue-200/90 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-blue-900">
                      {law.lawName} {law.article}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">법적근거</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {law.description}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">답변서 내 법 조항 인용 완료</span>
                  <button
                    onClick={() => handleCopy(`law-${idx}`, `${law.lawName} ${law.article}: ${law.description}`)}
                    className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedType === `law-${idx}` ? "복사됨" : "조항 복사"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Alternative Expressions & Communication Advice (PRD 3.3 감정 대립 방지) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Officer Communication Tips */}
        {data.communicationTips && data.communicationTips.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                담당자 감정 노동 완화 및 응대 수칙
              </h4>
            </div>
            <ul className="space-y-2">
              {data.communicationTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sensitive vs Refined Expressions Table */}
        {data.alternativeExpressions && data.alternativeExpressions.length > 0 && (
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                마찰 방지 행정 표준어 교정 추천
              </h4>
            </div>
            <div className="space-y-2.5">
              {data.alternativeExpressions.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-600 font-medium mb-1">
                    <span className="line-through text-[11px] text-slate-500">{item.original}</span>
                  </div>
                  <div className="text-emerald-800 font-semibold mb-0.5">
                    ➔ {item.suggested}
                  </div>
                  <div className="text-[11px] text-slate-500">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
