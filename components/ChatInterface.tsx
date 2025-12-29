import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Button } from './Button';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, image?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedImage) && !isLoading) {
      onSendMessage(input || (selectedImage ? "Replique esta interface visualmente." : ""), selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  // Icons SVG
  const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
  );

  const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436h.684c1.242 0 2.25 1.008 2.25 2.25V19.5a2.25 2.25 0 0 1-2.25 2.25h-9A2.25 2.25 0 0 1 5.25 19.5v-2.514c0-1.242 1.008-2.25 2.25-2.25h.684c-2.88-3.701-7.38-6.084-12.436-6.084a.75.75 0 0 1-.75-.75c0-5.056 2.383-9.555 6.084-12.436H.357a2.25 2.25 0 0 1 2.25-2.25H9.75a2.25 2.25 0 0 1 2.25 2.25v2.514c0 1.242-1.008 2.25-2.25 2.25H9.065Z" clipRule="evenodd" />
    </svg>
  );

  const ClipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
    </svg>
  );

  const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 relative">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="text-indigo-500"><BotIcon /></span>
          Chat Designer
        </h2>
        <p className="text-xs text-gray-400">Peça sua LP ou envie uma imagem para clonar.</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Image Attachment in History */}
              {msg.attachment && (
                <div className="mb-2 p-1 bg-gray-800 rounded-lg border border-gray-700 inline-block">
                  <img src={msg.attachment} alt="Attachment" className="max-w-[200px] max-h-[150px] rounded-md object-cover" />
                </div>
              )}

              <div 
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}
              >
                 <p className="whitespace-pre-wrap">{msg.content}</p>
                 {msg.hasCode && (
                   <div className="mt-2 text-xs text-green-400 font-mono flex items-center gap-1">
                     <span>✓</span> Código gerado e atualizado no preview.
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="relative">
          
          {/* Image Preview Overlay */}
          {selectedImage && (
             <div className="absolute bottom-full left-0 mb-2 ml-4 p-2 bg-gray-800 rounded-lg border border-gray-700 shadow-xl flex items-start gap-2 animate-in slide-in-from-bottom-2 fade-in">
                <img src={selectedImage} alt="Upload preview" className="w-16 h-16 object-cover rounded-md bg-black/50" />
                <button 
                  type="button"
                  onClick={removeImage}
                  className="bg-gray-700 hover:bg-gray-600 rounded-full p-1 text-gray-300 transition-colors"
                >
                  <XMarkIcon />
                </button>
             </div>
          )}

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Descreva a LP ou anexe uma imagem..."
              className="w-full bg-gray-950 text-white placeholder-gray-500 border border-gray-700 rounded-xl pl-12 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none h-[60px] scrollbar-hide text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            {/* Attachment Button */}
            <div className="absolute left-2 bottom-2.5">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden" 
              />
              <Button 
                type="button" 
                variant="ghost"
                className="!p-2 !rounded-lg text-gray-400 hover:text-indigo-400"
                onClick={() => fileInputRef.current?.click()}
                title="Anexar Imagem para Clonar"
              >
                <ClipIcon />
              </Button>
            </div>

            {/* Submit Button */}
            <div className="absolute right-2 bottom-2.5">
              <Button 
                type="submit" 
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="!p-2 !rounded-lg"
              >
                <SendIcon />
              </Button>
            </div>
          </div>
        </form>
        <div className="text-center mt-2 flex justify-center gap-4">
            <span className="text-[10px] text-gray-500">Gemini 3 Flash</span>
            <span className="text-[10px] text-gray-500">• Suporte a Visão</span>
        </div>
      </div>
    </div>
  );
};
