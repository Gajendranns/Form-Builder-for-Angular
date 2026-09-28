import React, { useState } from 'react';
import {
  Type,
  Mail,
  Lock,
  Hash,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  ToggleLeft,
  Sliders,
  Calendar,
  Star,
  ListPlus,
  FolderTree,
  Footprints,
  Search,
  Plus,
  HelpCircle,
  X,
} from 'lucide-react';
import { FormFieldType } from '../types/form';

interface SidebarCatalogProps {
  onAddField: (type: FormFieldType) => void;
  layoutType: 'single-page' | 'multi-step';
  onAddStep?: () => void;
  onClose?: () => void;
}

interface PaletteItem {
  type: FormFieldType;
  label: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

export const SidebarCatalog: React.FC<SidebarCatalogProps> = ({
  onAddField,
  layoutType,
  onAddStep,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const basicFields: PaletteItem[] = [
    { type: 'text', label: 'Text Input', description: 'Single-line text for names, titles', icon: Type },
    { type: 'email', label: 'Email Field', description: 'Includes RFC email validation', icon: Mail },
    { type: 'password', label: 'Password', description: 'Hidden input with length checks', icon: Lock },
    { type: 'number', label: 'Number', description: 'Integer or decimal with min/max', icon: Hash },
    { type: 'textarea', label: 'Text Area', description: 'Multi-line descriptions & comments', icon: AlignLeft },
    { type: 'datepicker', label: 'Date Picker', description: 'Native ISO date selector', icon: Calendar },
  ];

  const selectionFields: PaletteItem[] = [
    { type: 'select', label: 'Dropdown', description: 'Single option selection list', icon: ChevronDown },
    { type: 'radio', label: 'Radio Group', description: 'Single selection from visible radio list', icon: CheckSquare },
    { type: 'checkbox', label: 'Checkbox', description: 'Consent flags, boolean toggles', icon: CheckSquare },
    { type: 'switch', label: 'Switch', description: 'Modern accessible boolean switch', icon: ToggleLeft },
    { type: 'slider', label: 'Slider', description: 'Numeric range scale with bounds', icon: Sliders },
    { type: 'rating', label: 'Star Rating', description: '1 to 5 star rating metric', icon: Star },
  ];

  const advancedFields: PaletteItem[] = [
    {
      type: 'formarray',
      label: 'FormArray',
      description: 'Dynamic repeating row repeater (Add/Remove members)',
      icon: ListPlus,
      badge: 'Array',
    },
    {
      type: 'fieldgroup',
      label: 'Group',
      description: 'Nested object namespace (address, company)',
      icon: FolderTree,
    },
  ];

  const filterItems = (items: PaletteItem[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  };

  const filteredBasic = filterItems(basicFields);
  const filteredSelection = filterItems(selectionFields);
  const filteredAdvanced = filterItems(advancedFields);

  return (
    <aside className="w-full sm:w-80 lg:w-72 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden select-none">
      {/* Search & Header (Compact) */}
      <div className="p-3 border-b border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Field Library
            </span>
            <span className="text-[10px] text-slate-500 font-mono">14 Controls</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded bg-slate-900 border border-slate-800"
              title="Close drawer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter fields..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Field List Container (Compact 2-col Grid so it NEVER scrolls on large screens) */}
      <div className="flex-1 overflow-y-auto lg:overflow-y-auto p-2.5 space-y-3">
        {/* Multi-step trigger if applicable */}
        {layoutType === 'multi-step' && onAddStep && (
          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-rose-300">
              <Footprints className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-semibold">Wizard Stepper</span>
            </div>
            <button
              onClick={onAddStep}
              className="flex items-center gap-1 py-1 px-2 text-[11px] font-semibold text-white bg-rose-600 rounded hover:bg-rose-500 transition-colors shrink-0"
            >
              <Plus className="h-3 w-3" />
              <span>+ Add Step</span>
            </button>
          </div>
        )}

        {/* Dynamic & Advanced Category */}
        {filteredAdvanced.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider px-1">
              Dynamic Structures
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredAdvanced.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddField(item.type)}
                  className="text-left group flex items-center gap-2 p-2 rounded-lg border border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 hover:border-rose-700/60 transition-all text-slate-200"
                  title={item.description}
                >
                  <div className="p-1 rounded bg-rose-900/40 text-rose-300 group-hover:text-white transition-colors shrink-0">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-rose-200 group-hover:text-white truncate">
                      {item.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Standard Basic Inputs */}
        {filteredBasic.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Standard Inputs
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredBasic.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddField(item.type)}
                  className="text-left group flex items-center gap-2 p-2 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/70 hover:border-slate-700 transition-all text-slate-200"
                  title={item.description}
                >
                  <div className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-rose-400 transition-colors shrink-0">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selection & Controls */}
        {filteredSelection.length > 0 && (
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Choices & Toggles
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredSelection.map((item) => (
                <button
                  key={item.type}
                  onClick={() => onAddField(item.type)}
                  className="text-left group flex items-center gap-2 p-2 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-slate-800/70 hover:border-slate-700 transition-all text-slate-200"
                  title={item.description}
                >
                  <div className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-rose-400 transition-colors shrink-0">
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compact Quick Tip Footer */}
      <div className="p-2 border-t border-slate-800 bg-slate-900/40 flex items-center gap-1.5 text-[10px] text-slate-500 shrink-0">
        <HelpCircle className="h-3 w-3 text-slate-500 shrink-0" />
        <span className="truncate">Click any field to add to canvas</span>
      </div>
    </aside>
  );
};
