import { Clock, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";

export default function KpiSummaryBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-medium mb-1.5 border border-blue-400/30">
            PRD 핵심 지표 달성 (Target KPIs)
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            민원 작성 시간 75% 단축 · 감정 대립 예방 및 공직자 보호
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            복잡한 법령 검토와 정중한 공문 서식을 AI가 3초 만에 작성하여 새올·국민신문고에 즉시 붙여넣을 수 있습니다.
          </p>
        </div>

        {/* 4 Metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5" />
              작성 소요 시간
            </div>
            <div className="text-sm font-bold text-white">
              20분 <span className="text-emerald-400 font-normal text-xs">➔ 3~5초</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">평균 75% 이상 감축</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              문구 채택률
            </div>
            <div className="text-sm font-bold text-white">
              70%+ <span className="text-slate-300 text-[10px] font-normal">(목표 달성)</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">클립보드 즉시 복사</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold mb-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              감정 노동 완화
            </div>
            <div className="text-sm font-bold text-white">쿠션어 & 순화</div>
            <div className="text-[10px] text-slate-300 mt-0.5">악성 민원 원칙 대응</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              개인정보 보호
            </div>
            <div className="text-sm font-bold text-white">자동 마스킹</div>
            <div className="text-[10px] text-slate-300 mt-0.5">주민번호·전화번호 필터</div>
          </div>
        </div>
      </div>
    </div>
  );
}
