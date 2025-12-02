import React from 'react';
import { AppStatus } from '../types';

interface LoadingIndicatorProps {
  status: AppStatus;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ status }) => {
  if (status !== AppStatus.WRITING && status !== AppStatus.GENERATING_IMAGE) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-pulse">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-600/30 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-amber-500 font-medium text-lg font-serif">
        {status === AppStatus.WRITING ? "O Editor Master está escrevendo..." : "O Ilustrador IA está pintando a cena..."}
      </p>
      {status === AppStatus.WRITING && (
        <p className="text-stone-400 text-sm max-w-md text-center">
          Criando arcos narrativos, desenvolvendo personagens e garantindo a profundidade temática...
        </p>
      )}
    </div>
  );
};
