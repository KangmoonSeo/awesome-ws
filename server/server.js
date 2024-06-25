const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = 8080;
const MAX_CONNECTIONS = 1000;

const server = new WebSocket.Server({ port: PORT });

const connectionPool = new Map();

const jokes = [
  "포도가 자기소개를 하면? 포도당ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "우리나라에서 바람이 제일 많이부는 곳은? 분당ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "D가 20개면? 스무디ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "어떻게 하더라도 절대로 못이기는 마늘은? 다진마늘ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "인천앞바다의 반댓말은? 인천 엄마다ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "왕이 궁에 들어가기 싫으면? 궁시렁 궁시렁ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "소가 번개에 맞아 죽으면? 우사인볼트ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "꽃이 병원에 가는 이유는? 수술이 있어서ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "소가 계단을 오르면? 소오름ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "바가지가 죽으면? 해골바가지ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "소가 죽으면? 다이소ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "아몬드가 죽으면? 다이아몬드ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "하드가 죽으면? 다이 하드ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "회를 전문적으로 하는 문은? 회전문ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "바나나가 웃으면? 바나나킥ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "중2병을 다른말로하면? 중이염ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "오리가 얼면? 언덕ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "오리가 자주 이용하는 역은? 오리역ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "반성문을 영어로 하면? 글로벌ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "자동차가 놀라면? 카놀라유ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "이슬람교도들이 뚱뚱한 이유는? 무슬림이라서ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "김정은이 축구공을 살 때 하는 말은? 나 공산당ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "태양을 취재하는 사람은? 해리포터ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "수제비를 손으로 만드는 이유는? 발로 만들면 족제비가 돼서ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "스페인 사람이 카리나를 보고 하는 말은? 에스파냐ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "음악하는 사람이 카리나를 보고 하는 말은? 오카리나ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "밤에 성시경이 두명이면? 야간투시경ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "선풍기가 까불면? 깐풍기ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "물고기의 반댓말은? 불고기ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "미국에 비가 내리면? USB ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "주씨 남성이 결혼하면? 주사위ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "주씨가 회사 차장이 되면? 주차장ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "스님이 공중부양을 하면? 어중이떠중이ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "왕이 양쪽에 있으면? 우왕좌왕ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "부엉이가 물에 빠지면? 첨부엉 첨부엉ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "딸기가 직장을 잃으면? 딸기시럽ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "빵이 목장에 간 이유는? 소보로ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "형제가 싸울때 동생편만 드는 세상은? 형편 없는 세상ㅋㅋㅋㅋㅋㅋㅋㅋ",
  "아이스크림이 교통사고를 당한 이유는? 차가와서ㅋㅋㅋㅋㅋㅋㅋㅋ",
];

function sendJokes() {
  setInterval(() => {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    connectionPool.forEach((ws, id) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(joke);
      }
    });
  }, 10000); // 10 seconds interval
}

server.on("connection", (ws) => {
  if (connectionPool.size >= MAX_CONNECTIONS) {
    ws.close(1000, "Server is full");
    return;
  }

  const id = uuidv4();
  connectionPool.set(id, ws);

  console.log(`Client connected: ${id}`);
  console.log(`Current connections: ${connectionPool.size}`);

  ws.on("message", (message) => {
    console.log(`Received from ${id}:`, message);
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    connectionPool.delete(id);
    console.log(`Client disconnected: ${id}`);
    console.log(`Current connections: ${connectionPool.size}`);
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error from ${id}:`, error);
  });
});

sendJokes();

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
