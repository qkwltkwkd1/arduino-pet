import { useState, useEffect, useCallback } from 'react';
import { serialService } from '../services/serialService';
import type { SerialIncomingMessage, SerialSensorMessage, SerialState } from '../types/serial';
import type { MissionType } from '../types/mission';

export function useSerial(onMessage?: (msg: SerialIncomingMessage) => void) {
  const [state, setState] = useState<SerialState>({
    isConnected: false,
    isMockMode: false,
    logs: [],
  });

  const [lastTelemetry, setLastTelemetry] = useState<SerialSensorMessage>({
    type: 'sensor',
    distance: 20.0,
    button: false,
    mission: 'NONE',
  });

  const addLog = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      logs: [text, ...prev.logs.slice(0, 49)],
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setState(prev => ({
      ...prev,
      logs: [],
    }));
  }, []);

  useEffect(() => {
    const unsubMsg = serialService.subscribeMessage(msg => {
      if (msg.type === 'sensor') {
        setLastTelemetry(msg);
      } else if (msg.type === 'ready') {
        setState(prev => ({
          ...prev,
          isConnected: true,
          deviceName: msg.device,
          version: msg.version,
        }));
      }
      if (onMessage) {
        onMessage(msg);
      }
    });

    const unsubLog = serialService.subscribeRawLog(raw => {
      addLog(raw);
    });

    return () => {
      unsubMsg();
      unsubLog();
    };
  }, [onMessage, addLog]);

  const connect = async () => {
    try {
      addLog('[SYS] Requesting Serial Port...');
      const success = await serialService.connect(9600);
      if (success) {
        setState(prev => ({
          ...prev,
          isConnected: true,
          isMockMode: false,
        }));
        addLog('[SYS] Connected to Serial Port (9600 baud).');
      }
    } catch (err) {
      const errMsg = (err as Error).message || '';
      if (errMsg.includes('Failed to open') || errMsg.includes('already open')) {
        addLog('[ERR] COM 포트 연결 실패: 아두이노 IDE의 [시리얼 모니터] 창이 켜져있다면 닫고 다시 시도하세요!');
      } else if (errMsg.includes('No port selected')) {
        addLog('[SYS] 포트 선택이 취소되었습니다. COM 포트 항목을 클릭한 뒤 [연결]을 누르세요.');
      } else {
        addLog(`[ERR] 연결 실패: ${errMsg}`);
      }
    }
  };

  const disconnect = async () => {
    await serialService.disconnect();
    setState(prev => ({
      ...prev,
      isConnected: false,
    }));
    addLog('[SYS] Serial Port disconnected.');
  };

  const toggleMockMode = useCallback((enabled?: unknown) => {
    const isBool = typeof enabled === 'boolean';
    setState(prev => {
      const nextMock = isBool ? (enabled as boolean) : !prev.isMockMode;
      addLog(`[SYS] Mock Mode set to ${nextMock ? 'ON' : 'OFF'}`);
      return {
        ...prev,
        isMockMode: nextMock,
        isConnected: nextMock ? true : serialService.isConnected(),
      };
    });
  }, [addLog]);

  const sendCommand = async (cmd: string): Promise<boolean> => {
    if (state.isMockMode) {
      addLog(`[MOCK SENT] ${cmd.trim()}`);
      return true;
    }
    return await serialService.sendCommand(cmd);
  };

  const triggerMockMessage = useCallback((msg: SerialIncomingMessage) => {
    addLog(`[MOCK INCOMING] ${JSON.stringify(msg)}`);
    if (msg.type === 'sensor') {
      setLastTelemetry(msg);
    }
    if (onMessage) {
      onMessage(msg);
    }
  }, [addLog, onMessage]);

  const triggerMockProgress = useCallback((mission: MissionType, current: number, target: number, cycleTime?: number) => {
    triggerMockMessage({
      type: 'progress',
      mission,
      current,
      target,
      cycleTime: cycleTime || 400,
    });
  }, [triggerMockMessage]);

  const triggerMockComplete = useCallback((mission: MissionType, exp: number) => {
    triggerMockMessage({
      type: 'mission_complete',
      mission,
      exp,
    });
  }, [triggerMockMessage]);

  const triggerMockFailed = useCallback((mission: MissionType, reason: string) => {
    triggerMockMessage({
      type: 'mission_failed',
      mission,
      reason,
    });
  }, [triggerMockMessage]);

  const triggerMockActionFailed = useCallback((mission: MissionType, reason: string) => {
    triggerMockMessage({
      type: 'action_failed',
      mission,
      reason,
    });
  }, [triggerMockMessage]);

  const triggerMockSensor = useCallback((distance: number, button: boolean, mission: string = 'NONE') => {
    triggerMockMessage({
      type: 'sensor',
      distance,
      button,
      mission,
    });
  }, [triggerMockMessage]);

  const triggerMockLevelUp = useCallback(() => {
    triggerMockMessage({
      type: 'levelup_complete',
    });
  }, [triggerMockMessage]);

  return {
    isSupported: serialService.isSupported(),
    isConnected: state.isConnected,
    isMockMode: state.isMockMode,
    deviceName: state.deviceName,
    version: state.version,
    logs: state.logs,
    lastTelemetry,
    connect,
    disconnect,
    toggleMockMode,
    clearLogs,
    sendCommand,
    triggerMockMessage,
    triggerMockProgress,
    triggerMockComplete,
    triggerMockFailed,
    triggerMockActionFailed,
    triggerMockSensor,
    triggerMockLevelUp,
  };
}
