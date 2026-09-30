import React, { useState } from 'react';
import {
  Layers,
  Eye,
  Table,
  BookOpen,
  Code2,
  Download,
  Menu,
  X,
  PlusCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { FormConfig, FormEngine } from '../types/form';
import { PRESET_FORMS } from '../data/presets';

interface HeaderProps {
  activeTab: 'builder' | 'chat' | 'runner' | 'table' | 'problems' | 'code';
  setActiveTab: (tab: 'builder' | 'chat' | 'runner' | 'table' | 'problems' | 'code') => void;
  formConfig: FormConfig;
  onSelectPreset: (presetKey: string) => void;
  onSelectEngine?: (engine: FormEngine) => void;
  onOpenCodeModal: () => void;
  onDownloadZip: () => void;
  submissionsCount: number;
  onToggleMobileCatalog?: () => void;
  onToggleMobileInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  formConfig,
  onSelectPreset,
  onSelectEngine,
  onOpenCodeModal,
  onDownloadZip,
  submissionsCount,
  onToggleMobileCatalog,
  onToggleMobileInspector,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: 'builder' | 'chat' | 'runner' | 'table' | 'problems' | 'code';
    label: string;
    icon: React.ElementType;
    count?: number;
    badge?: string;
  }[] = [
    { id: 'builder', label: 'Builder', icon: Layers },
    { id: 'chat', label: 'AI Chat', icon: Sparkles, badge: 'Gemini' },
    { id: 'runner', label: 'Preview', icon: Eye },
    { id: 'table', label: 'Table', count: submissionsCount, icon: Table },
    { id: 'problems', label: 'Solutions', icon: BookOpen },
    { id: 'code', label: 'Code', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('builder');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-rose-600 text-white font-mono text-xs sm:text-sm font-extrabold shadow-sm shadow-rose-900/40">
              Ng
            </span>
            <span className="tracking-tight">NgFormCraft</span>
          </a>
          <span className="hidden xl:inline-flex text-xs text-slate-500 font-mono border-l border-slate-800 pl-3">
            Angular Form & Table Builder
          </span>
        </div>

        {/* Zone 2: Navigation (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800/80 overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full tabular-nums">
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Preset Selector on large screens */}
          <div className="relative hidden lg:block">
            <select
              onChange={(e) => {
                if (e.target.value) onSelectPreset(e.target.value);
              }}
              value={formConfig.id in PRESET_FORMS ? formConfig.id : ''}
              className="text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500 cursor-pointer max-w-[190px] truncate"
            >
              <option value="" disabled>
                Load Preset...
              </option>
              <option value="signalSurvey">⚡ Angular 19 Signal Survey</option>
              <option value="registration">User Registration</option>
              <option value="formArrayTeam">Team Directory (FormArray)</option>
              <option value="multiStepWizard">Scope Wizard (Multi-Step)</option>
              <option value="supportTicket">Bug Incident Report</option>
            </select>
          </div>

          <button
            onClick={onDownloadZip}
            title="Download Angular Project ZIP"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">ZIP</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 shadow-sm shadow-rose-900/40 transition-colors whitespace-nowrap"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Code</span>
            <span className="sm:hidden">Code</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs (Always accessible on phones) */}
      <div className="md:hidden flex items-center gap-1 px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[9px] font-mono px-1 py-0 bg-slate-800 text-slate-300 rounded-full tabular-nums">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Dropdown for Presets and Extra Actions */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Load Example Template Preset
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onSelectPreset(e.target.value);
                  setMobileMenuOpen(false);
                }
              }}
              value={formConfig.id in PRESET_FORMS ? formConfig.id : ''}
              className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-rose-500"
            >
              <option value="" disabled>
                Select template preset...
              </option>
              <option value="signalSurvey">⚡ Angular 19 Signal Survey (Pure Signals)</option>
              <option value="registration">User Registration (Cross-field Validation)</option>
              <option value="formArrayTeam">Enterprise Team (Dynamic FormArray)</option>
              <option value="multiStepWizard">Project Scope (Multi-Step Stepper)</option>
              <option value="supportTicket">Bug Incident Report (Conditional Logic)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onDownloadZip();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Project ZIP</span>
            </button>

            <button
              onClick={() => {
                onOpenCodeModal();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 shadow-sm"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Export Code</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
