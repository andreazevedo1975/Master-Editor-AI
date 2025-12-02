
import React from 'react';

// A simple utility to render basic markdown safely without a heavy library
// Since we control the input (Gemini JSON), we can do basic replacement for paragraphs and bold/italic
// For a production app, use 'react-markdown'
interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  
  // Split by double newline to form paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim() !== '');

  // We use a React Fragment here instead of a styled div.
  // Styling is delegated to the parent container via Tailwind 'prose' classes.
  // This allows the Focus Mode to scale text size (prose-xl) without conflicts.
  return (
    <>
      {paragraphs.map((para, idx) => {
        // Basic formatting replacement
        let __html = para
          // Bold
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-100 font-bold">$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/g, '<em class="text-stone-200">$1</em>');
          
        return <p key={idx} dangerouslySetInnerHTML={{ __html }} />;
      })}
    </>
  );
};
