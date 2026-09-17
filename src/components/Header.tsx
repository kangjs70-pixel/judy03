import { ShieldCheck, BookOpen, Sparkles, FolderArchive, ShieldAlert, Cpu } from "lucide-react";

interface HeaderProps {
  activeTab: "generator" | "templates" | "polisher" | "statutes";
  setActiveTab: (tab: "generator" | "templates" | "polisher" | "statutes") => void;
  hasGeminiKey?: boolean;
}

export default function Header({ activeTab, setActiveTab, hasGeminiKey = true }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner: Security & Zero Data Retention */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            보안 안심: Zero Data Retention
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            입력된 민원 데이터는 AI 학습에 일절 활용되지 않으며 세션 종료 즉시 안전하게 파기됩니다.
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-sky-400" />
            Gemini 3.8 Flash 엔진 연동
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono">
            v1.0 PRD 기준
          </span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shadow-md font-bold text-lg tracking-tight">
            민
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                민원 든든 <span className="text-blue-700 font-semibold text-sm">Civil Service Copilot</span>
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                공공·기업 민원 특화
              </span>
            </div>
            <p className="text-xs text-slate-500">
              악성·반복 민원 대응 · 법령 근거 자동 제시 · 감정 노동 완화 스마트 도우미
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            id="nav-tab-generator"
            onClick={() => setActiveTab("generator")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "generator"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI 맞춤 문구 생성기
          </button>

          <button
            id="nav-tab-templates"
            onClick={() => setActiveTab("templates")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "templates"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            템플릿 라이브러리
          </button>

          <button
            id="nav-tab-polisher"
            onClick={() => setActiveTab("polisher")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "polisher"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            문안 정화 & 개인정보 마스킹
          </button>

          <button
            id="nav-tab-statutes"
            onClick={() => setActiveTab("statutes")}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "statutes"
                ? "bg-blue-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            행정 법령·지침 가이드
          </button>
        </nav>
      </div>
    </header>
  );
}
