
import { GoogleGenAI, Type } from "@google/genai";
import { ChapterRequest, ChapterResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
Você é o "Editor-Chefe e Escritor Master". Sua função é escrever capítulos de livros de altíssima qualidade literária.

1.  **Papel e Persona**:
    *   **Editor-Chefe**: Rigoroso com estrutura, ritmo e coerência.
    *   **Escritor Master**: Profundo, eloquente, usa "Show, Don't Tell", diálogos autênticos e subtexto rico.

2.  **Diretrizes de Escrita**:
    *   **Abertura**: Comece *in media res* ou com um gancho forte.
    *   **Arco**: Início (conflito), Meio (escalada), Fim (cliffhanger/resolução parcial).
    *   **Técnica**: Priorize descrição sensorial. Evite advérbios preguiçosos.
    *   **POV**: Mantenha o ponto de vista consistente.
    *   **Profundidade**: Explore conflitos internos e externos simultaneamente.

3.  **Diretrizes de Imagem (Tópico Visual)**:
    *   Ao criar o prompt de imagem, o **Tópico Central** deve ser a representação visual do **Nome do Capítulo**.
    *   Estrutura do Prompt: [Estilo Visual Selecionado], [Representação Visual do Nome do Capítulo], [Detalhes da Cena/Ambiente], [Iluminação/Técnica].
    *   **CRÍTICO - PROIBIDO TEXTO**: O prompt DEVE garantir que a imagem seja livre de qualquer texto.
    *   **Evite**: Termos como "book cover", "poster", "title card" que induzem a IA a gerar texto. Use "cinematic shot", "concept art", "illustration".
    *   **Adicione**: Tags negativas explícitas como "NO TEXT", "NO TYPOGRAPHY".

4.  **Output**:
    *   Você deve retornar APENAS um objeto JSON válido.
    *   O conteúdo do capítulo deve ser formatado em Markdown (use negrito, itálico, quebras de linha).
`;

export const generateChapterText = async (request: ChapterRequest): Promise<ChapterResponse> => {
  // Determine which visual topic to use: specific user custom topic or fallback to chapter name
  const visualSubject = request.imageCustomTopic?.trim() 
    ? request.imageCustomTopic 
    : request.chapterName;

  const prompt = `
    Escreva um capítulo com os seguintes parâmetros:
    - Título do Livro: ${request.bookTitle}
    - Gênero: ${request.genre}
    - Nome do Capítulo: ${request.chapterName}
    - Estilo de Escrita (Tom): ${request.writingStyle}
    - Resumo da Trama/Ponto Chave: ${request.plotSummary}
    - Extensão/Tamanho: ${request.lengthConstraint}

    Siga estritamente as diretrizes do Editor-Chefe. Adapte o tom da narrativa para corresponder ao "Estilo de Escrita" solicitado.
    
    ${request.mainCharacters ? `
    PERSONAGENS DO CAPÍTULO:
    "${request.mainCharacters}"
    INSTRUÇÃO: Mantenha a consistência das características físicas, personalidades e vozes destes personagens conforme a descrição fornecida.
    ` : ''}

    ${request.dialogueEnhancement ? `
    DIRETRIZ DE DIÁLOGO: O usuário solicitou um estilo específico ou referência para as falas:
    "${request.dialogueEnhancement}"
    
    INSTRUÇÃO: Certifique-se de que os diálogos soem naturais, expressivos e sigam fielmente esta referência de estilo ou exemplo fornecido. Evite falas robóticas ou expositivas demais. Use subtexto.
    ` : ''}

    Ao finalizar, gere um JSON contendo:
    1. O texto do capítulo (Markdown).
    2. Análise do editor.
    3. Um Prompt de Imagem.
    
    IMPORTANTE PARA IMAGEM: 
    - O "tópico" de geração da imagem deve ser baseado estritamente em: '${visualSubject}'.
    - Se o usuário forneceu uma descrição específica acima, siga-a fielmente. Caso contrário, imagine a melhor cena para o título.
    - O Estilo Visual deve ser: '${request.imageArtStyle}'. Garanta que o prompt descreva esse estilo específico.
    - Crie uma cena que traduza visualmente o significado deste tópico no contexto da história.
    - NÃO peça uma capa de livro. Peça uma cena viva.
    - ADICIONE AO FINAL DO PROMPT: "Masterpiece, text-free, no text, no words, no letters, no typography, no watermark, clean illustration, cinematic lighting, style: ${request.imageArtStyle}".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Best for creative writing and reasoning
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "O título final do capítulo" },
            content: { type: Type.STRING, description: "O texto completo do capítulo em Markdown" },
            editorAnalysis: { type: Type.STRING, description: "Análise crítica do editor sobre o capítulo escrito" },
            imagePrompt: { type: Type.STRING, description: "Prompt de imagem estruturado. Deve conter instruções claras para NÃO gerar texto e seguir o estilo visual solicitado." },
          },
          required: ["title", "content", "editorAnalysis", "imagePrompt"],
        },
        // Enable thinking to allow the model to plan the narrative arc properly
        thinkingConfig: { thinkingBudget: 4096 }, 
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(response.text) as ChapterResponse;

  } catch (error) {
    console.error("Error generating chapter text:", error);
    throw error;
  }
};

export const generateChapterImage = async (imagePrompt: string, aspectRatio: string = "16:9"): Promise<string> => {
  try {
    // Using Imagen 4 for high quality illustration
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        // Type assertion needed as string comes from UI but API expects specific enum-like strings
        aspectRatio: aspectRatio as any, 
      },
    });

    const generatedImage = response.generatedImages?.[0]?.image;
    
    if (!generatedImage?.imageBytes) {
       throw new Error("No image generated.");
    }

    return `data:image/jpeg;base64,${generatedImage.imageBytes}`;

  } catch (error) {
    console.error("Error generating image:", error);
    // Fallback or re-throw. We re-throw to handle in UI.
    throw error;
  }
};