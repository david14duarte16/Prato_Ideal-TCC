"use client";

import { useState, useEffect } from "react";
import { announce } from "@/components/accessibility/AriaAnnouncer";

export function useAccessibility() {
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [pauseAnimations, setPauseAnimations] = useState(false);
  const [textSpacing, setTextSpacing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    setHighContrast(localStorage.getItem("a11y-contrast") === "true");
    setDyslexiaFont(localStorage.getItem("a11y-dyslexia") === "true");
    setHighlightLinks(localStorage.getItem("a11y-highlight-links") === "true");
    setPauseAnimations(localStorage.getItem("a11y-pause-anim") === "true");
    setTextSpacing(localStorage.getItem("a11y-spacing") === "true");
    
    const savedFontSize = localStorage.getItem("a11y-font-size");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    
    setIsLoaded(true);
  }, []);

  // Apply High Contrast
  useEffect(() => {
    if (!isLoaded) return;
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
      localStorage.setItem("a11y-contrast", "true");
      announce("Alto contraste ativado");
    } else {
      document.documentElement.classList.remove("high-contrast");
      localStorage.setItem("a11y-contrast", "false");
    }
  }, [highContrast, isLoaded]);

  // Apply Dyslexia Font
  useEffect(() => {
    if (!isLoaded) return;
    if (dyslexiaFont) {
      document.documentElement.classList.add("dyslexia-font");
      localStorage.setItem("a11y-dyslexia", "true");
      announce("Fonte para dislexia ativada");
    } else {
      document.documentElement.classList.remove("dyslexia-font");
      localStorage.setItem("a11y-dyslexia", "false");
    }
  }, [dyslexiaFont, isLoaded]);

  // Apply Highlight Links
  useEffect(() => {
    if (!isLoaded) return;
    if (highlightLinks) {
      document.documentElement.classList.add("highlight-links");
      localStorage.setItem("a11y-highlight-links", "true");
      announce("Destaque de links ativado");
    } else {
      document.documentElement.classList.remove("highlight-links");
      localStorage.setItem("a11y-highlight-links", "false");
    }
  }, [highlightLinks, isLoaded]);

  // Apply Pause Animations
  useEffect(() => {
    if (!isLoaded) return;
    if (pauseAnimations) {
      document.documentElement.classList.add("pause-animations");
      localStorage.setItem("a11y-pause-anim", "true");
      announce("Animações pausadas");
    } else {
      document.documentElement.classList.remove("pause-animations");
      localStorage.setItem("a11y-pause-anim", "false");
    }
  }, [pauseAnimations, isLoaded]);

  // Apply Text Spacing
  useEffect(() => {
    if (!isLoaded) return;
    if (textSpacing) {
      document.documentElement.classList.add("text-spacing");
      localStorage.setItem("a11y-spacing", "true");
      announce("Espaçamento de texto ativado");
    } else {
      document.documentElement.classList.remove("text-spacing");
      localStorage.setItem("a11y-spacing", "false");
    }
  }, [textSpacing, isLoaded]);

  // Apply Font Size
  useEffect(() => {
    if (!isLoaded) return;
    // Set font size relative to root (16px base = 100%)
    // But since Tailwind uses rems, changing font-size on html scales everything nicely.
    document.documentElement.style.fontSize = `${(fontSize / 16) * 100}%`;
    localStorage.setItem("a11y-font-size", fontSize.toString());
  }, [fontSize, isLoaded]);

  return {
    highContrast, setHighContrast,
    dyslexiaFont, setDyslexiaFont,
    fontSize, setFontSize,
    highlightLinks, setHighlightLinks,
    pauseAnimations, setPauseAnimations,
    textSpacing, setTextSpacing,
    isLoaded
  };
}
