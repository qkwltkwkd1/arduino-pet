import React, { useEffect, useState } from 'react';
import type { MissionDefinition, ActiveMissionState, ActionFeedback } from '../types/mission';
import { PixelButton } from './PixelButton';
import { PixelHeart } from './PixelHeart';
import { soundService } from '../services/soundService';

interface MissionPanelProps {
  missions: MissionDefinition[];
  activeMission: ActiveMissionState | null;
  onStartMission: (mission: MissionDefinition) => void;
  onCancelMission: () => void;
  onMockProgressStep?: () => void;
  onMockComplete?: () => void;
  onMockFail?: () => void;
  isMockMode?: boolean;
}

export const MissionPanel: React.FC<MissionPanelProps> = ({
  missions,
  activeMission,
  onStartMission,
  onCancelMission,
  onMockProgressStep,
  onMockComplete,
  onMockFail,
  isMockMode = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);

  useEffect(() => {
    if (activeMission && activeMission.status === 'running') {
      setTimeLeft(activeMission.mission.timeLimitSec);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeMission]);

  const getFeedbackMessage = (feedback?: ActionFeedback | string) => {
    switch (feedback) {
      case 'MOVE_FASTER':
        return '⚡ 손을 더 빠르게 움직여 주세요!';
      case 'MOVE_SLOWLY':
        return '🐢 손을 천천히 움직여 주세요!';
      case 'KEEP_DISTANCE':
        return '📏 15~25cm 거리를 유지해 주세요!';
      case 'HOLD_LONGER':
        return '🔘 스위치를 더 오래 눌러 주세요!';
      case 'TOO_SLOW':
        return '⏱️ 스위치를 더 빠르게 세 번 눌러 주세요!';
      case 'TIMEOUT':
        return '⌛ 제한 시간이 종료되었습니다.';
      default:
        return feedback || activeMission?.mission.actionInstruction;
    }
  };

  if (activeMission) {
    const { mission, currentCount, targetCount, status, failReason, lastFeedback } = activeMission;
    const isCompleted = status === 'completed';
    const isFailed = status === 'failed';

    return (
      <div className="rpg-dialogue-box p-3.5 sm:p-4 rounded-2xl font-pixel text-slate-900 flex-1 flex flex-col justify-between min-h-0">
        {/* Dialogue Header */}
        <div className="flex justify-between items-center bg-sky-100 border-2 border-black rounded-xl px-3 py-1.5 mb-2.5">
          <span className="text-sky-950 text-xs font-bold flex items-center gap-1.5">
            <span>🍃</span>
            <span>{mission.title}</span>
          </span>
          <span className="text-xs text-rose-600 font-bold">
            {isCompleted ? 'CLEAR!' : isFailed ? 'FAILED' : `⌛ ${timeLeft}s`}
          </span>
        </div>

        {!isCompleted && !isFailed && (
          <div className="space-y-3 flex-1 flex flex-col justify-between min-h-0">
            <div className="bg-white border-2 border-black p-3 rounded-xl space-y-1 shadow-[2px_2px_0px_#38bdf8]">
              <span className="text-[10px] text-sky-600 font-bold block flex items-center gap-1">
                <span>💬</span>
                <span>ACTION GUIDE</span>
              </span>
              <p className="text-xs text-slate-900 leading-relaxed font-bold">
                "{getFeedbackMessage(lastFeedback)}"
              </p>
            </div>

            <div className="bg-sky-50 border-2 border-black p-2.5 rounded-xl text-center shadow-[2px_2px_0px_#38bdf8]">
              <div className="text-[10px] text-sky-700 font-bold mb-1">PROGRESS</div>
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: targetCount }, (_, i) => (
                  <PixelHeart key={i} size={18} filled={i < currentCount} color="#f43f5e" />
                ))}
                <span className="text-xs text-sky-800 font-bold ml-1">({currentCount} / {targetCount})</span>
              </div>
            </div>

            {isMockMode && (
              <div className="pt-2 border-t border-sky-200 flex flex-wrap gap-2 justify-center">
                <PixelButton variant="ac-cyan" size="sm" onClick={onMockProgressStep}>
                  ➕ 센서 (+1)
                </PixelButton>
                <PixelButton variant="ac-cream" size="sm" onClick={onMockComplete}>
                  ⭐ 즉시 성공
                </PixelButton>
                <PixelButton variant="danger" size="sm" onClick={onMockFail}>
                  💥 실패 테스트
                </PixelButton>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <PixelButton variant="danger" size="sm" onClick={onCancelMission}>
                미션 취소
              </PixelButton>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center space-y-2 py-4 animate-bounce">
            <div className="text-2xl text-sky-600 font-bold tracking-wider">
              🌟 MISSION CLEAR! 🌟
            </div>
            <p className="text-emerald-700 text-xs sm:text-sm font-bold">
              경험치 <span className="text-pink-600 font-bold text-base">+{mission.rewards.exp} EXP</span> 획득!
            </p>
            <div className="flex justify-center pt-2">
              <PixelButton variant="ac-cream" size="md" onClick={onCancelMission}>
                확인 (CONTINUE)
              </PixelButton>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="text-center space-y-2 py-3">
            <div className="text-xl text-rose-600 font-bold tracking-wider">
              💀 MISSION FAILED 💀
            </div>
            <p className="text-xs text-slate-700">
              이유: <span className="text-rose-600 font-bold">{getFeedbackMessage(failReason)}</span>
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <PixelButton variant="ac-cyan" size="sm" onClick={() => onStartMission(mission)}>
                다시 도전
              </PixelButton>
              <PixelButton variant="dark" size="sm" onClick={onCancelMission}>
                닫기
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MISSION SELECTION LIST (Immaculate card padding & smooth scrolling)
  return (
    <div className="bg-[#fffefb] border-3 border-black p-3.5 sm:p-4 rounded-2xl shadow-[4px_4px_0px_#38bdf8] font-pixel flex-1 flex flex-col justify-between min-h-0">
      <div className="flex justify-between items-center border-b-2 border-sky-200 pb-2 mb-2.5">
        <h3 className="text-xs sm:text-sm font-bold text-sky-950 flex items-center gap-1.5">
          <span>📜</span>
          <span>미션 목록 (MISSION LIST)</span>
        </h3>
        <span className="text-[10px] text-sky-600 font-bold">훈련을 선택하세요</span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1">
        {missions.map(m => (
          <div
            key={m.id}
            className="bg-sky-50/80 border-2 border-black p-3 rounded-xl hover:border-sky-500 transition-all flex flex-col justify-between shadow-[2px_2px_0px_#38bdf8]"
          >
            <div className="space-y-1 mb-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>{m.icon}</span>
                  <span>{m.title}</span>
                </span>
                <span className="text-[9px] bg-sky-200 text-sky-950 px-2 py-0.5 border border-black rounded-full font-bold">
                  +{m.rewards.exp} EXP
                </span>
              </div>
              <p className="text-[10px] text-slate-700 leading-snug">{m.description}</p>
              <p className="text-[9px] text-sky-800 bg-white p-1.5 border border-sky-200 rounded-lg font-bold">
                🎮 {m.actionInstruction}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <PixelButton
                variant="ac-cyan"
                size="sm"
                onClick={() => {
                  soundService.playStart();
                  onStartMission(m);
                }}
              >
                미션 시작
              </PixelButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
