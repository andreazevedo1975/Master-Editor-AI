
import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface HistoryListItemProps {
  item: HistoryItem;
  onLoad: (item: HistoryItem) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onExport: (e: React.MouseEvent, item: HistoryItem, format: 'txt' | 'md' | 'pdf' | 'docx') => void;
}

const HistoryListItem: React.FC<HistoryListItemProps> = ({ item, onLoad, onDelete, onExport }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.result.textData?.content) {
      navigator.clipboard.writeText(item.result.textData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      onClick={() => onLoad(item)}
      className="group relative p-3 rounded-md bg-stone-950 border border-stone-800 hover:border-amber-700/50 hover:bg-stone-900 cursor-pointer transition-all"
    >
      <div className="pr-24">
        <h4 className="font-serif text-amber-500 font-medium text-sm truncate">{item.request.chapterName}</h4>
        <p className="text-xs text-stone-400 truncate">{item.request.bookTitle}</p>
        <p className="text-[10px] text-stone-600 mt-1">{new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
      </div>
      
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/80 rounded backdrop-blur-sm p-0.5 border border-stone-800 shadow-sm z-10">
        <button 
          onClick={handleCopy}
          className="p-1.5 text-stone-400 hover:text-green-500 hover:bg-stone-800 rounded transition-colors"
          title="Copiar Texto"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
        <button 
          onClick={(e) => onExport(e, item, 'docx')}
          className="p-1.5 text-stone-400 hover:text-blue-500 hover:bg-stone-800 rounded transition-colors"
          title="Baixar Word (.docx)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h2"></path></svg>
        </button>
        <button 
          onClick={(e) => onExport(e, item, 'pdf')}
          className="p-1.5 text-stone-400 hover:text-amber-500 hover:bg-stone-800 rounded transition-colors"
          title="Baixar PDF / Imprimir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        </button>
        <button 
          onClick={(e) => onExport(e, item, 'txt')}
          className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
          title="Baixar Texto (.txt)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button 
          onClick={(e) => onDelete(e, item.id)}
          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-800 rounded transition-colors"
          title="Excluir"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  );
};

interface ChapterHistoryListProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onExport: (e: React.MouseEvent, item: HistoryItem, format: 'txt' | 'md' | 'pdf' | 'docx') => void;
}

export const ChapterHistoryList: React.FC<ChapterHistoryListProps> = ({ history, onLoad, onDelete, onExport }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-stone-900 p-6 rounded-lg border border-stone-800 shadow-xl max-h-[500px] overflow-y-auto custom-scrollbar">
      <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center gap-2 sticky top-0 bg-stone-900 py-2 z-10 border-b border-stone-800">
        <span>📚</span> Biblioteca
      </h2>
      <div className="space-y-3">
        {history.map(item => (
          <HistoryListItem 
            key={item.id}
            item={item}
            onLoad={onLoad}
            onDelete={onDelete}
            onExport={onExport}
          />
        ))}
      </div>
    </div>
  );
};
