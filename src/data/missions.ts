import type { MissionDefinition, MissionType } from '../types/mission';

export const MISSIONS: Record<MissionType, MissionDefinition> = {
  FEED: {
    id: 'FEED',
    title: '밥 먹을 시간!',
    description: '배고픈 펫을 위해 따뜻한 밥을 챙겨주세요.',
    actionInstruction: 'Arduino 스위치를 짧게 한 번 눌러주세요.',
    serialCommand: 'MISSION:FEED\n',
    targetCount: 1,
    timeLimitSec: 30,
    rewards: {
      exp: 5,
      hunger: 20,
    },
    icon: '🍚',
  },
  SNACK: {
    id: 'SNACK',
    title: '특별 간식 주기',
    description: '기분이 좋아지는 픽셀 별사탕 간식을 나눠주세요!',
    actionInstruction: 'Arduino 스위치를 빠르게 세 번 연속 눌러주세요.',
    serialCommand: 'MISSION:SNACK\n',
    targetCount: 3,
    timeLimitSec: 30,
    rewards: {
      exp: 10,
      happiness: 15,
    },
    icon: '🍬',
  },
  MEDICINE: {
    id: 'MEDICINE',
    title: '아픈 펫에게 약 주기',
    description: '펫의 컨디션을 회복시키기 위해 쓴 약을 달래며 먹여주세요.',
    actionInstruction: 'Arduino 스위치를 2초 이상 길게 꾹 눌러주세요.',
    serialCommand: 'MISSION:MEDICINE\n',
    targetCount: 1,
    timeLimitSec: 30,
    rewards: {
      exp: 10,
      health: 25,
    },
    icon: '💊',
  },
  PET: {
    id: 'PET',
    title: '펫 쓰다듬기',
    description: '펫의 머리를 부드럽고 따뜻하게 쓸어넘겨 주세요.',
    actionInstruction: '초음파센서 앞에서 손을 천천히 가까이했다가 멀리하는 행동을 3회 반복하세요.',
    serialCommand: 'MISSION:PET\n',
    targetCount: 3,
    timeLimitSec: 30,
    rewards: {
      exp: 10,
      happiness: 20,
    },
    icon: '🖐️',
  },
  EXERCISE: {
    id: 'EXERCISE',
    title: '펫과 운동하기',
    description: '펫이 튼튼해지도록 민첩한 손동작으로 신나게 뛰어놀아 주세요!',
    actionInstruction: '초음파센서 앞에서 손을 빠르게 가까이했다가 멀리하는 행동을 5회 반복하세요.',
    serialCommand: 'MISSION:EXERCISE\n',
    targetCount: 5,
    timeLimitSec: 30,
    rewards: {
      exp: 15,
      energy: 20,
    },
    icon: '⚡',
  },
  WAIT: {
    id: 'WAIT',
    title: '기다려 훈련',
    description: '침착하게 거리를 유지하며 인내심을 길러주는 훈련입니다.',
    actionInstruction: '초음파센서 기준 15cm~25cm 거리를 3초 동안 움직이지 않고 유지하세요.',
    serialCommand: 'MISSION:WAIT\n',
    targetCount: 3,
    timeLimitSec: 30,
    rewards: {
      exp: 15,
      happiness: 10,
      energy: 10,
    },
    icon: '⏳',
  },
};

export const MISSION_LIST: MissionDefinition[] = Object.values(MISSIONS);
