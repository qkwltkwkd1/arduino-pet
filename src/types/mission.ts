export type MissionType = 'FEED' | 'SNACK' | 'MEDICINE' | 'PET' | 'EXERCISE' | 'WAIT';

export type ActionFeedback =
  | 'MOVE_FASTER'
  | 'MOVE_SLOWLY'
  | 'KEEP_DISTANCE'
  | 'HOLD_LONGER'
  | 'TOO_SLOW'
  | 'TIMEOUT'
  | 'BUTTON_PRESS_SHORT'
  | 'BUTTON_PRESS_LONG'
  | 'BUTTON_PRESS_TRIPLE';

export interface MissionDefinition {
  id: MissionType;
  title: string;
  description: string;
  actionInstruction: string;
  serialCommand: string; // e.g. "MISSION:FEED\n"
  targetCount: number;
  timeLimitSec: number;
  rewards: {
    exp: number;
    hunger?: number;
    happiness?: number;
    energy?: number;
    health?: number;
  };
  icon: string;
}

export interface ActiveMissionState {
  mission: MissionDefinition;
  currentCount: number;
  targetCount: number;
  startTime: number;
  cycleTimeMs?: number;
  lastFeedback?: ActionFeedback | string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  failReason?: string;
}
