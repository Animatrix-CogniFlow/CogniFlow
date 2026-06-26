import { Fragment } from "react";
import { MathRenderer } from "./MathRenderer";

/**
 * Lightweight markdown renderer (no deps) for the AI tutor.
 * Handles: code fences, headings, bold, inline code, bullet lists,
 * numbered lists, and LaTeX mathematical symbols.
 */
export function MarkdownLite({ text }: { text: string }) {
  // Pre-process LaTeX delimiters: convert \[...\] to $$...$$ and \(...\) to $...$
  const processedText = text
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  // Split on ``` fences — odd-indexed blocks are code
  const blocks = processedText.split(/```/);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        const isCode = i % 2 === 1;
        if (isCode) {
          const lines = block.replace(/^[a-z]*\n/, "").trimEnd();
          return (
            <pre
              key={i}
              className="overflow-x-auto rounded-xl border border-silver-300 bg-white p-3.5 font-mono text-[13px] text-silver-900 dark:border-abyss-700 dark:bg-abyss-950 dark:text-cobalt-200"
            >
              <code>{lines}</code>
            </pre>
          );
        }
        return <Fragment key={i}>{renderProse(block)}</Fragment>;
      })}
    </div>
  );
}

function renderProse(text: string) {
  // Split on block math: $$...$$
  const blocks = text.split(/(\$\$.*?\$\$)/gs);
  return blocks.map((chunk, index) => {
    const isBlockMath = chunk.startsWith("$$") && chunk.endsWith("$$");
    if (isBlockMath) {
      const mathContent = chunk.slice(2, -2).trim();
      return (
        <div key={index} className="my-3 overflow-x-auto text-center">
          <MathRenderer math={mathContent} block={true} />
        </div>
      );
    }

    // Split on lines for normal prose, list rendering
    const lines = chunk.split("\n").filter((l) => l.trim() !== "");
    return lines.map((line, i) => {
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={`${index}-${i}`} className="pl-1">
            <span className="font-medium text-gold-600 dark:text-cobalt-400">
              {line.match(/^\d+\./)?.[0]}
            </span>{" "}
            {inline(line.replace(/^\d+\.\s/, ""))}
          </p>
        );
      }
      // Bullet list item
      if (/^[-*]\s/.test(line)) {
        return (
          <p key={`${index}-${i}`} className="flex gap-2 pl-1">
            <span className="text-gold-500 dark:text-cobalt-400">•</span>
            <span>{inline(line.replace(/^[-*]\s/, ""))}</span>
          </p>
        );
      }
      return <p key={`${index}-${i}`}>{inline(line)}</p>;
    });
  });
}

function inline(line: string) {
  // Split on inline math ($...$), bold (**...**), and inline code (`...`)
  const parts = line.split(/(\$[^\$]+\$|\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("$") && p.endsWith("$")) {
      const mathContent = p.slice(1, -1);
      return <MathRenderer key={i} math={mathContent} block={false} />;
    }
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-silver-200 px-1.5 py-0.5 font-mono text-[12px] text-silver-900 dark:bg-abyss-800 dark:text-cobalt-200"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{p}</span>;
  });
}
