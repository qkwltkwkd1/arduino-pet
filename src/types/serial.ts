/// <reference types="w3c-web-serial" />
import type { MissionType } from './mission';

export type SerialIncomingMessageType =
  | 'ready'
  | 'sensor'
  | 'mission_started'
  | 'progress'
  | 'mission_complete'
  | 'action_failed'
  | 'mission_failed'
  | 'levelup_complete';

export interface SerialReadyMessage {
  type: 'ready';
  device: string;
  version: string;
}

export interface SerialSensorMessage {
  type: 'sensor';
  distance: number;
  button: boolean;
  mission: MissionType | 'NONE' | string;
}

export interface SerialMissionStartedMessage {
  type: 'mission_started';
  mission: MissionType;
}

export interface SerialProgressMessage {
  type: 'progress';
  mission: MissionType;
  current: number;
  target: number;
  cycleTime?: number;
}

export interface SerialMissionCompleteMessage {
  type: 'mission_complete';
  mission: MissionType;
  exp: number;
}

export interface SerialActionFailedMessage {
  type: 'action_failed';
  mission: MissionType;
  reason: string;
}

export interface SerialMissionFailedMessage {
  type: 'mission_failed';
  mission: MissionType;
  reason: string;
}

export interface SerialLevelUpCompleteMessage {
  type: 'levelup_complete';
}

export type SerialIncomingMessage =
  | SerialReadyMessage
  | SerialSensorMessage
  | SerialMissionStartedMessage
  | SerialProgressMessage
  | SerialMissionCompleteMessage
  | SerialActionFailedMessage
  | SerialMissionFailedMessage
  | SerialLevelUpCompleteMessage;

export interface SerialState {
  isConnected: boolean;
  isMockMode: boolean;
  deviceName?: string;
  version?: string;
  lastTelemetry?: SerialSensorMessage;
  logs: string[];
}
