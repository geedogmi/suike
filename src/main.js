import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE, FRUITS_HLW } from "/src/fruits";
import "/src/dark.css";

let THEME = "base"; // { base, halloween }
let FRUITS = FRUITS_BASE;

if (!window.location.pathname.startsWith('/suike/sub')) {
}

switch (THEME) {
  case "halloween":
    FRUITS = FRUITS_HLW;
    break;
  default:
    FRUITS = FRUITS_BASE;
}

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 1280,
    height: 1080,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 540, 50, 1080, {
  isStatic: true,
  render: { fillStyle: "#91c5f2" }
});

const rightWall = Bodies.rectangle(1280, 540, 75, 1080, {
  isStatic: true,
  render: { fillStyle: "#91c5f2" }
});

const ground = Bodies.rectangle(310, 1080, 2000, 80, {
  isStatic: true,
  render: { fillStyle: "#91c5f2" }
});

const topLine = Bodies.rectangle(310, 100, 2000, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#91c5f2" }
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let lastFruitPosition = { x: 640, y: 50 }; // 초기 위치
let score = 0;

function updateScore(increment) {
    score += increment;
    document.getElementById('score').innerText = `점수: ${score}`;
}

async function submitScore(score) {
  try {
      const response = await fetch('/submit-score', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score })
      });
      const data = await response.json();
      console.log(data.message);
  } catch (err) {
      console.error('Error submitting score:', err);
  }
}

async function showRankings() {
  try {
      const response = await fetch('/rankings');
      const rankings = await response.json();
      const rankingList = document.getElementById('score2').querySelector('ol');
      rankingList.innerHTML = '';

      rankings.forEach(ranking => {
          const listItem = document.createElement('li');
          listItem.textContent = `[${ranking.score}]`;
          rankingList.appendChild(listItem);
      });
  } catch (err) {
      console.error('Error fetching rankings:', err);
  }
}

function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(lastFruitPosition.x, lastFruitPosition.y, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.8,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.code) {
    case "ArrowLeft":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 40)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "ArrowRight":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 1240)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "Space":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        lastFruitPosition = { x: currentBody.position.x, y: 50 }; // 마지막 위치 업데이트
        addFruit();
        disableAction = false;
      }, 500);
      break;
  }
};

window.onkeyup = (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
      break;
  }
};


Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
      if (collision.bodyA.index === collision.bodyB.index) {
          const index = collision.bodyA.index;

          if (index === FRUITS.length - 1) {
              return;
          }

          // 충돌 시 점수 증가
          updateScore(10);  // 예를 들어, 과일이 매치될 때마다 10점 증가

          World.remove(world, [collision.bodyA, collision.bodyB]);

          const newFruit = FRUITS[index + 1];

          const newBody = Bodies.circle(
              collision.collision.supports[0].x,
              collision.collision.supports[0].y,
              newFruit.radius,
              {
                  render: {
                      sprite: { texture: `${newFruit.name}.png` }
                  },
                  index: index + 1,
              }
          );

          World.add(world, newBody);
      }


    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      alert("Game over");
      submitScore(score).then(() => {
        location.reload();
      });
    }
  });
});


document.addEventListener('DOMContentLoaded', showRankings);
addFruit();