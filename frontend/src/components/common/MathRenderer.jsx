import React, { useMemo } from 'react';
import katex from 'katex';

/**
 * Pre-processes text to fix common AI formatting issues:
 * 1. Trailing punctuation inside math delimiters: "$x = 5.$" -> "$x = 5$."
 * 2. Unclosed dollar signs at the end of definitions
 * 3. Unwrapped LaTeX environments like \begin{cases}...\end{cases}
 */
export function preProcessMathText(input) {
  if (!input || typeof input !== 'string') return '';
  let str = input;

  // Move trailing punctuation outside dollar signs: "$x = 5.$" -> "$x = 5$."
  str = str.replace(/\$([^$\n]+?)([\.,;])\$/g, '$$$1$$$2');

  // If text has an odd number of $, and ends with an equation-like tail, close it!
  const dollarCount = (str.match(/\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    const lastDollarIdx = str.lastIndexOf('$');
    const tail = str.slice(lastDollarIdx + 1);
    if (tail.endsWith('.')) {
      str = str.slice(0, -1) + '$.';
    } else {
      str = str + '$';
    }
  }

  // Wrap unwrapped LaTeX environments like \begin{cases}...\end{cases}
  str = str.replace(
    /(?<!\$)\\begin\{([a-zA-Z*]+)\}([\s\S]*?)\\end\{\1\}(?!\$)/g,
    '$$\\begin{$1}$2\\end{$1}$$'
  );

  return str;
}

/**
 * Normalizes common unicode symbols, plain math notations,
 * derivatives, and piecewise cases into clean LaTeX for KaTeX.
 */
export function normalizeMathExpression(rawExpr) {
  if (!rawExpr || typeof rawExpr !== 'string') return '';

  let str = rawExpr.trim();

  // Strip wrapping delimiters if already present
  if (str.startsWith('$$') && str.endsWith('$$')) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith('$') && str.endsWith('$')) {
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('\\[') && str.endsWith('\\]')) {
    str = str.slice(2, -2).trim();
  } else if (str.startsWith('\\(') && str.endsWith('\\)')) {
    str = str.slice(2, -2).trim();
  }

  // Strip trailing punctuation inside math token (e.g. "x = 5." -> "x = 5")
  if (/[a-zA-Z0-9\}\)\]]\.$/.test(str)) {
    str = str.slice(0, -1).trim();
  } else if (/[a-zA-Z0-9\}\)\]],$/.test(str)) {
    str = str.slice(0, -1).trim();
  } else if (/[a-zA-Z0-9\}\)\]];$/.test(str)) {
    str = str.slice(0, -1).trim();
  }

  // Handle piecewise expressions
  const piecewiseMatch = str.match(
    /^([^=]+=\s*)?\{\s*([^,;]+)\s*,\s*([^;]+)\s*;\s*([^,;]+)\s*,\s*([^}]+)\s*\}$/
  );

  if (piecewiseMatch) {
    const prefix = piecewiseMatch[1]
      ? normalizeMathExpression(piecewiseMatch[1])
      : '';

    const val1 = normalizeMathTokens(piecewiseMatch[2]);
    const cond1 = normalizeMathTokens(piecewiseMatch[3]);
    const val2 = normalizeMathTokens(piecewiseMatch[4]);
    const cond2 = normalizeMathTokens(piecewiseMatch[5]);

    return `${prefix}\\begin{cases} ${val1}, & ${cond1} \\\\[6pt] ${val2}, & ${cond2} \\end{cases}`;
  }

  return normalizeMathTokens(str);
}

/**
 * Replaces unicode mathematical characters and symbols with LaTeX commands.
 */
function normalizeMathTokens(input) {
  if (!input) return '';

  let text = input;

  // Replacements for integrals and limits
  text = text.replace(/∫\s*₋∞\s*\^\s*∞/g, '\\int_{-\\infty}^{\\infty}');
  text = text.replace(/∫\s*-\s*∞\s*\^\s*∞/g, '\\int_{-\\infty}^{\\infty}');
  text = text.replace(/∫_\{?-\s*∞\}?\^\{?∞\}?/g, '\\int_{-\\infty}^{\\infty}');
  text = text.replace(/∫/g, '\\int ');
  text = text.replace(/₋∞/g, '_{-\\infty}');
  text = text.replace(/∞/g, '\\infty ');

  // Derivatives
  text = text.replace(/\bd\^2\/dt\^2\b/g, '\\frac{d^2}{dt^2}');
  text = text.replace(/\bd\^2\/dx\^2\b/g, '\\frac{d^2}{dx^2}');
  text = text.replace(/\bd\/dt\b/g, '\\frac{d}{dt}');
  text = text.replace(/\bd\/dx\b/g, '\\frac{d}{dx}');
  text = text.replace(/\b∂\/∂t\b/g, '\\frac{\\partial}{\\partial t}');
  text = text.replace(/\b∂\/∂x\b/g, '\\frac{\\partial}{\\partial x}');

  // Greek characters
  const greekMap = {
    'α': '\\alpha ',
    'β': '\\beta ',
    'γ': '\\gamma ',
    'δ': '\\delta ',
    'Δ': '\\Delta ',
    'ε': '\\epsilon ',
    'θ': '\\theta ',
    'λ': '\\lambda ',
    'μ': '\\mu ',
    'π': '\\pi ',
    'ρ': '\\rho ',
    'σ': '\\sigma ',
    'Σ': '\\sum ',
    'τ': '\\tau ',
    'ω': '\\omega ',
    'Ω': '\\Omega ',
  };

  for (const [char, repl] of Object.entries(greekMap)) {
    text = text.split(char).join(repl);
  }

  // Relations and arrows
  text = text.replace(/→|->/g, ' \\to ');
  text = text.replace(/≥|>=/g, ' \\ge ');
  text = text.replace(/≤|<=/g, ' \\le ');
  text = text.replace(/≠|!=/g, ' \\ne ');
  text = text.replace(/±|\+\/-/g, ' \\pm ');
  text = text.replace(/×/g, ' \\times ');
  text = text.replace(/·/g, ' \\cdot ');

  // Fix * used as multiplication or convolution in LaTeX mode
  text = text.replace(/(\w|\))\s*\*\s*(\w|\()/g, '$1 \\ast $2');

  // Unicode subscripts
  const subMap = {
    '₀': '_0',
    '₁': '_1',
    '₂': '_2',
    '₃': '_3',
    '₄': '_4',
    '₅': '_5',
    '₆': '_6',
    '₇': '_7',
    '₈': '_8',
    '₉': '_9',
    'ᵢ': '_i',
    'ₙ': '_n',
    'ₖ': '_k',
  };

  for (const [char, repl] of Object.entries(subMap)) {
    text = text.split(char).join(repl);
  }

  // Unicode superscripts
  const supMap = {
    '⁰': '^0',
    '¹': '^1',
    '²': '^2',
    '³': '^3',
    '⁴': '^4',
    '⁵': '^5',
    '⁶': '^6',
    '⁷': '^7',
    '⁸': '^8',
    '⁹': '^9',
    'ⁿ': '^n',
  };

  for (const [char, repl] of Object.entries(supMap)) {
    text = text.split(char).join(repl);
  }

  // Unit ramp product formatting
  text = text.replace(/(\bt)\s+(u\(t\))/g, '$1 \\cdot $2');

  return text;
}

/**
 * Checks if a string looks like a standalone mathematical equation (no prose words).
 */
export function isPureMath(str) {
  if (!str || typeof str !== 'string') return false;

  const s = str.trim();

  // Explicit wrapping delimiters
  if (s.startsWith('$$') && s.endsWith('$$')) return true;
  if (s.startsWith('\\[') && s.endsWith('\\]')) return true;

  // If it has multiple normal words with spaces, it is English prose, NOT pure math!
  const stripped = s.replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, ' ');
  const words = stripped.match(/[a-zA-Z]{3,}/g) || [];
  const mathKeywords = new Set([
    'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
    'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'lim', 'det', 'max', 'min',
    'mod', 'gcd', 'deg', 'dim', 'ker', 'hom', 'sup', 'inf', 'arg'
  ]);
  const proseWords = words.filter(w => !mathKeywords.has(w.toLowerCase()));
  if (proseWords.length >= 2) return false;

  return /\\(frac|int|sum|delta|alpha|beta|to|ge|le|partial|cases|sqrt|infty)|[a-zA-Z]\([a-zA-Z]\)\s*=|[x-z]\^[0-9]|=/.test(
    s
  );
}

/**
 * Safely renders LaTeX using KaTeX.
 * NEVER outputs raw `#cc0000` KaTeX parse error HTML.
 */
export function safeRenderKaTeX(latex, isBlock = false) {
  if (!latex || typeof latex !== 'string') return null;

  try {
    const html = katex.renderToString(latex, {
      displayMode: isBlock,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });

    // Check if KaTeX generated an error span
    if (html && html.includes('class="katex-error"')) {
      console.warn('KaTeX reported parse error for expression:', latex);
      return null; // Return null so clean fallback renders, NOT red error text!
    }

    return html;
  } catch (err) {
    console.warn('KaTeX render fallback:', err);
    return null;
  }
}

/**
 * Parses mixed text containing inline math, block math,
 * LaTeX expressions, and backtick-wrapped expressions.
 */
export function parseMixedMath(content) {
  if (!content || typeof content !== 'string') return [];

  const preprocessed = preProcessMathText(content);

  // Standalone pure formula only if no prose sentences
  if (isPureMath(preprocessed) && !preprocessed.includes('\n\n')) {
    return [
      {
        type: 'block-math',
        raw: normalizeMathExpression(preprocessed),
      },
    ];
  }

  const fragments = [];

  const regex =
    /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|`[^`\n]+`)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(preprocessed)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: 'text',
        raw: preprocessed.slice(lastIndex, match.index),
      });
    }

    const token = match[0];

    if (token.startsWith('$$') && token.endsWith('$$')) {
      fragments.push({
        type: 'block-math',
        raw: normalizeMathExpression(token.slice(2, -2)),
      });
    } else if (token.startsWith('$') && token.endsWith('$')) {
      fragments.push({
        type: 'inline-math',
        raw: normalizeMathExpression(token.slice(1, -1)),
      });
    } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
      fragments.push({
        type: 'block-math',
        raw: normalizeMathExpression(token.slice(2, -2)),
      });
    } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
      fragments.push({
        type: 'inline-math',
        raw: normalizeMathExpression(token.slice(2, -2)),
      });
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const codeContent = token.slice(1, -1).trim();

      if (isPureMath(codeContent)) {
        fragments.push({
          type: 'inline-math',
          raw: normalizeMathExpression(codeContent),
        });
      } else {
        fragments.push({
          type: 'code',
          raw: codeContent,
        });
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < preprocessed.length) {
    fragments.push({
      type: 'text',
      raw: preprocessed.slice(lastIndex),
    });
  }

  return fragments;
}

/**
 * Reusable MathRenderer Component
 *
 * Supports:
 * - content: Mixed text or math (used by flashcards)
 * - expression: Standalone mathematical expression
 * - text: Mixed text or markdown string
 * - children: Text passed as children
 * - displayMode: Centered display equation
 */
const MathRenderer = ({
  content,
  expression,
  text,
  children,
  displayMode = false,
  className = '',
}) => {
  // IMPORTANT: content is supported for FlashcardViewer and DeckDetailView
  const input = content ?? expression ?? text ?? children ?? '';

  const renderedContent = useMemo(() => {
    if (!input || typeof input !== 'string') {
      return null;
    }

    // Direct expression prop or displayMode specified
    if (expression || displayMode) {
      const normalized = normalizeMathExpression(input);
      const html = safeRenderKaTeX(normalized, displayMode);

      if (html) {
        return (
          <div
            className={`studypilot-math-block overflow-x-auto py-1 text-center select-text ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      return (
        <div
          className={`studypilot-math-block overflow-x-auto py-1 text-center select-text font-mono text-xs sm:text-sm text-slate-800 ${className}`}
        >
          {input}
        </div>
      );
    }

    // Mixed text and inline equations
    const fragments = parseMixedMath(input);

    return (
      <span className={`studypilot-math-text inline leading-relaxed ${className}`}>
        {fragments.map((frag, idx) => {
          if (frag.type === 'block-math') {
            const html = safeRenderKaTeX(frag.raw, true);

            if (html) {
              return (
                <div
                  key={idx}
                  className="my-3 py-1.5 overflow-x-auto text-center"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            }

            return (
              <div
                key={idx}
                className="my-2 p-2 rounded-xl bg-slate-100/90 text-center font-mono text-xs text-slate-800"
              >
                {frag.raw}
              </div>
            );
          }

          if (frag.type === 'inline-math') {
            const html = safeRenderKaTeX(frag.raw, false);

            if (html) {
              return (
                <span
                  key={idx}
                  className="inline-block mx-0.5 align-baseline text-slate-900"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            }

            // Fallback for unparseable math: clean monospace badge, NEVER bright red!
            return (
              <span
                key={idx}
                className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-[11px] font-medium"
              >
                {frag.raw}
              </span>
            );
          }

          if (frag.type === 'code') {
            return (
              <code
                key={idx}
                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]"
              >
                {frag.raw}
              </code>
            );
          }

          // Plain text fragment
          return <span key={idx}>{frag.raw}</span>;
        })}
      </span>
    );
  }, [input, content, expression, displayMode, className]);

  return renderedContent;
};

export default MathRenderer;
