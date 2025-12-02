
export const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/^#+\s/gm, '')          // Headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
    .replace(/`/g, '');              // Code ticks
};

export const getWordCount = (text: string): number => {
  if (!text) return 0;
  // Strip markdown to get a more accurate word count of the readable text
  return stripMarkdown(text).trim().split(/\s+/).length;
};
