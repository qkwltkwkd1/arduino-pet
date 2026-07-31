/*
  Web Pet Arduino Controller

  사용 부품
  - 스위치: A3
  - 초음파센서 Trig: 13
  - 초음파센서 Echo: 12
  - LED: 5
  - 수동 피에조 부저: 6

  웹사이트가 보내는 명령
  MISSION:FEED
  MISSION:SNACK
  MISSION:MEDICINE
  MISSION:PET
  MISSION:EXERCISE
  MISSION:WAIT
  MISSION:CANCEL
  LEVELUP
  STATUS

  Arduino가 보내는 데이터는 한 줄짜리 JSON 형식이다.
*/

const int SWITCH_PIN = A3;
const int TRIG_PIN = 13;
const int ECHO_PIN = 12;
const int LED_PIN = 5;
const int BUZZER_PIN = 6;

// ======================================================
// 미션 종류
// ======================================================

enum Mission {
  MISSION_NONE,
  MISSION_FEED,
  MISSION_SNACK,
  MISSION_MEDICINE,
  MISSION_PET,
  MISSION_EXERCISE,
  MISSION_WAIT
};

Mission currentMission = MISSION_NONE;

// ======================================================
// 통신 설정
// ======================================================

String serialBuffer = "";

// ======================================================
// 스위치 설정
// ======================================================

// 버튼 떨림 방지 시간
const unsigned long DEBOUNCE_TIME = 40;

// 약 미션에서 필요한 길게 누르기 시간
const unsigned long LONG_PRESS_TIME = 2000;

// 간식 미션에서 3번 누르기를 완료해야 하는 제한 시간
const unsigned long MULTI_CLICK_TIMEOUT = 1200;

bool rawButtonState = HIGH;
bool stableButtonState = HIGH;
bool previousStableButtonState = HIGH;

unsigned long lastButtonChangeTime = 0;
unsigned long buttonPressStartTime = 0;

int clickCount = 0;
unsigned long firstClickTime = 0;

// ======================================================
// 초음파센서 설정
// ======================================================

// 손이 가까이 왔다고 판단하는 거리
const float NEAR_MIN_DISTANCE = 4.0;
const float NEAR_MAX_DISTANCE = 15.0;

// 기다려 미션 거리
const float WAIT_MIN_DISTANCE = 15.0;
const float WAIT_MAX_DISTANCE = 25.0;

// 손을 완전히 뗐다고 판단하는 거리
const float FAR_DISTANCE = 30.0;

// WAIT 미션 유지 시간
const unsigned long WAIT_HOLD_TIME = 3000;

// 쓰다듬기 동작 속도
// 가까이했다 멀리하는 한 번의 시간이 600ms 이상이어야 함
const unsigned long PET_MIN_CYCLE_TIME = 600;

// 너무 느린 동작은 새 동작으로 다시 시작
const unsigned long PET_MAX_CYCLE_TIME = 2500;

// 운동 동작 속도
// 가까이했다 멀리하는 한 번의 시간이 600ms 미만이어야 함
const unsigned long EXERCISE_MAX_CYCLE_TIME = 600;

const int PET_TARGET_COUNT = 3;
const int EXERCISE_TARGET_COUNT = 5;

bool handWasNear = false;
unsigned long handNearStartTime = 0;
unsigned long previousCycleTime = 0;

int movementCount = 0;

bool waitStarted = false;
unsigned long waitStartTime = 0;
int previousWaitSecond = -1;

// ======================================================
// 센서 측정 간격
// ======================================================

const unsigned long SENSOR_INTERVAL = 70;
const unsigned long TELEMETRY_INTERVAL = 300;

unsigned long lastSensorTime = 0;
unsigned long lastTelemetryTime = 0;

float currentDistance = -1;

// ======================================================
// 미션 제한 시간
// ======================================================

const unsigned long MISSION_TIMEOUT = 30000;
unsigned long missionStartTime = 0;

// ======================================================
// 시작
// ======================================================

void setup() {
  Serial.begin(9600);

  pinMode(SWITCH_PIN, INPUT_PULLUP);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(TRIG_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);

  delay(500);

  Serial.println(
    "{\"type\":\"ready\","
    "\"device\":\"WEB_PET_CONTROLLER\","
    "\"version\":\"2.0\"}"
  );
}

// ======================================================
// 반복 실행
// ======================================================

void loop() {
  readSerialCommand();
  checkSwitch();

  unsigned long now = millis();

  if (now - lastSensorTime >= SENSOR_INTERVAL) {
    lastSensorTime = now;

    currentDistance = measureDistance();
    checkUltrasonicMission(currentDistance);
  }

  if (now - lastTelemetryTime >= TELEMETRY_INTERVAL) {
    lastTelemetryTime = now;
    sendSensorData();
  }

  checkSnackTimeout();
  checkMissionTimeout();
}

// ======================================================
// 웹사이트 명령 읽기
// ======================================================

void readSerialCommand() {
  while (Serial.available() > 0) {
    char received = Serial.read();

    if (received == '\n') {
      serialBuffer.trim();

      if (serialBuffer.length() > 0) {
        handleCommand(serialBuffer);
      }

      serialBuffer = "";
    }
    else if (received != '\r') {
      serialBuffer += received;

      if (serialBuffer.length() > 80) {
        serialBuffer = "";
        sendError("COMMAND_TOO_LONG");
      }
    }
  }
}

void handleCommand(String command) {
  command.trim();
  command.toUpperCase();

  if (command == "MISSION:FEED") {
    startMission(MISSION_FEED);
  }
  else if (command == "MISSION:SNACK") {
    startMission(MISSION_SNACK);
  }
  else if (command == "MISSION:MEDICINE") {
    startMission(MISSION_MEDICINE);
  }
  else if (command == "MISSION:PET") {
    startMission(MISSION_PET);
  }
  else if (command == "MISSION:EXERCISE") {
    startMission(MISSION_EXERCISE);
  }
  else if (command == "MISSION:WAIT") {
    startMission(MISSION_WAIT);
  }
  else if (command == "MISSION:CANCEL") {
    cancelMission();
  }
  else if (command == "LEVELUP") {
    playLevelUpEffect();
  }
  else if (command == "STATUS") {
    sendStatus();
  }
  else if (command == "PING") {
    Serial.println("{\"type\":\"pong\"}");
  }
  else {
    sendError("UNKNOWN_COMMAND");
  }
}

// ======================================================
// 미션 시작
// ======================================================

void startMission(Mission mission) {
  resetMissionState();

  currentMission = mission;
  missionStartTime = millis();

  playMissionStartEffect();

  Serial.print("{\"type\":\"mission_started\",\"mission\":\"");
  Serial.print(getMissionName(currentMission));
  Serial.println("\"}");
}

void cancelMission() {
  String missionName = getMissionName(currentMission);

  resetMissionState();
  currentMission = MISSION_NONE;

  digitalWrite(LED_PIN, LOW);
  noTone(BUZZER_PIN);

  Serial.print("{\"type\":\"mission_cancelled\",\"mission\":\"");
  Serial.print(missionName);
  Serial.println("\"}");
}

void resetMissionState() {
  clickCount = 0;
  firstClickTime = 0;
  buttonPressStartTime = 0;

  handWasNear = false;
  handNearStartTime = 0;
  previousCycleTime = 0;
  movementCount = 0;

  waitStarted = false;
  waitStartTime = 0;
  previousWaitSecond = -1;

  missionStartTime = 0;
}

// ======================================================
// 스위치 입력
// ======================================================

void checkSwitch() {
  bool reading = digitalRead(SWITCH_PIN);

  if (reading != rawButtonState) {
    rawButtonState = reading;
    lastButtonChangeTime = millis();
  }

  if (millis() - lastButtonChangeTime >= DEBOUNCE_TIME) {
    if (stableButtonState != rawButtonState) {
      stableButtonState = rawButtonState;
    }
  }

  if (stableButtonState == previousStableButtonState) {
    return;
  }

  // 버튼을 누른 순간
  if (stableButtonState == LOW) {
    buttonPressStartTime = millis();

    sendAction("BUTTON_DOWN");
  }

  // 버튼을 뗀 순간
  else {
    unsigned long pressedTime = millis() - buttonPressStartTime;

    handleButtonRelease(pressedTime);
  }

  previousStableButtonState = stableButtonState;
}

// 버튼을 뗐을 때 현재 미션에 따라 판정
void handleButtonRelease(unsigned long pressedTime) {
  if (currentMission == MISSION_FEED) {
    // 너무 길게 누른 것은 먹이 미션으로 인정하지 않음
    if (pressedTime < LONG_PRESS_TIME) {
      sendAction("SHORT_PRESS");
      completeMission(5);
    }
    else {
      failAction("PRESS_TOO_LONG");
    }
  }

  else if (currentMission == MISSION_SNACK) {
    // 짧게 누른 경우만 횟수에 포함
    if (pressedTime < LONG_PRESS_TIME) {
      registerSnackClick();
    }
    else {
      failAction("PRESS_TOO_LONG");
    }
  }

  else if (currentMission == MISSION_MEDICINE) {
    if (pressedTime >= LONG_PRESS_TIME) {
      sendAction("LONG_PRESS");
      completeMission(10);
    }
    else {
      failAction("HOLD_LONGER");
    }
  }
}

// ======================================================
// 간식 3번 연속 누르기
// ======================================================

void registerSnackClick() {
  unsigned long now = millis();

  if (clickCount == 0) {
    firstClickTime = now;
  }

  clickCount++;

  playProgressSound(clickCount);

  Serial.print(
    "{\"type\":\"progress\",\"mission\":\"SNACK\",\"current\":"
  );
  Serial.print(clickCount);
  Serial.println(",\"target\":3}");

  if (clickCount >= 3) {
    completeMission(10);
  }
}

void checkSnackTimeout() {
  if (currentMission != MISSION_SNACK || clickCount == 0) {
    return;
  }

  if (millis() - firstClickTime > MULTI_CLICK_TIMEOUT) {
    clickCount = 0;
    firstClickTime = 0;

    failAction("TOO_SLOW");
  }
}

// ======================================================
// 초음파센서 미션
// ======================================================

void checkUltrasonicMission(float distance) {
  if (currentMission == MISSION_PET) {
    checkMovementMission(
      distance,
      PET_TARGET_COUNT,
      false
    );
  }

  else if (currentMission == MISSION_EXERCISE) {
    checkMovementMission(
      distance,
      EXERCISE_TARGET_COUNT,
      true
    );
  }

  else if (currentMission == MISSION_WAIT) {
    checkWaitMission(distance);
  }
}

// ======================================================
// 쓰다듬기 및 운동
// ======================================================

void checkMovementMission(
  float distance,
  int targetCount,
  bool mustBeFast
) {
  if (distance < 0) {
    return;
  }

  bool isNear =
    distance >= NEAR_MIN_DISTANCE &&
    distance <= NEAR_MAX_DISTANCE;

  bool isFar = distance >= FAR_DISTANCE;

  // 손이 가까이 들어온 순간
  if (isNear && !handWasNear) {
    handWasNear = true;
    handNearStartTime = millis();

    sendAction("HAND_NEAR");
  }

  // 가까이 왔다가 멀어진 순간
  if (isFar && handWasNear) {
    handWasNear = false;

    unsigned long cycleTime = millis() - handNearStartTime;
    previousCycleTime = cycleTime;

    bool validMovement = false;

    if (mustBeFast) {
      // 운동: 빠르게 움직여야 함
      validMovement = cycleTime <= EXERCISE_MAX_CYCLE_TIME;
    }
    else {
      // 쓰다듬기: 천천히 움직여야 함
      validMovement =
        cycleTime >= PET_MIN_CYCLE_TIME &&
        cycleTime <= PET_MAX_CYCLE_TIME;
    }

    if (validMovement) {
      movementCount++;

      playProgressSound(movementCount);

      Serial.print("{\"type\":\"progress\",\"mission\":\"");
      Serial.print(getMissionName(currentMission));
      Serial.print("\",\"current\":");
      Serial.print(movementCount);
      Serial.print(",\"target\":");
      Serial.print(targetCount);
      Serial.print(",\"cycleTime\":");
      Serial.print(cycleTime);
      Serial.println("}");

      if (movementCount >= targetCount) {
        int reward = mustBeFast ? 15 : 10;
        completeMission(reward);
      }
    }
    else {
      if (mustBeFast) {
        failAction("MOVE_FASTER");
      }
      else {
        failAction("MOVE_SLOWLY");
      }
    }
  }
}

// ======================================================
// 기다려 미션
// ======================================================

void checkWaitMission(float distance) {
  if (distance < 0) {
    resetWaitProgress();
    return;
  }

  bool isInWaitZone =
    distance >= WAIT_MIN_DISTANCE &&
    distance <= WAIT_MAX_DISTANCE;

  if (isInWaitZone) {
    if (!waitStarted) {
      waitStarted = true;
      waitStartTime = millis();
      previousWaitSecond = -1;

      sendAction("KEEP_STILL");
    }

    unsigned long heldTime = millis() - waitStartTime;
    int currentSecond = heldTime / 1000;

    if (currentSecond != previousWaitSecond) {
      previousWaitSecond = currentSecond;

      int displaySecond = currentSecond;

      if (displaySecond > 3) {
        displaySecond = 3;
      }

      Serial.print(
        "{\"type\":\"progress\",\"mission\":\"WAIT\",\"current\":"
      );
      Serial.print(displaySecond);
      Serial.println(",\"target\":3}");
    }

    if (heldTime >= WAIT_HOLD_TIME) {
      completeMission(15);
    }
  }
  else if (waitStarted) {
    resetWaitProgress();
    failAction("KEEP_DISTANCE");
  }
}

void resetWaitProgress() {
  waitStarted = false;
  waitStartTime = 0;
  previousWaitSecond = -1;
}

// ======================================================
// 미션 성공
// ======================================================

void completeMission(int exp) {
  String completedMission = getMissionName(currentMission);

  playSuccessEffect();

  Serial.print("{\"type\":\"mission_complete\",\"mission\":\"");
  Serial.print(completedMission);
  Serial.print("\",\"exp\":");
  Serial.print(exp);
  Serial.println("}");

  resetMissionState();
  currentMission = MISSION_NONE;
}

// ======================================================
// 미션 제한 시간
// ======================================================

void checkMissionTimeout() {
  if (currentMission == MISSION_NONE) {
    return;
  }

  if (millis() - missionStartTime >= MISSION_TIMEOUT) {
    String failedMission = getMissionName(currentMission);

    playFailEffect();

    Serial.print("{\"type\":\"mission_failed\",\"mission\":\"");
    Serial.print(failedMission);
    Serial.println("\",\"reason\":\"TIMEOUT\"}");

    resetMissionState();
    currentMission = MISSION_NONE;
  }
}

// ======================================================
// LED와 부저 효과
// ======================================================

// 미션 시작
void playMissionStartEffect() {
  digitalWrite(LED_PIN, HIGH);

  tone(BUZZER_PIN, 523, 80);
  delay(100);

  tone(BUZZER_PIN, 659, 100);
  delay(120);

  noTone(BUZZER_PIN);
  digitalWrite(LED_PIN, LOW);
}

// 진행 상황
void playProgressSound(int progress) {
  int frequency = 650 + progress * 100;

  tone(BUZZER_PIN, frequency, 70);
  delay(85);
  noTone(BUZZER_PIN);
}

// 행동 실패
void failAction(String reason) {
  playFailEffect();

  Serial.print("{\"type\":\"action_failed\",\"mission\":\"");
  Serial.print(getMissionName(currentMission));
  Serial.print("\",\"reason\":\"");
  Serial.print(reason);
  Serial.println("\"}");
}

// 성공 효과
void playSuccessEffect() {
  digitalWrite(LED_PIN, HIGH);

  int notes[] = {523, 659, 784};
  int durations[] = {90, 90, 220};

  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, notes[i], durations[i]);
    delay(durations[i] + 30);
    noTone(BUZZER_PIN);
  }

  delay(200);
  digitalWrite(LED_PIN, LOW);
}

// 실패 효과
void playFailEffect() {
  digitalWrite(LED_PIN, HIGH);

  tone(BUZZER_PIN, 350, 140);
  delay(170);

  tone(BUZZER_PIN, 250, 220);
  delay(250);

  noTone(BUZZER_PIN);
  digitalWrite(LED_PIN, LOW);
}

// 레벨업 효과
void playLevelUpEffect() {
  Serial.println("{\"type\":\"levelup_started\"}");

  digitalWrite(LED_PIN, HIGH);

  int melody[] = {
    523,
    659,
    784,
    1047
  };

  int durations[] = {
    100,
    100,
    100,
    350
  };

  for (int i = 0; i < 4; i++) {
    tone(BUZZER_PIN, melody[i], durations[i]);
    delay(durations[i] + 40);
    noTone(BUZZER_PIN);

    // 레벨업 중 LED 깜빡임
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }

  digitalWrite(LED_PIN, HIGH);
  delay(700);
  digitalWrite(LED_PIN, LOW);

  Serial.println("{\"type\":\"levelup_complete\"}");
}

// ======================================================
// 초음파센서 측정
// ======================================================

float measureDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  if (duration == 0) {
    return -1;
  }

  float distance = duration * 0.0343 / 2.0;

  if (distance < 2.0 || distance > 400.0) {
    return -1;
  }

  return distance;
}

// ======================================================
// 웹사이트에 데이터 전송
// ======================================================

void sendSensorData() {
  Serial.print("{\"type\":\"sensor\",\"distance\":");

  if (currentDistance < 0) {
    Serial.print(-1);
  }
  else {
    Serial.print(currentDistance, 1);
  }

  Serial.print(",\"button\":");
  Serial.print(stableButtonState == LOW ? "true" : "false");

  Serial.print(",\"mission\":\"");
  Serial.print(getMissionName(currentMission));
  Serial.println("\"}");
}

void sendAction(String action) {
  Serial.print("{\"type\":\"action\",\"mission\":\"");
  Serial.print(getMissionName(currentMission));
  Serial.print("\",\"action\":\"");
  Serial.print(action);
  Serial.println("\"}");
}

void sendStatus() {
  Serial.print("{\"type\":\"status\",\"mission\":\"");
  Serial.print(getMissionName(currentMission));

  Serial.print("\",\"distance\":");

  if (currentDistance < 0) {
    Serial.print(-1);
  }
  else {
    Serial.print(currentDistance, 1);
  }

  Serial.print(",\"movementCount\":");
  Serial.print(movementCount);

  Serial.print(",\"clickCount\":");
  Serial.print(clickCount);

  Serial.println("}");
}

void sendError(String errorCode) {
  Serial.print("{\"type\":\"error\",\"code\":\"");
  Serial.print(errorCode);
  Serial.println("\"}");
}

// ======================================================
// 미션 이름 반환
// ======================================================

String getMissionName(Mission mission) {
  switch (mission) {
    case MISSION_FEED:
      return "FEED";

    case MISSION_SNACK:
      return "SNACK";

    case MISSION_MEDICINE:
      return "MEDICINE";

    case MISSION_PET:
      return "PET";

    case MISSION_EXERCISE:
      return "EXERCISE";

    case MISSION_WAIT:
      return "WAIT";

    case MISSION_NONE:
    default:
      return "NONE";
  }
}