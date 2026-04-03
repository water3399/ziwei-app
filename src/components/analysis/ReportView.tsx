'use client';

import { useState } from 'react';

interface ReportViewProps {
  markdown: string;
}

interface Section {
  title: string;
  content: string;
}

function parseSections(md: string): Section[] {
  const parts = md.split(/^## /m).filter(Boolean);
  return parts.map(part => {
    const lines = part.split('\n');
    const title = lines[0]?.trim() || '';
    const content = lines.slice(1).join('\n').trim();
    return { title, content };
  });
}

function getSectionColor(title: string): string {
  if (/命宮|性格|人格/.test(title)) return 'border-l-purple-500';
  if (/事業|學業|官祿/.test(title)) return 'border-l-amber-500';
  if (/財|財運/.test(title)) return 'border-l-yellow-500';
  if (/感情|婚姻|夫妻/.test(title)) return 'border-l-pink-500';
  if (/健康|疾厄/.test(title)) return 'border-l-emerald-500';
  if (/格局/.test(title)) return 'border-l-sky-500';
  if (/運勢|大限|流年/.test(title)) return 'border-l-orange-500';
  if (/總結|建議/.test(title)) return 'border-l-yellow-400';
  return 'border-l-purple-600';
}

function renderContent(content: string): JSX.Element {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // H3 headers
        if (trimmed.startsWith('### ')) {
          return <h4 key={i} className="text-yellow-300 font-bold mt-4 mb-1">{trimmed.slice(4)}</h4>;
        }

        // Bold lines
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return <p key={i} className="text-purple-100 font-semibold mt-2">{trimmed.slice(2, -2)}</p>;
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const text = trimmed.slice(2);
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span className="text-purple-200 text-sm" dangerouslySetInnerHTML={{
                __html: text
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-100">$1</strong>')
                  .replace(/化祿/g, '<span class="text-emerald-400">化祿</span>')
                  .replace(/化權/g, '<span class="text-amber-400">化權</span>')
                  .replace(/化科/g, '<span class="text-sky-400">化科</span>')
                  .replace(/化忌/g, '<span class="text-red-400">化忌</span>')
                  .replace(/（廟）|廟旺/g, '<span class="text-yellow-300">$&</span>')
                  .replace(/（陷）|落陷/g, '<span class="text-red-400">$&</span>')
              }} />
            </div>
          );
        }

        // Numbered items
        if (/^\d+[\.\、]/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-purple-200 text-sm" dangerouslySetInnerHTML={{
                __html: trimmed
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-100">$1</strong>')
                  .replace(/化祿/g, '<span class="text-emerald-400">化祿</span>')
                  .replace(/化權/g, '<span class="text-amber-400">化權</span>')
                  .replace(/化科/g, '<span class="text-sky-400">化科</span>')
                  .replace(/化忌/g, '<span class="text-red-400">化忌</span>')
              }} />
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={i} className="text-purple-200/90 text-sm leading-relaxed" dangerouslySetInnerHTML={{
            __html: trimmed
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-100">$1</strong>')
              .replace(/化祿/g, '<span class="text-emerald-400">化祿</span>')
              .replace(/化權/g, '<span class="text-amber-400">化權</span>')
              .replace(/化科/g, '<span class="text-sky-400">化科</span>')
              .replace(/化忌/g, '<span class="text-red-400">化忌</span>')
          }} />
        );
      })}
    </div>
  );
}

export default function ReportView({ markdown }: ReportViewProps) {
  const sections = parseSections(markdown);
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(sections.map((_, i) => i)) // all open by default
  );

  const toggle = (idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (sections.length === 0) {
    return <div className="text-purple-400 text-center py-10">報告生成中...</div>;
  }

  return (
    <div className="space-y-3">
      {sections.map((section, i) => (
        <div
          key={i}
          className={`border-l-4 ${getSectionColor(section.title)} bg-purple-950/40 rounded-r-lg overflow-hidden border border-purple-800/30`}
        >
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-purple-900/20 transition-colors"
          >
            <h3 className="text-yellow-300 font-bold text-sm text-left">{section.title}</h3>
            <span className="text-purple-500 text-xs">{openSections.has(i) ? '收合 ▲' : '展開 ▼'}</span>
          </button>
          {openSections.has(i) && (
            <div className="px-4 pb-4">
              {renderContent(section.content)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
