import katex from 'katex';

/**
 * Checks if a string contains LaTeX delimiters ($$, $, \[, \() or LaTeX commands (\frac, \sqrt, \int, \sum, etc.)
 */
export function containsLatex(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  // Check for delimiters: $$, $, \[, \(
  if (/\$\$[\s\S]+?\$\$|\$[^\$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)/.test(str)) {
    return true;
  }
  // Check for common LaTeX math keywords / symbols
  if (
    /\\(frac|sqrt|int|oint|sum|prod|lim|infty|partial|nabla|vec|mathbf|boldsymbol|alpha|beta|gamma|theta|lambda|pi|mu|sigma|omega|Delta|Sigma|Omega|times|cdot|pm|approx|neq|le|ge|leq|geq|in|notin|subset|cap|cup|forall|exists|rightarrow|to|begin|end|sin|cos|tan|log|ln|det|matrix|pmatrix|bmatrix|cases)\b/.test(
      str
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Render a string with embedded LaTeX or raw LaTeX into clean, accessible HTML using KaTeX.
 * Handles $$, $, \[, \( delimiters, and standalone LaTeX expressions.
 */
export function renderMathToHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  if (!containsLatex(text)) {
    return escapeHtml(text);
  }

  try {
    let formatted = text;

    // 1. Handle Display Math: $$ ... $$ and \[ ... \]
    formatted = formatted.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, (_, g1, g2) => {
      const math = (g1 || g2 || '').trim();
      try {
        return katex.renderToString(math, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `$$${escapeHtml(math)}$$`;
      }
    });

    // 2. Handle Inline Math: $ ... $ and \( ... \)
    formatted = formatted.replace(/\$([^\$]+?)\$|\\\(([^\)]+?)\\\)/g, (_, g1, g2) => {
      const math = (g1 || g2 || '').trim();
      try {
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${escapeHtml(math)}$`;
      }
    });

    // 3. If there are still raw LaTeX commands that were not wrapped in dollar signs (e.g. "\frac{1}{2} + \sqrt{x}")
    if (
      /\\(frac|sqrt|int|oint|sum|prod|lim|infty|partial|nabla|vec|mathbf|alpha|beta|gamma|theta|lambda|pi|mu|sigma|omega|times|cdot|pm|approx|neq|le|ge|in|begin|sin|cos|tan)/.test(
        formatted
      )
    ) {
      // Find LaTeX tokens or expressions and render them
      formatted = formatted.replace(
        /(\\(?:frac|sqrt|int|oint|sum|prod|lim|infty|partial|nabla|vec|mathbf|boldsymbol|alpha|beta|gamma|theta|lambda|pi|mu|sigma|omega|times|cdot|pm|approx|neq|le|ge|in|begin\{[a-z]+\}[\s\S]*?\\end\{[a-z]+\}|sin|cos|tan)\b[^\s,;:?!<>)]*(?:\{[^{}]*\}|[0-9a-zA-Z^_+\-*/=()]+)*)/g,
        (match) => {
          try {
            return katex.renderToString(match.trim(), {
              displayMode: false,
              throwOnError: false,
            });
          } catch {
            return match;
          }
        }
      );
    }

    return formatted;
  } catch (err) {
    console.warn('KaTeX rendering error:', err);
    return escapeHtml(text);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
