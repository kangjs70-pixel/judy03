/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Header from "./components/Header";
import KpiSummaryBanner from "./components/KpiSummaryBanner";
import GeneratorView from "./components/GeneratorView";
import TemplateLibraryModal from "./components/TemplateLibraryModal";
import TextPolisherModal from "./components/TextPolisherModal";
import StatuteGuideModal from "./components/StatuteGuideModal";
import { TemplateItem, ToneType, ChannelType } from "./types";
import { ShieldCheck, Heart, FileCheck } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"generator" | "templates" | "polisher" | "statutes">("generator");

  // Inter-module shared states
  const [generatorPresetText, setGeneratorPresetText] = useState<string | undefined>(undefined);
  const [generatorPresetTone, setGeneratorPresetTone] = useState<ToneType | undefined>(undefined);
  const [generatorPresetChannel, setGeneratorPresetChannel] = useState<ChannelType | undefined>(undefined);
  const [polisherDraftText, setPolisherDraftText] = useState<string | undefined>(undefined);

  // When user selects a template to use in generator
  const handleUseTemplate = (template: TemplateItem) => {
    setGeneratorPresetText(template.content);
    setGeneratorPresetTone(template.tone);
    setGeneratorPresetChannel(template.channel);
    setActiveTab("generator");
  };

  // When user sends response from Generator to Polisher
  const handleSendToPolisher = (text: string) => {
    setPolisherDraftText(text);
    setActiveTab("polisher");
  };

  // When user applies refined text back to Generator
  const handleApplyPolishedText = (text: string) => {
    setGeneratorPresetText(text);
    setActiveTab("generator");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Main Header & Nav */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Banner displayed at top */}
        <KpiSummaryBanner />

        {/* View switching based on active tab */}
        {activeTab === "generator" && (
          <GeneratorView
            onSendToPolisher={handleSendToPolisher}
            presetText={generatorPresetText}
            presetTone={generatorPresetTone}
            presetChannel={generatorPresetChannel}
          />
        )}

        {activeTab === "templates" && (
          <TemplateLibraryModal onUseTemplate={handleUseTemplate} />
        )}

        {activeTab === "polisher" && (
          <TextPolisherModal
            initialDraftText={polisherDraftText}
            onApplyPolishedText={handleApplyPolishedText}
          />
        )}

        {activeTab === "statutes" && (
          <StatuteGuideModal />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">민원 든든 (Civil Service Copilot)</span>
            <span>·</span>
            <span>공공기관 및 기업 민원 담당자 감정 노동 완화 솔루션</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              개인정보보호법 및 Zero Retention 준수
            </span>
            <span>국가법령정보센터 RAG 연계</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
