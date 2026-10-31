import React, { useMemo } from 'react';
import katex from 'katex';

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
 * Checks if a string looks like a standalone mathematical equation.
 */
function isMathFormula(str) {
  if (!str || typeof str !== 'string') return false;

  const s = str.trim();

  if (
    s.startsWith('$') ||
    s.startsWith('\\[') ||
    s.startsWith('\\(')
  ) {
    return true;
  }

  if (
    /\\(frac|int|sum|delta|alpha|beta|to|ge|le|partial|cases|sqrt|infty)/.test(s)
  ) {
    return true;
  }

  if (
    /[a-zA-Z]\([a-zA-Z]\)\s*=|x\^2|\bdt\b|\bdy\b|\bdx\b|\b\d+[a-zA-Z]\b|∫|δ|λ|ω/.test(s)
  ) {
    return true;
  }

  return false;
}

/**
 * Safely renders LaTeX using KaTeX.
 */
export function safeRenderKaTeX(latex, isBlock = false) {
  try {
    return katex.renderToString(latex, {
      displayMode: isBlock,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });
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

  // Entire string is a standalone formula
  if (
    isMathFormula(content) &&
    !content.includes('\n\n') &&
    !/\b(the|is|are|which|when|where|because|following)\b/i.test(content)
  ) {
    return [
      {
        type: 'block-math',
        raw: normalizeMathExpression(content),
      },
    ];
  }

  const fragments = [];

  const regex =
    /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|`[^`\n]+`)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      fragments.push({
        type: 'text',
        raw: content.slice(lastIndex, match.index),
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

      if (isMathFormula(codeContent)) {
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

  if (lastIndex < content.length) {
    fragments.push({
      type: 'text',
      raw: content.slice(lastIndex),
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
        <span className={`font-mono ${className}`}>
          {input}
        </span>
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
              <span key={idx} className="font-mono text-xs">
                {frag.raw}
              </span>
            );
          }

          if (frag.type === 'inline-math') {
            const html = safeRenderKaTeX(frag.raw, false);

            if (html) {
              return (
                <span
                  key={idx}
                  className="inline-block mx-0.5 align-baseline"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            }

            return (
              <span key={idx} className="font-mono text-xs">
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
