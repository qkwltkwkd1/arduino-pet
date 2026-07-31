import type { EvolutionStage, EvolutionInfo } from '../types/pet';

export const LEVEL_THRESHOLDS = [
  { level: 1, minExp: 0, maxExp: 99, stage: 'EGG' as EvolutionStage },
  { level: 2, minExp: 100, maxExp: 249, stage: 'BABY' as EvolutionStage },
  { level: 3, minExp: 250, maxExp: 449, stage: 'PET' as EvolutionStage },
  { level: 4, minExp: 450, maxExp: Infinity, stage: 'SUPER_PET' as EvolutionStage },
];

export const EVOLUTION_DETAILS: Record<EvolutionStage, EvolutionInfo> = {
  EGG: {
    stage: 'EGG',
    name: '알 (EGG)',
    minLevel: 1,
    minExp: 0,
    description: '따뜻한 온기를 느끼며 부화를 기다리고 있는 수수께끼의 알입니다.'
  },
  BABY: {
    stage: 'BABY',
    name: '아기 모구 (BABY MOGU)',
    minLevel: 2,
    minExp: 100,
    description: '갓 부화한 호기심 많은 아기 펫! 끊임없는 보살핌이 필요합니다.'
  },
  PET: {
    stage: 'PET',
    name: '성체 모구 (PET MOGU)',
    minLevel: 3,
    minExp: 250,
    description: '귀와 손발이 생겨 더욱 활발해진 펫! 함께 운동하고 놀 수 있습니다.'
  },
  SUPER_PET: {
    stage: 'SUPER_PET',
    name: '슈퍼 모구 (SUPER MOGU)',
    minLevel: 4,
    minExp: 450,
    description: '전설의 기운을 받아 마스터 단계로 진화한 찬란한 펫입니다!'
  }
};

export function getLevelFromExp(exp: number): number {
  if (exp >= 450) return 4;
  if (exp >= 250) return 3;
  if (exp >= 100) return 2;
  return 1;
}

export function getStageFromLevel(level: number): EvolutionStage {
  if (level >= 4) return 'SUPER_PET';
  if (level === 3) return 'PET';
  if (level === 2) return 'BABY';
  return 'EGG';
}

export function getExpProgress(exp: number): { currentExpInLevel: number; maxExpInLevel: number; percent: number } {
  const level = getLevelFromExp(exp);
  if (level === 1) {
    return { currentExpInLevel: exp, maxExpInLevel: 100, percent: Math.min(100, Math.floor((exp / 100) * 100)) };
  } else if (level === 2) {
    const cur = exp - 100;
    const max = 150;
    return { currentExpInLevel: cur, maxExpInLevel: max, percent: Math.min(100, Math.floor((cur / max) * 100)) };
  } else if (level === 3) {
    const cur = exp - 250;
    const max = 200;
    return { currentExpInLevel: cur, maxExpInLevel: max, percent: Math.min(100, Math.floor((cur / max) * 100)) };
  } else {
    return { currentExpInLevel: exp, maxExpInLevel: exp, percent: 100 };
  }
}
