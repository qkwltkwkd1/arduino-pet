export type PetStatusType = 'idle' | 'hungry' | 'happy' | 'sick' | 'tired' | 'exercising' | 'sleeping' | 'levelup';

export type EvolutionStage = 'EGG' | 'BABY' | 'PET' | 'SUPER_PET';

export interface PetState {
  name: string;
  level: number;
  exp: number;
  hunger: number;     // 0 - 100
  happiness: number;  // 0 - 100
  energy: number;     // 0 - 100
  health: number;     // 0 - 100
  lastUpdated: number;
}

export type BackgroundTheme = 'room' | 'park' | 'restaurant' | 'hospital' | 'playground' | 'night';

export interface EvolutionInfo {
  stage: EvolutionStage;
  name: string;
  minLevel: number;
  minExp: number;
  description: string;
}
