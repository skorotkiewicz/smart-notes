import { useLayoutEffect, useCallback, useState } from "react";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { codeToHast } from "shiki/bundle/web";
import "./CodeBlock.css";

const cache = new Map();

async function highlight(code, lang) {
  const key = `${lang}:${code}`;
  if (cache.has(key)) return cache.get(key);

  const out = await codeToHast(code, {
    lang,
    theme: "github-dark",
  });

  const jsxTree = toJsxRuntime(out, { Fragment, jsx, jsxs });
  cache.set(key, jsxTree);
  return jsxTree;
}

export function CodeBlock({ children, id, language = "javascript", initial }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [nodes, setNodes] = useState(initial);

  const copyToClipboard = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  useLayoutEffect(() => {
    void highlight(children, language).then(setNodes);
  }, [children, language]);

  return (
    <div className="codeblock">
      {/* Header */}
      <div className="codeblock-header">
        <span className="codeblock-lang">{language}</span>
        <button
          type="button"
          className={`copy-btn ${copiedCode === id ? "copied" : ""}`}
          onClick={() => copyToClipboard(children, id)}
          title="Copy to clipboard"
        >
          {copiedCode === id ? "✅ Copied!" : "📋 Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="codeblock-pre">
        <code>{nodes ?? <span className="loading">Loading…</span>}</code>
      </pre>
    </div>
  );
}
