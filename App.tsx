
import React, { useState, useEffect } from 'react';
import { generateChapterText, generateChapterImage } from './services/gemini';
import { AppStatus, ChapterRequest, HistoryItem, GenerationResult } from './types';
import { LoadingIndicator } from './components/LoadingIndicator';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { stripMarkdown } from './utils/textUtils';
import { ChapterInputForm } from './components/ChapterInputForm';
import { ChapterHistoryList } from './components/ChapterHistoryList';
import { ChapterResultDisplay } from './components/ChapterResultDisplay';

const DEFAULT_FORM_DATA: ChapterRequest = {
  bookTitle: '',
  genre: '',
  chapterName: '',
  plotSummary: '',
  mainCharacters: '',
  lengthConstraint: 'Cerca de 1500 palavras, denso e detalhado.',
  writingStyle: 'Padrão (Equilibrado)',
  dialogueEnhancement: '',
  imageAspectRatio: '16:9',
  imageArtStyle: 'Cinematográfico (Padrão)',
  imageCustomTopic: '',
};

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<GenerationResult>({ textData: null, imageUrl: null });
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyPromptSuccess, setCopyPromptSuccess] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  
  // Initialize formData from localStorage if available, otherwise use defaults
  const [formData, setFormData] = useState<ChapterRequest>(() => {
    const savedDefaults = localStorage.getItem('master_editor_defaults');
    if (savedDefaults) {
      try {
        // Merge saved defaults with DEFAULT_FORM_DATA to ensure new fields are present
        return { ...DEFAULT_FORM_DATA, ...JSON.parse(savedDefaults) };
      } catch (e) {
        console.error("Failed to parse saved defaults", e);
      }
    }
    return DEFAULT_FORM_DATA;
  });

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('master_editor_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('master_editor_history', JSON.stringify(history));
  }, [history]);

  // Handle Fullscreen API & Sync State
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If the browser exits fullscreen (e.g. user pressed Esc), we must sync our state
      if (!document.fullscreenElement && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFocusMode]);

  // Trigger Fullscreen / Scroll on Mode Change
  useEffect(() => {
    const manageFocusMode = async () => {
      try {
        if (isFocusMode) {
          // Enter Fullscreen if not already
          if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Exit Fullscreen if active
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          }
        }
      } catch (err) {
        console.warn("Fullscreen request failed or denied:", err);
      }
    };
    manageFocusMode();
  }, [isFocusMode]);

  // Fallback Escape key listener (in case Fullscreen is denied or not supported)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        // Only trigger if we aren't waiting for the fullscreenchange event
        if (!document.fullscreenElement) {
          setIsFocusMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFocusMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveDefaults = () => {
    localStorage.setItem('master_editor_defaults', JSON.stringify(formData));
  };

  const addToHistory = (req: ChapterRequest, res: GenerationResult) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      request: { ...req },
      result: { ...res }
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(AppStatus.WRITING);
    setError(null);
    setResult({ textData: null, imageUrl: null });

    try {
      // 1. Generate Text
      const textResponse = await generateChapterText(formData);
      // Intermediate state update
      setResult(prev => ({ ...prev, textData: textResponse }));
      
      // 2. Generate Image
      setStatus(AppStatus.GENERATING_IMAGE);
      // Pass the selected Aspect Ratio here
      const imageUrl = await generateChapterImage(textResponse.imagePrompt, formData.imageAspectRatio);
      
      const finalResult = { textData: textResponse, imageUrl };
      setResult(finalResult);
      setStatus(AppStatus.COMPLETED);
      
      // Add to history
      addToHistory(formData, finalResult);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro desconhecido durante a geração.");
      setStatus(AppStatus.ERROR);
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setFormData(item.request);
    setResult(item.result);
    setStatus(AppStatus.COMPLETED);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja remover este capítulo do histórico?")) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCopy = () => {
    if (result.textData?.content) {
      navigator.clipboard.writeText(result.textData.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCopyPrompt = () => {
    if (result.textData?.imagePrompt) {
      navigator.clipboard.writeText(result.textData.imagePrompt);
      setCopyPromptSuccess(true);
      setTimeout(() => setCopyPromptSuccess(false), 2000);
    }
  };

  // --- Export Functionality ---

  const downloadFile = (filename: string, content: string | Blob, mimeType: string) => {
    const element = document.createElement("a");
    const file = content instanceof Blob ? content : new Blob([content], {type: mimeType});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadImage = () => {
    if (!result.imageUrl || !result.textData) return;
    
    const safeTitle = result.textData.title.replace(/[^a-z0-9áàâãéèêíïóôõöúçñ ]/gi, '_').trim();
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `${safeTitle}_Arte.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateDocx = async (title: string, content: string): Promise<Blob> => {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "Normal",
            name: "Normal",
            run: {
              font: "Merriweather",
              size: 24, // 12pt
            },
            paragraph: {
              spacing: { line: 360 }, // 1.5 line spacing
            },
          },
        ],
      },
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...paragraphs.map(paraText => {
            // Simple markdown parser for Bold (**) and Italic (*)
            const children: TextRun[] = [];
            const parts = paraText.split(/(\*\*.*?\*\*|\*.*?\*)/g);
            
            parts.forEach(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                children.push(new TextRun({ 
                  text: part.slice(2, -2), 
                  bold: true 
                }));
              } else if (part.startsWith('*') && part.endsWith('*')) {
                children.push(new TextRun({ 
                  text: part.slice(1, -1), 
                  italics: true 
                }));
              } else if (part.length > 0) {
                children.push(new TextRun({ 
                  text: part 
                }));
              }
            });

            return new Paragraph({
              children: children,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 240 } // Space after paragraph
            });
          })
        ]
      }]
    });

    return await Packer.toBlob(doc);
  };

  const handleExport = async (format: 'txt' | 'md' | 'pdf' | 'docx', item?: HistoryItem) => {
    // Use provided item or current result
    const targetResult = item ? item.result : result;
    if (!targetResult.textData) return;

    const { title, content } = targetResult.textData;
    const safeTitle = title.replace(/[^a-z0-9áàâãéèêíïóôõöúçñ ]/gi, '_').trim();

    if (format === 'pdf') {
      if (item) {
        // If clicking from sidebar, load it first to ensure it is in the DOM for printing
        loadHistoryItem(item);
        // Small delay to allow React to render the new content before opening print dialog
        setTimeout(() => window.print(), 100);
      } else {
        // If already viewing the chapter, just print
        window.print();
      }
    } else if (format === 'md') {
      const mdContent = `# ${title}\n\n${content}`;
      downloadFile(`${safeTitle}.md`, mdContent, 'text/markdown');
    } else if (format === 'txt') {
      const txtContent = `${title.toUpperCase()}\n\n${stripMarkdown(content)}`;
      downloadFile(`${safeTitle}.txt`, txtContent, 'text/plain');
    } else if (format === 'docx') {
      try {
        const blob = await generateDocx(title, content);
        downloadFile(`${safeTitle}.docx`, blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      } catch (err) {
        console.error("Error generating DOCX:", err);
        alert("Ocorreu um erro ao gerar o arquivo DOCX.");
      }
    }
  };

  const handleQuickExport = (e: React.MouseEvent, item: HistoryItem, format: 'txt' | 'md' | 'pdf' | 'docx') => {
    e.stopPropagation();
    handleExport(format, item);
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-amber-900 selection:text-white pb-20">
      
      {/* Floating Exit Focus Mode Button - Distraction Free with Slide-out Label */}
      {isFocusMode && (
        <button
          onClick={() => setIsFocusMode(false)}
          className="group fixed top-6 right-6 z-[60] flex items-center gap-2 bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-white p-3 rounded-full backdrop-blur-md border border-stone-700 shadow-2xl transition-all opacity-30 hover:opacity-100 hover:pr-5"
          title="Sair do Modo Leitura (Esc)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-sm font-medium whitespace-nowrap">Sair do Modo Foco</span>
        </button>
      )}

      {/* Header - Hidden in Focus Mode */}
      {!isFocusMode && (
        <header className="border-b border-stone-800 bg-stone-900 sticky top-0 z-50 no-print">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🖋️</span>
              <div>
                <h1 className="font-serif text-xl font-bold text-stone-100 tracking-tight">Master Editor AI</h1>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Creative Writing Assistant</p>
              </div>
            </div>
            <div className="text-xs text-stone-500 hidden md:block">
              Powered by Gemini 2.5 & Imagen
            </div>
          </div>
        </header>
      )}

      <main className={
        isFocusMode 
          ? "max-w-4xl mx-auto px-4 py-12 transition-all duration-500 ease-in-out" 
          : "max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-500 ease-in-out"
      }>
        
        {/* Left Column: Inputs & History (Hidden on Print & Focus Mode) */}
        {!isFocusMode && (
          <div className="lg:col-span-4 space-y-6 no-print">
            <ChapterInputForm 
              formData={formData} 
              status={status} 
              onChange={handleInputChange} 
              onSubmit={handleSubmit}
              onSaveDefaults={handleSaveDefaults}
            />
            
            <ChapterHistoryList 
              history={history}
              onLoad={loadHistoryItem}
              onDelete={deleteHistoryItem}
              onExport={handleQuickExport}
            />
          </div>
        )}

        {/* Right Column: Output */}
        <div className={isFocusMode ? "w-full" : "lg:col-span-8"}>
          
          {status === AppStatus.IDLE && !result.textData && (
            <div className="h-full flex flex-col items-center justify-center text-stone-600 p-12 border-2 border-dashed border-stone-800 rounded-lg no-print">
              <span className="text-6xl mb-4 opacity-20">📖</span>
              <p className="text-lg">Preencha os dados ao lado para começar a escrever sua obra-prima.</p>
              {history.length > 0 && <p className="text-sm mt-2 text-stone-500">Ou selecione um capítulo da sua biblioteca.</p>}
            </div>
          )}

          {status === AppStatus.ERROR && (
             <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6 no-print">
               <strong>Erro:</strong> {error}
             </div>
          )}

          <LoadingIndicator status={status} />

          {result.textData && (
            <ChapterResultDisplay 
              result={result}
              status={status}
              isFocusMode={isFocusMode}
              onToggleFocusMode={setIsFocusMode}
              onExport={(format) => handleExport(format)}
              onDownloadImage={handleDownloadImage}
              onCopyText={handleCopy}
              copyTextSuccess={copySuccess}
              onCopyPrompt={handleCopyPrompt}
              copyPromptSuccess={copyPromptSuccess}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
