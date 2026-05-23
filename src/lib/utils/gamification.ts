export const GAMIFICATION_LEVELS = [
  { min: 0, title: "Só vim pelo Wi-Fi", color: "gray", icon: "📶", humor: "PENDURADO NO ROTEADOR", nextAt: 6 },
  { min: 6, title: "Marmiteiro de Elite", color: "blue", icon: "🍱", humor: "ESPECIALISTA EM MISTURA", nextAt: 11 },
  { min: 11, title: "Caçador de Rodízios", color: "green", icon: "🍕", humor: "PREJUÍZO DA PIZZARIA", nextAt: 21 },
  { min: 21, title: "Sommelier de PF", color: "purple", icon: "🍛", humor: "AVALIADOR DE FAROFA", nextAt: 36 },
  { min: 36, title: "Terror do Buffet Livre", color: "red", icon: "🍽️", humor: "BALANÇA QUEBRADA", nextAt: 51 },
  { min: 51, title: "Crítico de Boteco", color: "orange", icon: "🍻", humor: "RAIZ DEMAIS", nextAt: 101 },
  { min: 101, title: "Imperador da Gastronomia", color: "amber", icon: "👑", humor: "GORDON RAMSAY BR", nextAt: null },
];

export function getUserLevelData(count: number) {
  const currentLevel = [...GAMIFICATION_LEVELS].reverse().find(l => count >= l.min) || GAMIFICATION_LEVELS[0];
  const nextLevelIndex = GAMIFICATION_LEVELS.findIndex(l => l.min === currentLevel.min) + 1;
  const nextLevel = GAMIFICATION_LEVELS[nextLevelIndex] || null;

  const progress = nextLevel 
    ? Math.min(100, Math.round(((count - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
    : 100;

  return {
    currentTitle: currentLevel.title,
    currentLevelColor: currentLevel.color,
    nextAt: nextLevel?.min || null,
    progress,
    remaining: nextLevel ? nextLevel.min - count : 0
  };
}

export function getUserTitle(count: number) {
  return getUserLevelData(count).currentTitle;
}
