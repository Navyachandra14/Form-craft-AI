import React from 'react';
import { renderMathToHtml, containsLatex } from '../lib/mathUtils';

interface MathRendererProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  fallback?: React.ReactNode;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = '',
  as = 'span',
  fallback,
}) => {
  if (!text) {
    return fallback ? <>{fallback}</> : null;
  }

  // If text does not contain any LaTeX markers, render as normal text to optimize performance
  if (!containsLatex(text)) {
    const Component = as;
    return <Component className={className}>{text}</Component>;
  }

  const html = renderMathToHtml(text);
  const Component = as;

  return (
    <Component
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
