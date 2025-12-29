import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { PreviewPane } from './components/PreviewPane';
import { Message, GeneratedCode } from './types';
import { INITIAL_GREETING } from './constants';
import { generateLandingPage } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for multiple LPs
  const [generatedLPs, setGeneratedLPs] = useState<GeneratedCode[]>([]);
  const [activeLPId, setActiveLPId] = useState<string | null>(null);

  const handleSendMessage = async (text: string, image?: string) => {
    // 1. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachment: image
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 2. Call AI Service (Pass image if available)
      const htmlCode = await generateLandingPage(text, image);

      // 3. Create New LP Object
      const newLP: GeneratedCode = {
        id: Date.now().toString(),
        // Generate a simple title
        title: image ? 'LP Clonada (Imagem)' : (text.split(' ').slice(0, 3).join(' ') || `LP #${generatedLPs.length + 1}`),
        html: htmlCode,
        timestamp: Date.now()
      };
      
      // Update state: add to list and make active
      setGeneratedLPs((prev) => [...prev, newLP]);
      setActiveLPId(newLP.id);

      // 4. Add Assistant Message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: image 
            ? "Analisei sua imagem e recriei a estrutura em HTML/CSS. Confira o resultado no preview."
            : "LP Gerada com sucesso! Verifique o preview ao lado.",
          timestamp: Date.now(),
          hasCode: true
        }
      ]);

    } catch (error) {
      // Error handling
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "Ocorreu um erro ao gerar sua Landing Page. Por favor, tente novamente.",
          timestamp: Date.now(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeLP = generatedLPs.find(lp => lp.id === activeLPId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Left Panel: Chat (35% width on desktop) */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 h-full">
        <ChatInterface 
          messages={messages} 
          isLoading={isLoading} 
          onSendMessage={handleSendMessage} 
        />
      </div>

      {/* Right Panel: Preview (Remaining width) */}
      <div className="flex-1 h-full min-w-0">
        <PreviewPane 
          lps={generatedLPs}
          activeId={activeLPId}
          onTabChange={setActiveLPId}
        />
      </div>
    </div>
  );
};

export default App;
