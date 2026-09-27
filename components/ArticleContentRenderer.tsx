import React from 'react';

interface ArticleContentRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders structured markdown and sanitized HTML markup for articles with typography.
 */
export const ArticleContentRenderer: React.FC<ArticleContentRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content) return null;

  // Split into blocks by double newlines
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;

  const renderInline = (text: string): React.ReactNode => {
    // Process markdown links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderFormatting(text.substring(lastIndex, match.index)));
      }
      const linkText = match[1];
      const linkUrl = match[2];
      parts.push(
        <a 
          key={`link-${match.index}`} 
          href={linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#5856D6] hover:text-[#4341B8] underline underline-offset-2 font-medium"
        >
          {linkText}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderFormatting(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : text;
  };

  const renderFormatting = (text: string): React.ReactNode => {
    // Replace inline formatting safely
    // Bold: **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const segments: React.ReactNode[] = [];
    let cur = 0;
    let bMatch: RegExpExecArray | null;

    while ((bMatch = boldRegex.exec(text)) !== null) {
      if (bMatch.index > cur) {
        segments.push(renderItalicsAndCode(text.substring(cur, bMatch.index)));
      }
      segments.push(<strong key={`b-${bMatch.index}`} className="font-bold text-slate-900">{bMatch[1]}</strong>);
      cur = boldRegex.lastIndex;
    }
    if (cur < text.length) {
      segments.push(renderItalicsAndCode(text.substring(cur)));
    }

    return segments.length > 0 ? segments : text;
  };

  const renderItalicsAndCode = (text: string): React.ReactNode => {
    // Inline code: `code`
    const codeRegex = /`([^`]+)`/g;
    const parts: React.ReactNode[] = [];
    let cur = 0;
    let match: RegExpExecArray | null;

    while ((match = codeRegex.exec(text)) !== null) {
      if (match.index > cur) {
        parts.push(renderItalics(text.substring(cur, match.index)));
      }
      parts.push(
        <code 
          key={`code-${match.index}`} 
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-[#5856D6] font-mono text-sm border border-slate-200/80"
        >
          {match[1]}
        </code>
      );
      cur = codeRegex.lastIndex;
    }
    if (cur < text.length) {
      parts.push(renderItalics(text.substring(cur)));
    }
    return parts.length > 0 ? parts : text;
  };

  const renderItalics = (text: string): React.ReactNode => {
    const italicRegex = /\*([^*]+)\*/g;
    const parts: React.ReactNode[] = [];
    let cur = 0;
    let match: RegExpExecArray | null;

    while ((match = italicRegex.exec(text)) !== null) {
      if (match.index > cur) {
        parts.push(text.substring(cur, match.index));
      }
      parts.push(<em key={`em-${match.index}`} className="italic text-slate-800">{match[1]}</em>);
      cur = italicRegex.lastIndex;
    }
    if (cur < text.length) {
      parts.push(text.substring(cur));
    }
    return parts.length > 0 ? parts : text;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Code block
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <div key={`code-block-${i}`} className="my-6 rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-sm overflow-x-auto shadow-inner border border-slate-800">
          <pre>{codeLines.join('\n')}</pre>
        </div>
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={`h3-${i}`} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 tracking-tight">
          {renderInline(trimmed.substring(4))}
        </h3>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h2 key={`h2-${i}`} className="text-2xl sm:text-3xl font-bold text-slate-900 mt-10 mb-4 tracking-tight border-b border-slate-200/60 pb-2">
          {renderInline(trimmed.substring(3))}
        </h2>
      );
      i++;
      continue;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push(
        <h1 key={`h1-${i}`} className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-12 mb-5 tracking-tight">
          {renderInline(trimmed.substring(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [trimmed.substring(2)];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().substring(2));
        i++;
      }
      blocks.push(
        <blockquote key={`quote-${i}`} className="my-6 pl-4 sm:pl-6 border-l-4 border-[#7F7FFA] bg-indigo-50/40 py-3.5 pr-4 rounded-r-xl italic text-slate-700 text-base sm:text-lg leading-relaxed">
          {quoteLines.map((ql, qidx) => (
            <p key={qidx} className={qidx > 0 ? 'mt-2' : ''}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push(<hr key={`hr-${i}`} className="my-8 border-slate-200" />);
      i++;
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [trimmed.substring(2)];
      i++;
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().substring(2));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2.5 list-disc list-inside text-slate-700 leading-relaxed text-base">
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1 marker:text-[#7F7FFA]">
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [trimmed.replace(/^\d+\.\s/, '')];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2.5 list-decimal list-inside text-slate-700 leading-relaxed text-base">
          {listItems.map((item, idx) => (
            <li key={idx} className="pl-1 marker:font-bold marker:text-[#5856D6]">
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={`p-${i}`} className="my-4 text-slate-700 leading-relaxed text-base sm:text-lg font-normal">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className={`prose-slate max-w-none ${className}`}>
      {blocks}
    </div>
  );
};
