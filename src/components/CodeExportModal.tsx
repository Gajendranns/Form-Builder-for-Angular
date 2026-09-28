import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  FileJson,
  X,
  ExternalLink,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { FormConfig } from '../types/form';
import { generateAngularReactiveCode } from '../utils/codeGenerators/angularReactiveGenerator';
import { generateTanStackAngularCode } from '../utils/codeGenerators/tanstackAngularGenerator';
import { generateZodSchema } from '../utils/codeGenerators/zodSchemaGenerator';
import { generateProjectZip } from '../utils/codeGenerators/projectZipGenerator';

interface CodeExportModalProps {
  formConfig: FormConfig;
  isOpen?: boolean;
  onClose?: () => void;
  isInlineTab?: boolean;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  formConfig,
  isOpen = true,
  onClose,
  isInlineTab = false,
}) => {
  const [activeFileTab, setActiveFileTab] = useState<'reactive-ts' | 'reactive-html' | 'tanstack' | 'zod' | 'readme'>('reactive-ts');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const reactiveCode = generateAngularReactiveCode(formConfig);
  const tanstackCode = generateTanStackAngularCode(formConfig);
  const zodSchema = generateZodSchema(formConfig);

  const readmeContent = `# ${formConfig.title}
Angular Standalone Form generated with NgFormCraft (tancn.dev for Angular).

## Setup Instructions

1. Create or open your Angular 17/18/19 project:
\`\`\`bash
ng new my-angular-app --standalone --style=css
cd my-angular-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install zod
# If using @tanstack/angular-form:
npm install @tanstack/angular-form @tanstack/zod-form-adapter
\`\`\`

3. Place files in your project:
- \`src/app/${formConfig.id}-form.component.ts\`
- \`src/app/${formConfig.id}-form.component.html\`
- \`src/app/${formConfig.id}.schema.ts\`

4. Render inside your main view:
\`\`\`html
<app-${formConfig.id}-form />
\`\`\`
`;

  let currentCode = '';
  let currentFileName = '';
  let language = 'typescript';

  switch (activeFileTab) {
    case 'reactive-ts':
      currentCode = reactiveCode.tsCode;
      currentFileName = `${formConfig.id}-form.component.ts`;
      language = 'typescript';
      break;
    case 'reactive-html':
      currentCode = reactiveCode.htmlCode;
      currentFileName = `${formConfig.id}-form.component.html`;
      language = 'html';
      break;
    case 'tanstack':
      currentCode = tanstackCode;
      currentFileName = `${formConfig.id}.tanstack.component.ts`;
      language = 'typescript';
      break;
    case 'zod':
      currentCode = zodSchema;
      currentFileName = `${formConfig.id}.schema.ts`;
      language = 'typescript';
      break;
    case 'readme':
      currentCode = readmeContent;
      currentFileName = 'README.md';
      language = 'markdown';
      break;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await generateProjectZip(formConfig);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formConfig.id}-angular-project.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to generate ZIP', e);
    } finally {
      setIsZipping(false);
    }
  };

  const content = (
    <div className="flex flex-col h-full space-y-3 sm:space-y-4">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-semibold">
              Production-Ready Code Generation
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Angular 19 Standalone
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
            Export Angular Component & Zod Schema
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isZipping ? 'Bundling...' : 'Download ZIP'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 shadow-sm transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy File</span>
              </>
            )}
          </button>

          {onClose && !isInlineTab && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setActiveFileTab('reactive-ts')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFileTab === 'reactive-ts'
              ? 'border-rose-500 bg-slate-900/90 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FileCode className="h-3.5 w-3.5 text-rose-400" />
          <span>{formConfig.id}-form.component.ts</span>
        </button>

        <button
          onClick={() => setActiveFileTab('reactive-html')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFileTab === 'reactive-html'
              ? 'border-rose-500 bg-slate-900/90 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-amber-400" />
          <span>{formConfig.id}-form.component.html</span>
        </button>

        <button
          onClick={() => setActiveFileTab('tanstack')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFileTab === 'tanstack'
              ? 'border-rose-500 bg-slate-900/90 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Code2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>@tanstack/angular-form</span>
        </button>

        <button
          onClick={() => setActiveFileTab('zod')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFileTab === 'zod'
              ? 'border-rose-500 bg-slate-900/90 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <FileJson className="h-3.5 w-3.5 text-emerald-400" />
          <span>{formConfig.id}.schema.ts (Zod)</span>
        </button>

        <button
          onClick={() => setActiveFileTab('readme')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeFileTab === 'readme'
              ? 'border-rose-500 bg-slate-900/90 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 text-purple-400" />
          <span>README.md</span>
        </button>
      </div>

      {/* Code Display Area */}
      <div className="relative flex-1 min-h-[420px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs font-mono text-slate-400">
          <span>{currentFileName}</span>
          <span className="text-[11px] text-slate-500">
            {currentCode.split('\n').length} lines · UTF-8
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 text-[11px] font-mono text-slate-200 leading-relaxed">
          <pre className="select-text whitespace-pre overflow-x-auto">
            {currentCode}
          </pre>
        </div>
      </div>
    </div>
  );

  if (isInlineTab) {
    return (
      <div className="flex-1 bg-slate-900/30 overflow-y-auto p-3.5 sm:p-6 lg:p-8 flex flex-col items-center">
        <div className="w-full max-w-5xl rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-5xl max-h-[92vh] rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col">
        {content}
      </div>
    </div>
  );
};

