export const GAMIFICATION_LEVELS = [
  { min: 0, title: "Novato", color: "gray", nextAt: 5 },
  { min: 5, title: "Explorador Gastronômico", color: "blue", nextAt: 10 },
  { min: 10, title: "Crítico Local", color: "purple", nextAt: 20 },
  { min: 20, title: "Mestre do Sabor", color: "amber", nextAt: 50 },
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
