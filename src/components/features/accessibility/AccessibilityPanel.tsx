"use client";

import { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Contrast, Type, X, Accessibility, Link2, PauseCircle, Baseline } from "lucide-react";
import { useAccessibility } from "@/hooks/useAccessibility";

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    highContrast, setHighContrast,
    dyslexiaFont, setDyslexiaFont,
    fontSize, setFontSize,
    highlightLinks, setHighlightLinks,
    pauseAnimations, setPauseAnimations,
    textSpacing, setTextSpacing,
    isLoaded
  } = useAccessibility();

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus trap logic
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    
    const focusableElements = panelRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus first element on open
    setTimeout(() => firstElement?.focus(), 50);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!isLoaded) return null;

  return (
    <div className="fixed left-4 sm:left-6 bottom-6 sm:bottom-8 z-9999 flex flex-col items-start gap-4">
      {isOpen ? (
        <div 
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-dialog-title"
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] p-6 w-[calc(100vw-32px)] sm:w-80 animate-in slide-in-from-bottom-4 sm:slide-in-from-left-4 fade-in duration-300 origin-bottom-left max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 id="a11y-dialog-title" className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500">
                <Accessibility size={20} />
              </div>
              Acessibilidade
            </h2>
            <button 
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Fechar painel de acessibilidade"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {/* Font Size */}
            <div className="flex flex-col gap-3">
              <span id="font-size-label" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tamanho da Fonte</span>
              <div 
                role="group" 
                aria-labelledby="font-size-label"
                className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-zinc-800"
              >
                <button 
                  onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
                  className="p-3 hover:bg-white dark:hover:bg-zinc-700 rounded-xl shadow-sm transition-all active:scale-95 text-gray-700 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Diminuir tamanho da fonte"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="font-bold tabular-nums text-lg text-gray-900 dark:text-white" aria-live="polite">
                  {fontSize}px
                </span>
                <button 
                  onClick={() => setFontSize(Math.min(fontSize + 2, 32))}
                  className="p-3 hover:bg-white dark:hover:bg-zinc-700 rounded-xl shadow-sm transition-all active:scale-95 text-gray-700 dark:text-gray-300 focus-visible:ring-2 focus-visible:ring-red-500"
                  aria-label="Aumentar tamanho da fonte"
                >
                  <ZoomIn size={20} />
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-zinc-800 w-full" />

            {/* High Contrast */}
            <button 
              role="switch"
              aria-checked={highContrast}
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                highContrast 
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400" 
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Contrast size={20} className={highContrast ? "text-red-500" : "text-gray-500"} />
                <span className="font-semibold text-left">Alto Contraste</span>
              </div>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${highContrast ? "bg-red-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${highContrast ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

            {/* Dyslexia Font */}
            <button 
              role="switch"
              aria-checked={dyslexiaFont}
              onClick={() => setDyslexiaFont(!dyslexiaFont)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                dyslexiaFont 
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400" 
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Type size={20} className={dyslexiaFont ? "text-red-500" : "text-gray-500"} />
                <span className="font-semibold text-left">Fonte para Dislexia</span>
              </div>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${dyslexiaFont ? "bg-red-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${dyslexiaFont ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

            {/* Highlight Links */}
            <button 
              role="switch"
              aria-checked={highlightLinks}
              onClick={() => setHighlightLinks(!highlightLinks)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                highlightLinks 
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400" 
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Link2 size={20} className={highlightLinks ? "text-red-500" : "text-gray-500"} />
                <span className="font-semibold text-left">Destacar Links</span>
              </div>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${highlightLinks ? "bg-red-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${highlightLinks ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

            {/* Pause Animations */}
            <button 
              role="switch"
              aria-checked={pauseAnimations}
              onClick={() => setPauseAnimations(!pauseAnimations)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                pauseAnimations 
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400" 
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <PauseCircle size={20} className={pauseAnimations ? "text-red-500" : "text-gray-500"} />
                <span className="font-semibold text-left">Pausar Animações</span>
              </div>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${pauseAnimations ? "bg-red-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${pauseAnimations ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

            {/* Text Spacing */}
            <button 
              role="switch"
              aria-checked={textSpacing}
              onClick={() => setTextSpacing(!textSpacing)}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 ${
                textSpacing 
                  ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400" 
                  : "bg-white border-gray-100 text-gray-700 hover:border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-gray-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <Baseline size={20} className={textSpacing ? "text-red-500" : "text-gray-500"} />
                <span className="font-semibold text-left">Espaçamento de Texto</span>
              </div>
              <div className={`w-10 h-6 shrink-0 rounded-full relative transition-colors ${textSpacing ? "bg-red-500" : "bg-gray-200 dark:bg-zinc-700"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${textSpacing ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </button>

          </div>
        </div>
      ) : (
        <button 
          ref={triggerRef}
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="a11y-panel"
          aria-haspopup="dialog"
          className="p-4 bg-red-600 text-white rounded-full shadow-[0_8px_30px_rgb(220,38,38,0.4)] hover:bg-red-700 hover:scale-105 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/50 accessibility-trigger group flex items-center justify-center"
          aria-label="Abrir opções de acessibilidade"
        >
          <Accessibility size={28} className="group-hover:rotate-12 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
