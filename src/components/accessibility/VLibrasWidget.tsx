"use client";

import React, { useEffect, useState, useRef } from "react";

// Informa ao TypeScript que esses atributos customizados do VLibras são válidos em elementos HTML
declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    vw?: string;
    'vw-access-button'?: string;
    'vw-plugin-wrapper'?: string;
  }
}

export default function VLibrasWidget() {
  const [isActive, setIsActive] = useState(false);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    // Inicializar o estado do VLibras baseado no LocalStorage
    const checkStatus = () => {
      const isVlibrasEnabled = localStorage.getItem("accessibility-vlibras") === "true";
      setIsActive(isVlibrasEnabled);
    };
    
    checkStatus();

    // Custom event to listen for toggle changes from AccessibilityPanel
    window.addEventListener("vlibras-toggled", checkStatus);
    return () => window.removeEventListener("vlibras-toggled", checkStatus);
  }, []);

  useEffect(() => {
    // Sempre tentamos inicializar quando o componente montar, 
    // independente de isActive, para que o widget fique pronto na DOM.
    if (widgetInitialized.current) return;
    
    const initVlibras = () => {
      if (document.getElementById('vlibras-script')) return;

      const script = document.createElement('script');
      script.id = 'vlibras-script';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.onload = () => {
        try {
          // @ts-expect-error window.VLibras exists after script load
          if (window.VLibras && window.VLibras.Widget) {
            // @ts-expect-error window.VLibras exists after script load
            new window.VLibras.Widget('https://vlibras.gov.br/app');
            widgetInitialized.current = true;
          }
        } catch (err) {
          console.error("Erro ao inicializar VLibras:", err);
        }
      };
      document.body.appendChild(script);
    };

    // Pequeno atraso para garantir que os nós DOM estão montados
    const timeout = setTimeout(initVlibras, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  // Mantemos a casca na DOM, mas escondemos usando visibility/opacity se não estiver ativo,
  // pois unmount do VLibras quebra seu estado interno e iframes.
  return (
    <div 
      vw="true" 
      className="enabled"
      style={{
        display: isActive ? 'block' : 'none',
      }}
    >
      <div vw-access-button="true" className="active"></div>
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}
