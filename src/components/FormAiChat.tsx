import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Layers,
  Wand2,
  Zap,
  Sliders,
  Check,
  Code2,
  Eye,
  AlertCircle,
  HelpCircle,
  Plus,
} from 'lucide-react';
import { FormConfig, FormEngine, UIFramework } from '../types/form';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  formConfig?: FormConfig | null;
  applied?: boolean;
}

interface FormAiChatProps {
  currentFormConfig: FormConfig;
  onApplyForm: (formConfig: FormConfig) => void;
  onGoToBuilder?: () => void;
  isFloatingDrawer?: boolean;
  onCloseDrawer?: () => void;
}

const STARTER_PROMPTS = [
  {
    title: 'Employee Onboarding Wizard',
    prompt:
      'Create a 3-step employee onboarding wizard in Angular with Personal Information (name, email, phone, date of birth), Employment Details (job title, department select, salary slider), and Emergency Contacts with a dynamic repeating FormArray.',
  },
  {
    title: 'Customer Feedback & Rating',
    prompt:
      'Build a customer satisfaction feedback form with full name, rating stars (1-5), product category dropdown, feedback textarea with 500 char max, and a switch for "Would you recommend us to colleagues?". Use Material 3 styling.',
  },
  {
    title: 'Developer Event Registration',
    prompt:
      'Generate a developer conference registration form with attendee name, email, GitHub username, experience level radio buttons, track selection multiselect, dietary requirements, and an acceptance checkbox.',
  },
  {
    title: 'Expense Claim with Items FormArray',
    prompt:
      'Create an expense reimbursement form with claim title, expense date, currency selector, and a repeating FormArray for line items (item description, category, amount) with min 1 and max 10 items.',
  },
];

export const FormAiChat: React.FC<FormAiChatProps> = ({
  currentFormConfig,
  onApplyForm,
  onGoToBuilder,
  isFloatingDrawer = false,
  onCloseDrawer,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content:
        '👋 Welcome to **NgFormCraft AI**! Describe any form you want in plain English, and I will generate the complete layout, field types, validation rules, and Angular architecture for you.\n\nYou can also ask me to **modify, add fields, convert to multi-step, or restyle** your existing form.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-3.5-flash'
  );
  const [includeCanvasContext, setIncludeCanvasContext] = useState(true);
  const [lastAppliedFormId, setLastAppliedFormId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Build conversation payload for backend
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMessage)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          currentFormConfig: includeCanvasContext ? currentFormConfig : null,
          model: selectedModel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        content: data.message || 'I have generated your form configuration below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        formConfig: data.formConfig || null,
        applied: false,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Automatically apply if user explicitly requested a generation
      if (data.formConfig && data.formConfig.fields && data.formConfig.fields.length > 0) {
        onApplyForm(data.formConfig);
        setLastAppliedFormId(aiMessage.id);
        aiMessage.applied = true;
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content: `⚠️ Failed to generate form: ${err.message || 'Network error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFormClick = (msg: ChatMessage) => {
    if (!msg.formConfig) return;
    onApplyForm(msg.formConfig);
    setLastAppliedFormId(msg.id);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, applied: true } : m))
    );
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content:
          'Conversation reset. Tell me what kind of form you would like to build or modify!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      className={`flex flex-col h-full bg-slate-950 text-slate-100 ${
        isFloatingDrawer ? 'border-l border-slate-800' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-rose-600 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-950/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">NgFormCraft AI Architect</h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300">
                Gemini 3.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Natural language form generator & multi-turn assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Speed Picker */}
          <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.5-flash')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedModel === 'gemini-3.5-flash'
                  ? 'bg-rose-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Balanced high-reasoning form architecture"
            >
              Flash 3.5
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`px-2 py-1 rounded transition-colors ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-rose-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fastest generation speed"
            >
              Lite 3.1
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors"
            title="Clear chat history"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {isFloatingDrawer && onCloseDrawer && (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800"
              title="Close drawer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Context Awareness Bar */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeCanvasContext}
            onChange={(e) => setIncludeCanvasContext(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-rose-500/20"
          />
          <span className="text-[11px]">
            Include current canvas form as context (
            <span className="text-slate-200 font-medium">{currentFormConfig.title}</span>,{' '}
            {currentFormConfig.fields.length} controls)
          </span>
        </label>
        {onGoToBuilder && (
          <button
            type="button"
            onClick={onGoToBuilder}
            className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
          >
            <span>View Canvas</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                <span>{isUser ? 'You' : 'NgFormCraft AI'}</span>
                <span>•</span>
                <span>{message.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-rose-600 text-white rounded-tr-none shadow-md shadow-rose-950/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">
                  {message.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? (
                          <strong key={cIdx} className="font-semibold text-white">
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        )
                      )}
                    </p>
                  ))}
                </div>

                {/* Generated Form Card */}
                {message.formConfig && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {message.formConfig.title}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                            {message.formConfig.layoutType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {message.formConfig.description}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Specs Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/40 text-rose-300">
                        {message.formConfig.frameworkTarget === 'angular-signal-form'
                          ? '⚡ Signal Forms'
                          : message.formConfig.frameworkTarget === 'tanstack-angular-form'
                          ? '🎯 TanStack Form'
                          : '🛡️ Reactive Forms'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        UI: {message.formConfig.uiFramework || 'Tailwind'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {message.formConfig.fields.length} Controls
                      </span>
                    </div>

                    {/* Fields Preview Chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-slate-500">
                        Included Form Controls:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {message.formConfig.fields.map((f, i) => (
                          <span
                            key={f.id || i}
                            className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 flex items-center gap-1"
                          >
                            <span className="text-slate-500">[{f.type}]</span>
                            <span>{f.label}</span>
                            {f.validation?.required && (
                              <span className="text-rose-400 font-bold">*</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {message.applied || lastAppliedFormId === message.id ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Loaded into Builder Canvas</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">Ready to load</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyFormClick(message)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                        >
                          <Wand2 className="h-3.5 w-3.5" />
                          <span>
                            {message.applied || lastAppliedFormId === message.id
                              ? 'Re-apply to Canvas'
                              : 'Apply to Canvas'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start space-y-1.5">
            <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2.5 shadow-md">
              <div className="h-4 w-4 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
              <span>Architecting Angular form layout & validation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Suggestions (if only welcome message) */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 shrink-0">
          <span className="text-[10px] uppercase font-mono text-slate-500 block mb-2">
            Suggested Form Blueprints:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_PROMPTS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(starter.prompt)}
                className="text-left p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 hover:bg-slate-900 text-xs transition-colors group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-rose-300 flex items-center justify-between">
                  <span>{starter.title}</span>
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400" />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {starter.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="E.g. Create a user registration form with username, email, password strength, and terms checkbox..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 transition-colors shrink-0"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Generate</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>Powered by Google Gemini</span>
        </div>
      </div>
    </div>
  );
};
