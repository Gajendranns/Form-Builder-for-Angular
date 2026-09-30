import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  Download,
  Trash2,
  Eye,
  SlidersHorizontal,
  Plus,
  FileSpreadsheet,
  CheckSquare,
  Square,
  FileJson,
  X,
  Sparkles,
} from 'lucide-react';
import { FormSubmission, FormConfig, FormField } from '../types/form';

interface SubmissionsTableProps {
  submissions: FormSubmission[];
  formConfig: FormConfig;
  onDeleteSubmission: (id: string) => void;
  onAddMockSubmission: () => void;
  onClearAllSubmissions: () => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  formConfig,
  onDeleteSubmission,
  onAddMockSubmission,
  onClearAllSubmissions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailModalSubmission, setDetailModalSubmission] = useState<FormSubmission | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Extract all data column keys from formConfig
  const availableColumns = useMemo(() => {
    const cols: { key: string; label: string }[] = [];
    const fieldsToProcess: FormField[] = [];

    if (formConfig.layoutType === 'multi-step') {
      formConfig.fields.forEach((s) => {
        if (s.children) fieldsToProcess.push(...s.children);
      });
    } else {
      fieldsToProcess.push(...formConfig.fields);
    }

    fieldsToProcess.forEach((f) => {
      if (f.type !== 'step') {
        cols.push({ key: f.name, label: f.label });
      }
    });

    return cols;
  }, [formConfig]);

  // Track visible column keys
  const [visibleColKeys, setVisibleColKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Default to first 5 columns to keep table clean
    availableColumns.slice(0, 5).forEach((c) => initial.add(c.key));
    return initial;
  });

  // Sync visible columns when availableColumns change (e.g. switching preset or changing fields)
  React.useEffect(() => {
    setVisibleColKeys((prev) => {
      // If none of previous keys exist in new availableColumns, reinitialize with first 5
      const stillValid = new Set([...prev].filter((k) => availableColumns.some((c) => c.key === k)));
      if (stillValid.size === 0 && availableColumns.length > 0) {
        const next = new Set<string>();
        availableColumns.slice(0, 5).forEach((c) => next.add(c.key));
        return next;
      }
      return stillValid.size > 0 ? stillValid : new Set(availableColumns.slice(0, 5).map((c) => c.key));
    });
  }, [availableColumns]);

  // Filtered and Sorted Submissions
  const processedSubmissions = useMemo(() => {
    let result = [...submissions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((sub) => {
        const inId = sub.id.toLowerCase().includes(q);
        const inTime = sub.timestamp.toLowerCase().includes(q);
        const inData = Object.values(sub.data).some((val) =>
          String(val).toLowerCase().includes(q)
        );
        return inId || inTime || inData;
      });
    }

    result.sort((a, b) => {
      let valA: any = a[sortField as keyof FormSubmission] ?? a.data[sortField];
      let valB: any = b[sortField as keyof FormSubmission] ?? b.data[sortField];

      if (valA === undefined) valA = '';
      if (valB === undefined) valB = '';

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [submissions, searchQuery, sortField, sortAsc]);

  const handleToggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === processedSubmissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedSubmissions.map((s) => s.id)));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => onDeleteSubmission(id));
    setSelectedIds(new Set());
  };

  // Export CSV
  const handleExportCSV = () => {
    if (processedSubmissions.length === 0) return;

    const headers = ['ID', 'Timestamp', ...availableColumns.map((c) => c.label)];
    const rows = processedSubmissions.map((sub) => {
      const dataCols = availableColumns.map((c) => {
        const val = sub.data[c.key];
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      });
      return [sub.id, sub.timestamp, ...dataCols].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${formConfig.id}-submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    if (processedSubmissions.length === 0) return;
    const jsonStr = JSON.stringify(processedSubmissions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${formConfig.id}-submissions.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-4 sm:space-y-5">
        {/* Table Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold">
                TanStack Table in Angular
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {submissions.length} Total Submissions
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Form Submissions Data Grid</h1>
            <p className="text-xs text-slate-400">
              Live submission records connected to your Angular form schema.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onAddMockSubmission}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Mock Submission</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap"
            >
              <FileJson className="h-3.5 w-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/80">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search submissions by text or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-lg hover:bg-rose-900/50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete ({selectedIds.size})</span>
              </button>
            )}

            {/* Column Visibility Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                <span>Columns ({visibleColKeys.size})</span>
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 mt-1 w-56 p-2 rounded-lg bg-slate-950 border border-slate-800 shadow-2xl z-30 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Toggle Column Visibility
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {availableColumns.map((col) => {
                      const isVisible = visibleColKeys.has(col.key);
                      return (
                        <label
                          key={col.key}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-slate-300 hover:bg-slate-900 rounded cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => {
                              setVisibleColKeys((prev) => {
                                const next = new Set(prev);
                                if (next.has(col.key)) next.delete(col.key);
                                else next.add(col.key);
                                return next;
                              });
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="truncate">{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {submissions.length > 0 && (
              <button
                onClick={onClearAllSubmissions}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear table entries"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        processedSubmissions.length > 0 &&
                        selectedIds.size === processedSubmissions.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                    />
                  </th>
                  <th
                    onClick={() => handleToggleSort('id')}
                    className="p-3 font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:text-white select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>ID</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleToggleSort('timestamp')}
                    className="p-3 font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:text-white select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Timestamp</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  {availableColumns
                    .filter((c) => visibleColKeys.has(c.key))
                    .map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleToggleSort(col.key)}
                        className="p-3 font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:text-white select-none whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col.label}</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </th>
                    ))}

                  <th className="p-3 text-right font-semibold uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {processedSubmissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={availableColumns.filter((c) => visibleColKeys.has(c.key)).length + 4}
                      className="p-12 text-center text-slate-500 text-xs"
                    >
                      <div className="space-y-2">
                        <p>No submissions found matching your filters.</p>
                        <button
                          onClick={onAddMockSubmission}
                          className="px-3 py-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded hover:bg-rose-900/50 transition-colors inline-block"
                        >
                          Generate Sample Submission
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedSubmissions.map((sub) => {
                    const isSelected = selectedIds.has(sub.id);
                    return (
                      <tr
                        key={sub.id}
                        className={`hover:bg-slate-900/50 transition-colors ${
                          isSelected ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(sub.id)}
                            className="rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500"
                          />
                        </td>
                        <td className="p-3 font-mono text-[11px] text-rose-400 font-semibold tabular-nums whitespace-nowrap">
                          {sub.id}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400 tabular-nums whitespace-nowrap">
                          {sub.timestamp}
                        </td>

                        {availableColumns
                          .filter((c) => visibleColKeys.has(c.key))
                          .map((col) => {
                            const val = sub.data[col.key];
                            return (
                              <td
                                key={col.key}
                                className="p-3 max-w-[200px] truncate text-slate-200"
                              >
                                {renderTableCellValue(val)}
                              </td>
                            );
                          })}

                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailModalSubmission(sub)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded"
                              title="Inspect JSON"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteSubmission(sub.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded"
                              title="Delete Submission"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {processedSubmissions.length} of {submissions.length} total entries
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              TanStack Table Headless Core Model
            </span>
          </div>
        </div>

        {/* Submission Detail Modal */}
        {detailModalSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Submission Payload</span>
                  <span className="text-[11px] font-mono text-rose-400 font-bold">
                    {detailModalSubmission.id}
                  </span>
                </div>
                <button
                  onClick={() => setDetailModalSubmission(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">Timestamp:</div>
                <div className="text-xs font-mono text-slate-300">
                  {detailModalSubmission.timestamp}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">Data Object:</div>
                <pre className="p-3 rounded-lg bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
                  {JSON.stringify(detailModalSubmission.data, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setDetailModalSubmission(null)}
                  className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderTableCellValue(val: any): React.ReactNode {
  if (val === undefined || val === null || val === '') {
    return <span className="text-slate-600 font-mono text-[11px]">-</span>;
  }
  if (typeof val === 'boolean') {
    return (
      <span
        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
          val ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
        }`}
      >
        {val ? 'TRUE' : 'FALSE'}
      </span>
    );
  }
  if (Array.isArray(val)) {
    return (
      <span className="text-[11px] font-mono text-slate-300">
        [{val.length} items]
      </span>
    );
  }
  if (typeof val === 'object') {
    return <span className="text-[11px] font-mono text-slate-400">{JSON.stringify(val)}</span>;
  }
  return <span>{String(val)}</span>;
}
