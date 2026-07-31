import type { PetState } from '../types/pet';

const STORAGE_KEY = 'PIXEL_PET_LAB_SAVE_V1';
const SOUND_SETTING_KEY = 'PIXEL_PET_LAB_SOUND';

export const DEFAULT_PET_STATE: PetState = {
  name: 'MOGU',
  level: 1,
  exp: 0,
  hunger: 80,
  happiness: 80,
  energy: 80,
  health: 80,
  lastUpdated: Date.now(),
};

export function loadPetState(): PetState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PET_STATE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PET_STATE,
      ...parsed,
    };
  } catch (e) {
    console.error('Failed to load pet state from localStorage', e);
    return DEFAULT_PET_STATE;
  }
}

export function savePetState(state: PetState): void {
  try {
    const dataToSave = {
      ...state,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save pet state to localStorage', e);
  }
}

export function resetPetState(): PetState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset pet state', e);
  }
  return DEFAULT_PET_STATE;
}

export function loadSoundSetting(): boolean {
  try {
    const val = localStorage.getItem(SOUND_SETTING_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function saveSoundSetting(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_SETTING_KEY, String(enabled));
  } catch (e) {
    console.error('Failed to save sound setting', e);
  }
}
