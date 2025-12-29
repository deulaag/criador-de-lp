import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedCode, ViewMode } from '../types';
import { Button } from './Button';

interface PreviewPaneProps {
  lps: GeneratedCode[];
  activeId: string | null;
  onTabChange: (id: string) => void;
}

interface ParsedSection {
  id: string;
  name: string;
  fullHtml: string; // CSS + HTML for this section
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ lps, activeId, onTabChange }) => {
  const [mode, setMode] = useState<ViewMode>('preview');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const activeLP = lps.find(lp => lp.id === activeId) || null;

  // Icons
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  );

  const ElementorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-green-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );

  const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );

  // Logic to parse HTML and split into sections for Elementor
  const sections: ParsedSection[] = useMemo(() => {
    if (!activeLP?.html) return [];

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(activeLP.html, 'text/html');
      
      // Extract all styles to include in every section chunk
      // This ensures styles are present when pasted into Elementor HTML widget
      const styles = Array.from(doc.querySelectorAll('style'))
        .map(s => s.outerHTML)
        .join('\n');

      // Get direct children of body (excluding scripts and styles that might be in body)
      const children = Array.from(doc.body.children).filter(el => {
        const tag = el.tagName.toLowerCase();
        return tag !== 'script' && tag !== 'noscript' && tag !== 'style';
      });

      return children.map((el, index) => {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        
        // Enhance naming for better UX
        let prettyName = `Seção ${index + 1}`;
        if (tag === 'header') prettyName = 'Cabeçalho (Header)';
        else if (tag === 'footer') prettyName = 'Rodapé (Footer)';
        else if (tag === 'nav') prettyName = 'Navegação';
        else if (tag === 'main') prettyName = 'Conteúdo Principal';
        else if (id.includes('hero')) prettyName = 'Hero Section';
        else if (id.includes('feature')) prettyName = 'Seção de Features';
        else if (id.includes('contact')) prettyName = 'Seção de Contato';
        else prettyName = `${prettyName} (${tag}${id})`;
        
        // Combine styles with this specific element
        // Using a wrapper comment for clarity is optional but helps user verify
        const fullHtml = `<!-- NexusBuilder Section: ${prettyName} -->\n${styles}\n${el.outerHTML}`;
        
        return {
          id: `section-${index}`,
          name: prettyName,
          fullHtml
        };
      });
    } catch (e) {
      console.error("Failed to parse sections", e);
      return [];
    }
  }, [activeLP]);


  const handleCopy = async (text: string, id: string = 'global') => {
    await navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 1000); // 1 second feedback
  };

  const handleDownload = () => {
    if (activeLP?.html) {
      const blob = new Blob([activeLP.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `landing-page-${activeLP.id}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (lps.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-950 text-gray-500 border-l border-gray-800 p-8 text-center">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 ring-1 ring-gray-800">
           <CodeIcon />
        </div>
        <h3 className="text-xl font-medium text-gray-300 mb-2">NexusBuilder AI</h3>
        <p className="max-w-md text-sm">Use o chat à esquerda para criar sua primeira Landing Page.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-950 border-l border-gray-800">
      {/* Top Tab Bar for LPs */}
      <div className="h-10 bg-gray-950 border-b border-gray-800 flex items-center overflow-x-auto scrollbar-hide">
        {lps.map(lp => (
            <button
              key={lp.id}
              onClick={() => {
                onTabChange(lp.id);
                // Reset mode to preview when switching tabs usually feels better
                setMode('preview');
              }}
              className={`h-full px-4 text-xs font-medium border-r border-gray-800 flex items-center gap-2 whitespace-nowrap transition-colors ${
                lp.id === activeId 
                  ? 'bg-gray-900 text-indigo-400 border-t-2 border-t-indigo-500' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <span className="truncate max-w-[150px]">{lp.title}</span>
            </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-950 shrink-0">
        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setMode('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              mode === 'preview' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <EyeIcon /> Preview
          </button>
          <button
            onClick={() => setMode('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              mode === 'code' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CodeIcon /> Código
          </button>
          <button
            onClick={() => setMode('elementor')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-2 transition-all ${
              mode === 'elementor' 
                ? 'bg-indigo-900/50 text-indigo-200 shadow-sm border border-indigo-500/30' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <ElementorIcon /> Elementor
          </button>
        </div>

        {activeLP && (
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => handleCopy(activeLP.html, 'full')} 
              icon={copyFeedback === 'full' ? undefined : <CopyIcon />}
              className="!text-xs !py-1.5 min-w-[100px]"
            >
              {copyFeedback === 'full' ? (
                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                  <CheckIcon />
                  <span className="text-green-300">Copiado!</span>
                </div>
              ) : (
                'Copiar Tudo'
              )}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleDownload} 
              icon={<DownloadIcon />}
              className="!text-xs !py-1.5"
            >
              Baixar HTML
            </Button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden bg-gray-900/50">
        {!activeLP ? (
           <div className="flex items-center justify-center h-full text-gray-500">Selecione uma LP</div>
        ) : (
          <>
            {mode === 'preview' && (
              <iframe
                title={`Preview ${activeLP.id}`}
                srcDoc={activeLP.html}
                className="w-full h-full border-none bg-white"
                sandbox="allow-scripts"
              />
            )}

            {mode === 'code' && (
              <div className="absolute inset-0 overflow-auto">
                <pre className="p-4 text-xs font-mono text-gray-300 bg-[#0d1117] min-h-full tab-4">
                  <code>{activeLP.html}</code>
                </pre>
              </div>
            )}

            {mode === 'elementor' && (
              <div className="absolute inset-0 overflow-auto p-8">
                 <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 text-center">
                        <h3 className="text-xl font-semibold text-indigo-300 mb-2">Modo Integração Elementor</h3>
                        <p className="text-sm text-gray-400">
                          Para levar seu design para o WordPress/Elementor, copie cada seção abaixo individualmente 
                          e cole dentro de um widget <strong>HTML</strong> no Elementor.
                        </p>
                        <p className="text-xs text-indigo-400/70 mt-2 font-mono">
                          Nota: O CSS necessário é copiado automaticamente junto com cada seção.
                        </p>
                    </div>

                    <div className="grid gap-6">
                      {sections.map((section) => (
                        <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:border-gray-700 transition-all group">
                          <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-mono group-hover:bg-gray-700 transition-colors">
                                   &lt;/&gt;
                                </span>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-200">{section.name}</h4>
                                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Pronto para Elementor HTML Widget</p>
                                </div>
                             </div>
                             <Button
                               variant="primary"
                               className="!text-xs !py-1.5 min-w-[120px]"
                               onClick={() => handleCopy(section.fullHtml, section.id)}
                             >
                               {copyFeedback === section.id ? (
                                <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                                  <CheckIcon />
                                  <span className="text-green-100 font-semibold">Copiado!</span>
                                </div>
                               ) : (
                                 'Copiar Código'
                               )}
                             </Button>
                          </div>
                          
                          {/* Mini Preview of the section */}
                          <div className="h-48 w-full bg-white relative">
                             <iframe 
                               title={section.name}
                               srcDoc={section.fullHtml}
                               className="w-full h-full border-none pointer-events-none select-none"
                               tabIndex={-1}
                             />
                             {/* Overlay to prevent interaction in mini preview */}
                             <div className="absolute inset-0 bg-transparent" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {sections.length === 0 && (
                      <div className="text-center text-gray-500 py-10">
                        Não foi possível identificar seções separadas neste HTML.
                      </div>
                    )}
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
