
import React, { useState, useRef, useEffect } from 'react';
import { AppStatus, GenerationResult } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { getWordCount } from '../utils/textUtils';

interface ChapterResultDisplayProps {
  result: GenerationResult;
  status: AppStatus;
  isFocusMode: boolean;
  onToggleFocusMode: (focused: boolean) => void;
  onExport: (format: 'txt' | 'md' | 'pdf' | 'docx') => void;
  onDownloadImage: () => void;
  onCopyText: () => void;
  copyTextSuccess: boolean;
  onCopyPrompt: () => void;
  copyPromptSuccess: boolean;
  onTitleChange?: (newTitle: string) => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onNavigateHistory?: (direction: 'prev' | 'next') => void;
}

export const ChapterResultDisplay: React.FC<ChapterResultDisplayProps> = ({
  result,
  status,
  isFocusMode,
  onToggleFocusMode,
  onExport,
  onDownloadImage,
  onCopyText,
  copyTextSuccess,
  onCopyPrompt,
  copyPromptSuccess,
  onTitleChange,
  hasPrevious,
  hasNext,
  onNavigateHistory
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Default to 18px (matches prose-lg)
  const [fontFamily, setFontFamily] = useState("'Merriweather', serif");
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportClick = (format: 'txt' | 'md' | 'pdf' | 'docx') => {
    onExport(format);
    setShowExportMenu(false);
  }

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => {
      const newSize = prev + delta;
      return Math.min(Math.max(newSize, 14), 32); // Limit between 14px and 32px
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSize(Number(e.target.value));
  };

  if (!result.textData) return null;

  const wordCount = getWordCount(result.textData.content);
  // Avg reading speed: 200 wpm
  const readingTime = Math.ceil(wordCount / 200);

  // Reusable Font Controls Component
  const renderFontControls = (extraClasses: string = "") => (
    <div className={`flex items-center bg-stone-950/80 rounded-md backdrop-blur-sm border border-stone-800 shadow-sm overflow-hidden select-none p-1 gap-2 ${extraClasses}`}>
      
      {/* Font Family Selector */}
      <div className="relative border-r border-stone-700 pr-2 mr-1">
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="bg-transparent text-[10px] md:text-xs font-medium text-stone-400 focus:text-amber-500 outline-none cursor-pointer appearance-none py-1 pr-4 pl-1 hover:text-stone-200 transition-colors"
          title="Alterar Família da Fonte"
        >
          <option value="'Merriweather', serif" className="bg-stone-900">Merriweather</option>
          <option value="'Inter', sans-serif" className="bg-stone-900">Inter</option>
          <option value="Georgia, serif" className="bg-stone-900">Georgia</option>
          <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" className="bg-stone-900">Mono</option>
        </select>
        {/* Custom Chevron for select */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none text-stone-500">
           <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>

      <button 
        onClick={() => adjustFontSize(-1)}
        className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
        title="Diminuir fonte"
      >
        <span className="text-xs font-serif">A-</span>
      </button>
      
      <div className="flex items-center gap-2">
        <input 
          type="range" 
          min="14" 
          max="32" 
          value={fontSize} 
          onChange={handleSliderChange}
          className="w-16 md:w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
          title="Ajustar tamanho"
        />
        <button
          onClick={() => setFontSize(18)}
          className="text-[10px] font-medium text-stone-500 min-w-[2rem] text-center cursor-pointer hover:text-amber-500 transition-colors"
          title="Clique para resetar (18px)"
        >
          {fontSize}px
        </button>
      </div>

      <button 
        onClick={() => adjustFontSize(1)}
        className="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
        title="Aumentar fonte"
      >
        <span className="text-sm font-serif">A+</span>
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in flex flex-col gap-8">
      
      {/* Floating Font Controls for Focus Mode */}
      {isFocusMode && (
        <div className="fixed top-6 left-6 z-[60] opacity-30 hover:opacity-100 transition-opacity duration-300">
           {renderFontControls("shadow-2xl border-stone-700 bg-stone-900/90 text-stone-200")}
        </div>
      )}

      {/* 1. MAIN CONTENT SECTION (Image + Text) */}
      <div className="flex flex-col gap-6">
        
        {/* Generated Image Header */}
        {result.imageUrl ? (
          <div className={`relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl border border-stone-800 group no-print transition-all duration-700 ${isFocusMode ? 'shadow-black/50' : ''}`}>
            <img src={result.imageUrl} alt="Chapter Art" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-80"></div>
            
            {/* Download Image Button Overlay - Enhanced */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
               <button 
                 onClick={onDownloadImage}
                 className="flex items-center gap-2 bg-stone-900/80 hover:bg-amber-700 text-white backdrop-blur-md px-4 py-2 rounded-full border border-stone-700 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                 title="Baixar Imagem Original (JPEG)"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                 <span className="text-sm font-medium">Baixar Arte</span>
               </button>
            </div>

            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
               <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight shadow-black drop-shadow-lg">
                {result.textData.title}
              </h2>
            </div>
          </div>
        ) : (
           status === AppStatus.GENERATING_IMAGE && (
              <div className="w-full aspect-video bg-stone-900 rounded-lg animate-pulse border border-stone-800 flex items-center justify-center no-print">
                  <span className="text-stone-600 font-serif italic">Criando ilustração...</span>
              </div>
           )
        )}

        {/* Chapter Content & Print Area */}
        <div id="chapter-print-area" className={`bg-stone-900 p-8 md:p-12 rounded-lg shadow-xl border border-stone-800 relative transition-all duration-500 ${isFocusMode ? 'border-transparent shadow-none bg-transparent' : ''}`}>
          
          {/* Actions Toolbar - Hidden in Focus Mode */}
          {!isFocusMode && (
            <div className="absolute top-4 right-4 flex flex-wrap items-center justify-end gap-3 no-print z-10 pl-4">
              
              {/* History Navigation */}
              {onNavigateHistory && (
                <div className="flex items-center bg-stone-950/80 rounded-md backdrop-blur-sm border border-stone-800 shadow-sm mr-1">
                  <button 
                    onClick={() => onNavigateHistory('prev')}
                    disabled={!hasPrevious}
                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-l transition-colors"
                    title="Capítulo Anterior (Mais recente)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div className="w-px h-4 bg-stone-800"></div>
                  <button 
                    onClick={() => onNavigateHistory('next')}
                    disabled={!hasNext}
                    className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-r transition-colors"
                    title="Próximo Capítulo (Mais antigo)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </div>
              )}

              {/* Font Size & Family Controls */}
              {renderFontControls("mr-1")}

              <div className="h-6 w-px bg-stone-800 mx-1"></div>

              {/* Focus Mode Toggle */}
              <button 
                onClick={() => onToggleFocusMode(true)}
                className="text-stone-400 hover:text-amber-500 transition-all duration-300 flex items-center gap-2 text-sm bg-stone-950/80 p-2 rounded-md backdrop-blur-sm border border-stone-800 hover:border-stone-700 hover:scale-105 hover:shadow-lg hover:shadow-black/50 active:scale-95"
                title="Modo Leitura (Foco)"
              >
                <span>👁️</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative" ref={exportMenuRef}>
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="text-stone-400 hover:text-amber-500 transition-all duration-300 flex items-center gap-2 text-sm bg-stone-950/80 p-2 rounded-md backdrop-blur-sm border border-stone-800 hover:border-stone-700 hover:scale-105 hover:shadow-lg hover:shadow-black/50 active:scale-95"
                >
                  <span>📥</span> Exportar
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-stone-900 rounded-md shadow-2xl border border-stone-700 overflow-hidden py-1 text-sm z-20 animate-fade-in-up">
                    <button 
                      onClick={() => handleExportClick('docx')} 
                      className="w-full text-left px-4 py-2 hover:bg-stone-800 text-stone-200 hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <span className="text-blue-400">📝</span> Word (.docx)
                    </button>
                    <button 
                      onClick={() => handleExportClick('pdf')} 
                      className="w-full text-left px-4 py-2 hover:bg-stone-800 text-stone-200 hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <span>📄</span> PDF (Imprimir)
                    </button>
                    <button 
                      onClick={() => handleExportClick('md')} 
                      className="w-full text-left px-4 py-2 hover:bg-stone-800 text-stone-200 hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <span>📝</span> Markdown (.md)
                    </button>
                    <button 
                      onClick={() => handleExportClick('txt')} 
                      className="w-full text-left px-4 py-2 hover:bg-stone-800 text-stone-200 hover:text-amber-500 flex items-center gap-2 transition-colors"
                    >
                      <span>📃</span> Texto Puro (.txt)
                    </button>
                  </div>
                )}
              </div>

              {/* Copy Button */}
              <button 
                onClick={onCopyText}
                className="text-stone-400 hover:text-amber-500 transition-all duration-300 flex items-center gap-2 text-sm bg-stone-950/80 p-2 rounded-md backdrop-blur-sm border border-stone-800 hover:border-stone-700 hover:scale-105 hover:shadow-lg hover:shadow-black/50 active:scale-95"
                title="Copiar texto"
              >
                {copyTextSuccess ? (
                  <>
                    <span className="text-green-500">✓</span> Copiado
                  </>
                ) : (
                  <>
                    <span>📋</span> Copiar
                  </>
                )}
              </button>
            </div>
          )}

          {/* 
            Typography Config:
            - Controls size via inline style `fontSize` which persists in Focus Mode.
            - Controls family via inline style `fontFamily`.
            - 'prose' (base) is kept for general spacing logic, but specialized fonts override defaults.
          */}
          <div 
            className={`prose prose-invert prose-strong:text-amber-500 prose-p:text-justify print:prose-black print:text-black transition-all duration-500 ${isFocusMode ? 'leading-loose mx-auto max-w-3xl' : 'max-w-none'}`}
            style={{ 
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily
            }}
          >
             {/* Editable Title */}
             <div className="mb-2 text-center">
               {onTitleChange ? (
                 <input 
                   type="text" 
                   value={result.textData.title}
                   onChange={(e) => onTitleChange(e.target.value)}
                   className="w-full bg-transparent text-center font-bold text-stone-100 print:text-black outline-none border-b-2 border-transparent focus:border-amber-500 transition-colors"
                   style={{ fontSize: '2em', lineHeight: '1.2' }}
                 />
               ) : (
                 <h1 className="text-center text-stone-100 print:text-black" style={{ fontSize: '2em', lineHeight: '1.2' }}>{result.textData.title}</h1>
               )}
             </div>
             
             <div className="flex items-center justify-center gap-3 mb-8 text-stone-500 italic font-serif print:text-gray-600" style={{ fontSize: '0.85em' }}>
               <span>{wordCount} palavras</span>
               <span className="text-stone-700">•</span>
               <span>~{readingTime} min de leitura</span>
             </div>

             <div className="chapter-content">
               <MarkdownRenderer content={result.textData.content} />
             </div>
          </div>
          
          <div className="my-12 flex items-center justify-center no-print">
              <span className="text-stone-600 text-2xl">❧</span>
          </div>
        </div>

      </div>

      {/* 2. METADATA SECTION (Hidden on Print & Focus Mode) */}
      {!isFocusMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
          {/* Editor Analysis */}
          <div className="bg-stone-800/50 p-6 rounded-lg border border-stone-700/50 flex flex-col">
            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
              <span>📝</span> Análise do Editor
            </h3>
            <p className="text-stone-300 text-sm leading-relaxed italic flex-grow">
              "{result.textData.editorAnalysis}"
            </p>
          </div>

          {/* Image Prompt */}
          <div className="bg-stone-900 p-6 rounded-lg border border-amber-900/30 shadow-lg relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-600/50"></div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                <span>🎨</span> Prompt Visual (IA)
              </h3>
              <button 
                onClick={onCopyPrompt}
                className="text-xs bg-stone-800 hover:bg-amber-900 text-stone-300 hover:text-white px-3 py-1.5 rounded transition-colors border border-stone-700 flex items-center gap-2"
              >
                 {copyPromptSuccess ? (
                    <>
                      <span className="text-green-500">✓</span> Copiado
                    </>
                  ) : (
                    <>
                      <span>📋</span> Copiar Prompt
                    </>
                  )}
              </button>
            </div>
            
            <div className="bg-black/40 p-4 rounded border border-stone-800 font-mono text-sm text-stone-300 leading-relaxed break-words select-all flex-grow custom-scrollbar overflow-y-auto max-h-48 lg:max-h-full">
              {result.textData.imagePrompt}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
