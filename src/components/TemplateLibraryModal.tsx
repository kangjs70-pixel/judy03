import { useState, useEffect, type FormEvent } from "react";
import {
  FolderArchive,
  Search,
  Plus,
  Copy,
  Check,
  Tag,
  Sparkles,
  Bookmark,
  Trash2,
  Filter,
  FileText,
  Building,
  HeartHandshake,
  ShieldAlert
} from "lucide-react";
import { INITIAL_TEMPLATES } from "../data/initialData";
import { TemplateItem, ToneType, ChannelType } from "../types";

interface TemplateLibraryModalProps {
  onUseTemplate: (template: TemplateItem) => void;
}

export default function TemplateLibraryModal({ onUseTemplate }: TemplateLibraryModalProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>(() => {
    const saved = localStorage.getItem("civil_service_custom_templates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TEMPLATES;
      }
    }
    return INITIAL_TEMPLATES;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTone, setSelectedTone] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Template Form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TemplateItem["category"]>("일반행정");
  const [newTone, setNewTone] = useState<ToneType>("standard");
  const [newChannel, setNewChannel] = useState<ChannelType>("official_letter");
  const [newSummary, setNewSummary] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    localStorage.setItem("civil_service_custom_templates", JSON.stringify(templates));
  }, [templates]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleCreateTemplate = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newTpl: TemplateItem = {
      id: "custom-" + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      tone: newTone,
      channel: newChannel,
      summary: newSummary.trim() || "팀 내에서 직접 등록한 맞춤 템플릿",
      content: newContent.trim(),
      isOfficial: false,
      department: "우리 부서",
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      lastUpdated: new Date().toLocaleDateString("ko-KR"),
    };

    setTemplates([newTpl, ...templates]);
    setShowAddModal(false);
    // Reset form
    setNewTitle("");
    setNewSummary("");
    setNewContent("");
    setNewTags("");
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("이 맞춤 템플릿을 삭제하시겠습니까?")) {
      setTemplates(templates.filter((t) => t.id !== id));
    }
  };

  const categories = [
    "all",
    "교통·도로",
    "환경·소음",
    "정보공개",
    "악성·반복",
    "시설·보수",
    "일반행정",
  ];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((tg) => tg.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || tpl.category === selectedCategory;
    const matchesTone = selectedTone === "all" || tpl.tone === selectedTone;

    return matchesSearch && matchesCategory && matchesTone;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-blue-700" />
              민원 유형별 템플릿 라이브러리
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              정보공개 반려, 반복 민원 종결 공문, 감정 완화 쿠션어 및 부서 우수 응대문 모음집
            </p>
          </div>

          <button
            type="button"
            id="open-add-template-btn"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            새 부서 템플릿 등록
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="템플릿 제목, 법령, 태그 검색..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Category pills */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    selectedCategory === cat
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? "전체 분야" : cat}
                </button>
              ))}
            </div>

            {/* Tone selector */}
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">모든 어조</option>
              <option value="empathy">친절·공감형</option>
              <option value="standard">표준·신중형</option>
              <option value="firm">단호·원칙 대응형</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            검색 조건과 일치하는 템플릿이 없습니다.
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {tpl.category}
                    </span>
                    {tpl.isOfficial ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        공식 표준
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        부서 저장
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {tpl.channel === "official_letter"
                        ? "서면 공문"
                        : tpl.channel === "sms_notice"
                        ? "알림톡/SMS"
                        : "전화 스크립트"}
                    </span>
                  </div>

                  {!tpl.isOfficial && (
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {tpl.summary}
                </p>

                {/* Content Preview Box */}
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 max-h-36 overflow-y-auto font-sans leading-relaxed border border-slate-200/80 whitespace-pre-wrap">
                  {tpl.content}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {tpl.tags.map((tg) => (
                    <span
                      key={tg}
                      className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopy(tpl.id, tpl.content)}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>복사 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>문구 복사</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onUseTemplate(tpl)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>생성기에 적용</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                새 부서/팀 우수 응대 템플릿 등록
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  템플릿 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 도로 포트홀 긴급 보수 안내 문자 템플릿"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    분야 카테고리
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="일반행정">일반행정</option>
                    <option value="교통·도로">교통·도로</option>
                    <option value="환경·소음">환경·소음</option>
                    <option value="정보공개">정보공개</option>
                    <option value="악성·반복">악성·반복</option>
                    <option value="시설·보수">시설·보수</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    어조
                  </label>
                  <select
                    value={newTone}
                    onChange={(e) => setNewTone(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="standard">표준·신중형</option>
                    <option value="empathy">친절·공감형</option>
                    <option value="firm">단호·원칙 대응형</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    채널 형식
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="official_letter">서면(공문/신문고)</option>
                    <option value="sms_notice">알림톡/SMS</option>
                    <option value="phone_script">전화 스크립트</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  요약 설명
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="어떤 상황에 사용하는 템플릿인지 간략 설명"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  응대 문안 전문 *
                </label>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="정중한 공문 또는 문자 서식을 입력하세요..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="포트홀, 도로관리, 긴급보수"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer shadow-xs"
                >
                  템플릿 저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
