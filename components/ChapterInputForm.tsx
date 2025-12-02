
import React, { useState } from 'react';
import { AppStatus, ChapterRequest } from '../types';

interface ChapterInputFormProps {
  formData: ChapterRequest;
  status: AppStatus;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDefaults?: () => void;
}

export const ChapterInputForm: React.FC<ChapterInputFormProps> = ({
  formData,
  status,
  onChange,
  onSubmit,
  onSaveDefaults
}) => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Helper to handle custom button clicks as standard input events
  const handleRatioChange = (value: string) => {
    const event = {
      target: {
        name: 'imageAspectRatio',
        value: value
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  const handleSaveDefaultsClick = () => {
    if (onSaveDefaults) {
      onSaveDefaults();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-stone-900 p-6 rounded-lg border border-stone-800 shadow-xl">
      <h2 className="text-lg font-semibold text-stone-100 mb-4 flex items-center gap-2">
        <span>⚙️</span> Configuração do Capítulo
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Título do Livro</label>
          <input
            type="text"
            name="bookTitle"
            value={formData.bookTitle}
            onChange={onChange}
            placeholder="Ex: A Crônica da Cidade Submersa"
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all placeholder-stone-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Gênero Literário</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={onChange}
            placeholder="Ex: Fantasia Urbana / Cyberpunk"
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all placeholder-stone-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Nome do Capítulo</label>
          <input
            type="text"
            name="chapterName"
            value={formData.chapterName}
            onChange={onChange}
            placeholder="Ex: O Despertar da Sentinela"
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all placeholder-stone-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Resumo da Trama / Ponto Chave</label>
          <textarea
            name="plotSummary"
            value={formData.plotSummary}
            onChange={onChange}
            placeholder="O que acontece neste capítulo? Descreva o conflito principal, a ação e o desfecho desejado..."
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 h-28 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all resize-none placeholder-stone-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Personagens Principais (Opcional)</label>
          <textarea
            name="mainCharacters"
            value={formData.mainCharacters || ''}
            onChange={onChange}
            placeholder="Ex: Elara (Maga rebelde, 25 anos), Kael (Guerreiro estoico, 30 anos)... Liste nomes e breves descrições."
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 h-20 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all resize-none placeholder-stone-700"
          />
          <p className="text-xs text-stone-600 mt-1">
            Ajuda a IA a manter a consistência dos personagens na narrativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Estilo de Escrita</label>
            <select
              name="writingStyle"
              value={formData.writingStyle || 'Padrão (Equilibrado)'}
              onChange={onChange}
              className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all"
            >
              <option value="Padrão (Equilibrado)">Padrão (Equilibrado)</option>
              <option value="Poético e Lírico">Poético e Lírico</option>
              <option value="Direto e 'Hardboiled' (Noir)">Direto e "Hardboiled" (Noir)</option>
              <option value="Sombrio e Melancólico">Sombrio e Melancólico</option>
              <option value="Técnico e Detalhado (Hard Sci-Fi)">Técnico e Detalhado</option>
              <option value="Humorístico e Satírico">Humorístico e Satírico</option>
              <option value="Gótico e Atmosférico">Gótico e Atmosférico</option>
              <option value="Introspectivo e Psicológico">Introspectivo e Psicológico</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-400 mb-1">Extensão</label>
            <select
              name="lengthConstraint"
              value={formData.lengthConstraint}
              onChange={onChange}
              className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all"
            >
              <option value="Curto e Impactante (800 palavras)">Curto (~800)</option>
              <option value="Padrão (1500 palavras)">Padrão (~1500)</option>
              <option value="Épico e Denso (2500+ palavras)">Épico (2500+)</option>
              <option value="Magnum Opus (+4000 palavras)">Magnum Opus (+4000)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-400 mb-1">Otimização de Diálogos (Opcional)</label>
          <textarea
            name="dialogueEnhancement"
            value={formData.dialogueEnhancement || ''}
            onChange={onChange}
            rows={2}
            placeholder="Ex: 'Use gírias de marinheiro', 'Estilo Tarantino', ou cole um exemplo de diálogo que você gosta."
            className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all resize-none placeholder-stone-700"
          />
          <p className="text-xs text-stone-600 mt-1">
            Instruções de tom e estilo para tornar as falas dos personagens mais naturais.
          </p>
        </div>

        <div className="pt-2 border-t border-stone-800">
          <label className="block text-xs font-bold text-amber-500 mb-3 uppercase tracking-wider">
            🎨 Configuração da Ilustração
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-400 mb-1">Tópico Visual / Descrição da Cena</label>
              <textarea
                name="imageCustomTopic"
                value={formData.imageCustomTopic || ''}
                onChange={onChange}
                rows={2}
                placeholder="Opcional: Descreva uma cena específica. Se vazio, o modelo usará o Nome do Capítulo."
                className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all resize-none placeholder-stone-700"
              />
              <p className="text-xs text-stone-600 mt-1">
                Substitui o Nome do Capítulo como o tema central da ilustração.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Estilo Visual</label>
              <select
                name="imageArtStyle"
                value={formData.imageArtStyle || 'Cinematográfico (Padrão)'}
                onChange={onChange}
                className="w-full bg-stone-950 border border-stone-800 rounded p-2.5 text-stone-100 focus:ring-2 focus:ring-amber-700 focus:border-transparent outline-none transition-all"
              >
                <option value="Cinematográfico (Padrão)">Cinematográfico (Padrão)</option>
                <option value="Pintura a Óleo Digital">Pintura a Óleo Digital</option>
                <option value="Aquarela e Nanquim">Aquarela e Nanquim</option>
                <option value="Ilustração Fantasy Art">Ilustração Fantasy Art</option>
                <option value="Cyberpunk / Neon">Cyberpunk / Neon</option>
                <option value="Noir / Preto e Branco">Noir / Preto e Branco</option>
                <option value="Surrealista">Surrealista</option>
                <option value="Sketch / Rascunho">Sketch / Rascunho</option>
                <option value="Fotorealista">Fotorealista</option>
                <option value="Pixel Art">Pixel Art</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-400 mb-1">Proporção (Aspect Ratio)</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '16:9', label: '16:9', title: 'Paisagem / Cinema', iconClass: 'w-7 h-4' },
                  { value: '3:4', label: '3:4', title: 'Retrato / Capa', iconClass: 'w-4 h-6' },
                  { value: '1:1', label: '1:1', title: 'Quadrado', iconClass: 'w-5 h-5' },
                  { value: '9:16', label: '9:16', title: 'Story / Mobile', iconClass: 'w-3.5 h-6' },
                ].map((ratio) => {
                  const isActive = (formData.imageAspectRatio || '16:9') === ratio.value;
                  return (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => handleRatioChange(ratio.value)}
                      title={ratio.title}
                      className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                        isActive
                          ? 'bg-amber-900/30 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'
                      }`}
                    >
                      <div className={`border-2 border-current rounded-[1px] mb-1.5 ${ratio.iconClass}`}></div>
                      <span className="text-[10px] font-medium">{ratio.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={status === AppStatus.WRITING || status === AppStatus.GENERATING_IMAGE}
          className="w-full bg-amber-700 hover:bg-amber-600 text-white font-medium py-3 rounded shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
        >
          {status === AppStatus.WRITING || status === AppStatus.GENERATING_IMAGE ? (
            <span>Processando...</span>
          ) : (
            <>
              <span>✨</span> Escrever Capítulo
            </>
          )}
        </button>

        {onSaveDefaults && (
          <div className="flex justify-center mt-2">
            <button
              type="button"
              onClick={handleSaveDefaultsClick}
              className={`text-xs transition-colors flex items-center gap-1 ${saveSuccess ? 'text-green-500' : 'text-stone-500 hover:text-amber-500'}`}
            >
              {saveSuccess ? (
                <><span>✓</span> Configurações salvas como padrão</>
              ) : (
                <><span>💾</span> Salvar configurações atuais como padrão</>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};