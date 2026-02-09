<template>
  <div class="breakout-game">
    <div v-if="!gameStarted && !gameOver" class="start-screen">
      <div class="icon">🧱</div>
      <h2>打砖块</h2>
      <button @click="startGame">开始游戏</button>
      <p class="hint">鼠标移动控制挡板</p>
    </div>
    
    <div v-show="gameStarted || gameOver" class="canvas-container">
       <div class="header">
         <span>分数: {{ score }}</span>
         <span>生命: {{ lives }}</span>
       </div>
      <canvas ref="canvas" width="480" height="320" @mousemove="mouseMoveHandler"></canvas>
      <div v-if="gameOver" class="overlay">
        <h3>{{ won ? "胜利!" : "游戏结束" }}</h3>
        <p>最终得分: {{ score }}</p>
        <button @click="startGame">重试</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useLeaderboard } from "@/composables/useLeaderboard";

const { saveScore } = useLeaderboard();

const canvas = ref(null);
const gameStarted = ref(false);
const gameOver = ref(false);
const won = ref(false);
const score = ref(0);
const lives = ref(3);

let ctx = null;
let animId = null;

// Game props
const ball = { x: 0, y: 0, dx: 0, dy: 0, radius: 5, speed: 4 };
const paddle = { height: 10, width: 75, x: 0 };
let bricks = [];
const brickRowCount = 5;
const brickColumnCount = 6;
const brickWidth = 65; 
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;

const initGame = () => {
    if (!canvas.value) return;
    ctx = canvas.value.getContext('2d');
    
    // Reset Ball
    ball.x = canvas.value.width / 2;
    ball.y = canvas.value.height - 30;
    ball.dx = 4;
    ball.dy = -4;
    
    // Reset Paddle
    paddle.x = (canvas.value.width - paddle.width) / 2;
    
    // Reset Bricks
    bricks = [];
    for(let c=0; c<brickColumnCount; c++) {
        bricks[c] = [];
        for(let r=0; r<brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
    
    score.value = 0;
    lives.value = 3;
    won.value = false;
    gameOver.value = false;
};

const drawBall = () => {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
};

const drawPaddle = () => {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.value.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.closePath();
};

const drawBricks = () => {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                const brickX = (c*(brickWidth+brickPadding)) + brickOffsetLeft;
                const brickY = (r*(20+brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, 20);
                const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
                ctx.fillStyle = colors[r] || "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
};

const collisionDetection = () => {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                if(ball.x > b.x && ball.x < b.x+brickWidth && ball.y > b.y && ball.y < b.y+20) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score.value++;
                    if(score.value === brickRowCount*brickColumnCount) {
                        won.value = true;
                        gameOver.value = true;
                        cancelAnimationFrame(animId);
                        saveScore('breakout', score.value);
                    }
                }
            }
        }
    }
};

const draw = () => {
    if(!ctx) return;
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    // Wall collision
    if(ball.x + ball.dx > canvas.value.width-ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    // Top collision
    if(ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if(ball.y + ball.dy > canvas.value.height-ball.radius) {
        // Paddle collision
        if(ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
             let hitPoint = ball.x - (paddle.x + paddle.width/2);
             hitPoint = hitPoint / (paddle.width/2);
             ball.dx = hitPoint * 5; 
             ball.dy = -ball.dy;
        }
        else {
            lives.value--;
            if(!lives.value) {
                gameOver.value = true;
                cancelAnimationFrame(animId);
                saveScore('breakout', score.value);
            } else {
                ball.x = canvas.value.width/2;
                ball.y = canvas.value.height-30;
                ball.dx = 4;
                ball.dy = -4;
                paddle.x = (canvas.value.width-paddle.width)/2;
            }
        }
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    if(!gameOver.value) {
        animId = requestAnimationFrame(draw);
    }
};

const mouseMoveHandler = (e) => {
    if (!canvas.value) return;
    const relativeX = e.clientX - canvas.value.getBoundingClientRect().left;
    if(relativeX > 0 && relativeX < canvas.value.width) {
        paddle.x = relativeX - paddle.width/2;
    }
};

const startGame = () => {
    initGame();
    gameStarted.value = true;
    draw();
};

onUnmounted(() => {
    cancelAnimationFrame(animId);
});
</script>

<style lang="scss" scoped>
.breakout-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;

  button {
    padding: 10px 30px;
    font-size: 1.2rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    margin-top: 20px;
    &:hover { background: #2563eb; }
  }

  .start-screen {
    text-align: center;
    .icon { font-size: 4rem; margin-bottom: 10px; }
    .hint { margin-top: 20px; opacity: 0.8; }
  }
  
  .canvas-container {
      position: relative;
      background: rgba(0,0,0,0.5);
      border-radius: 4px;
      overflow: hidden;
      
      .header {
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          font-size: 1.2rem;
          pointer-events: none;
      }
      
      canvas {
          background: #111;
          display: block;
          cursor: none; // Hide cursor over canvas
      }
      
      .overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.8);
          h3 { font-size: 2rem; color: #f87171; margin-bottom: 10px;}
      }
  }
}
</style>
