"use client";

import React, { useEffect, useState } from "react";

export default function VLibrasWidget() {
  const [isActive, setIsActive] = useState(false);

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
    if (!isActive) return;

    // Se já foi inicializado, não repete (o script adiciona um iframe)
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
        }
      } catch (err) {
        console.error("Erro ao inicializar VLibras:", err);
      }
    };
    document.body.appendChild(script);
  }, [isActive]);

  // Renderiza a casca DOM estrita exigida pelo VLibras apenas quando ativo.
  // Evita hacks de CSS (display none/opacity 0) que quebram o cálculo de layout do widget.
  if (!isActive) return null;

  return (
    <div vw="true" className="enabled">
      <div vw-access-button="true" className="active"></div>
      <div vw-plugin-wrapper="true">
        <div className="vw-plugin-top-wrapper"></div>
      </div>
    </div>
  );
}
