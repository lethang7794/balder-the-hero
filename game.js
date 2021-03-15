/*
  Code modified from:
  http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
  using graphics purchased from vectorstock.com
*/

/* Initialization.
Here, we create and add our "canvas" to the page.
We also load all of our images.
*/

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = 'bold 20px sans-serif';
ctx.fillStyle = '#FFFFFF';
canvas.width = 512;
canvas.height = 512;
document.getElementById('canvas').appendChild(canvas);

/**
 * Setting up our characters.
 *
 * Note that hero.x represents the X position of our hero.
 * hero.y represents the Y position.
 * We'll need these values to know where to "draw" the hero.
 * The same goes for the monsters
 *
 */

let hero = {
  x: canvas.width / 2,
  y: canvas.height / 2,
};
let monsters = [getRandomLocation(), getRandomLocation(), getRandomLocation()];
let soldiers = [getRandomLocation(), getRandomLocation(), getRandomLocation()];

let bg = {};
let heroDied = {};

function getRandomNum(n) {
  return Math.floor(Math.random() * n);
}

function distanceBetween(a, b) {
  return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
}

function getRandomLocation() {
  let x, y;

  do {
    x = getRandomNum(canvas.width - 32);
    y = getRandomNum(canvas.height - 32);
  } while (distanceBetween({ x, y }, hero) < 64);

  return { x, y };
}

function initMonstersDirection(monster) {
  monsters[0].dx = 5;
  monsters[0].dy = 5;
  monsters[0].dx_direction = 1;
  monsters[0].dy_direction = 1;
  monsters[1].dx = 5;
  monsters[1].dy = 5;
  monsters[1].dx_direction = 1;
  monsters[1].dy_direction = -1;
  monsters[2].dx = 5;
  monsters[2].dy = 5;
  monsters[2].dx_direction = -1;
  monsters[2].dy_direction = 1;
}

initMonstersDirection();

let loadedImages = 0;

function renderAfterAllImagesLoaded() {
  if (loadedImages === 9) {
    render();
  }
}

function loadImages() {
  bg.image = new Image();
  bg.image.onload = function () {
    loadedImages++;
    renderAfterAllImagesLoaded();
  };
  bg.image.src = 'images/background.png';

  hero.image = new Image();
  hero.image.onload = function () {
    loadedImages++;
    renderAfterAllImagesLoaded();
  };
  hero.image.src = 'images/hero.png';

  heroDied.image = new Image();
  heroDied.image.onload = function () {
    loadedImages++;
    renderAfterAllImagesLoaded();
  };
  heroDied.image.src = 'images/hero_died.png';

  monsters.forEach((monster, i) => {
    monster.image = new Image();
    monster.image.onload = function () {
      loadedImages++;
      renderAfterAllImagesLoaded();
    };
    monster.image.src = `images/monster_${i + 1}.png`;
  });

  soldiers.forEach((soldier, i) => {
    soldier.image = new Image();
    soldier.image.onload = function () {
      loadedImages++;
      renderAfterAllImagesLoaded();
    };
    soldier.image.src = `images/soldier_${i + 1}.png`;
  });
}

/**
 * Keyboard Listeners
 * You can safely ignore this part, for now.
 *
 * This is just to let JavaScript know when the user has pressed a key.
 */
let keysPressed = {};
function setupKeyboardListeners() {
  // Check for keys pressed where key represents the keycode captured
  // For now, do not worry too much about what's happening here.
  document.addEventListener(
    'keydown',
    function (e) {
      keysPressed[e.key] = true;
    },
    false
  );

  document.addEventListener(
    'keyup',
    function (e) {
      keysPressed[e.key] = false;
    },
    false
  );
}

/**
 *  Update game objects - change player position based on key pressed
 *  and check to see if the monster has been caught
 *
 *  If you change the value of 5, the player will move at a different rate.
 */

let livesRemain = 3;
let soldiersSaved = 0;
let startTime;
let elapsedTime = 0;
let startWaitingTime;
let elapsedWaingTime = 0;
let startImmortalTime;
let elapsedImmortalTime = 0;

function checkPosition(object, type) {
  if (object.x <= 0) {
    object.x = 0;
  }
  if (object.x >= canvas.width - 32) {
    object.x = canvas.width - 32;
  }

  if (object.y <= 0) {
    object.y = 0;
  }
  if (object.y >= canvas.height - 32) {
    object.y = canvas.height - 32;
  }
}

function getRandomDirection(object, speed = 5) {
  object.dx = getRandomNum(speed + 1);
  object.dy = (speed ** 2 - object.dx ** 2) ** 0.5;

  if (object.x <= 0) {
    object.dx_direction *= -1;
  }
  if (object.x >= canvas.width - 32) {
    object.dx_direction *= -1;
  }

  if (object.y <= 0) {
    object.dy_direction *= -1;
  }
  if (object.y >= canvas.height - 32) {
    object.dy_direction *= -1;
  }
}
// var isLevelFinished = false;
var isLevelWon = false;
var needShowHUD = false;
var message;

var level = 1;
var levelMap = [];
function generateNextLevel(level) {
  // Get random soldier
  for (let i = 0; i < level; i++) {
    let randomSoldierIndex = getRandomNum(3);
    let randomSoldier = soldiers[randomSoldierIndex];
    levelMap.push({ ...randomSoldier });
  }

  // Set new random location for each soldier
  levelMap.forEach((soldier) => {
    ({ x: soldier.x, y: soldier.y } = getRandomLocation());
  });
}

var heroIsDead = false;

function updateHero() {
  hero.x_before = hero.x;
  hero.y_before = hero.y;

  if (keysPressed['ArrowUp']) {
    hero.y -= 5;
  }
  if (keysPressed['ArrowDown']) {
    hero.y += 5;
  }
  if (keysPressed['ArrowLeft']) {
    hero.x -= 5;
  }
  if (keysPressed['ArrowRight']) {
    hero.x += 5;
  }

  // Prevent the hero move off the screen.
  // TODO: Recheck limit value
  checkPosition(hero, 'hero');
}

function updateMonsters() {
  // Check if player and monster collided. Our images
  // are 32 pixels big.
  monsters.forEach((monster) => {
    monster.x += monster.dx * monster.dx_direction;
    monster.y += monster.dy * monster.dy_direction;

    checkPosition(monster, 'monster');
    getRandomDirection(monster);

    if (isInCollision(hero, monster) && !heroIsImmortal) {
      livesRemain--;

      if (livesRemain <= 0) {
        needUpdateState = false; // In main() - to update and render.
        // isLevelFinished = true; // In render() - prevent render new frame after level is finised.
        isLevelWon = false; // To show coresponding HUD and generate new level map ???
        needShowHUD = true;
        message = 'You lose!';

        renderNewInfo();

        nextLevelButton.style.display = 'none';
        restartButton.style.display = 'inline-block';
        restartButton.focus();
      } else {
        // Pick a new location for the monster.
        heroIsDead = true;

        isWaiting = true;
        startWaitingTime = Date.now();
      }
    }
  });
}

var startButton = document.getElementById('start-button');
startButton.focus();
var nextLevelButton = document.getElementById('next-level-button');
var restartButton = document.getElementById('restart-button');

var needUpdateMonsters = true;
function updateSoldiers() {
  // Check player and soldier collided
  levelMap.forEach((soldier) => {
    if (isInCollision(hero, soldier) && !soldier.isSaved) {
      soldier.isSaved = true;
      soldiersSaved++;

      if (soldiersSaved === level) {
        needUpdateState = false;
        // isLevelFinished = true;
        isLevelWon = true;
        needShowHUD = true;
        message = 'Next level!';

        nextLevelButton.style.display = 'inline-block';
        nextLevelButton.focus();
      }
    }
  });

  if (isLevelWon) {
    renderNewInfo();
    level += 1;
    generateNextLevel(level);

    // Reset
    isLevelWon = false;
    resetKeyboardState();

    needUpdateMonsters = false;
    hero.x = hero.x_before;
    hero.y = hero.y_before;
  }
}

var needUpdateHero = true;
var heroIsImmortal = false;
var remainImmortalTime;

function update() {
  // Update the time.
  elapsedTime = Math.floor((Date.now() - startTime) / 1000);

  if (isWaiting) {
    elapsedWaingTime = Math.floor((Date.now() - startWaitingTime) / 1000);
    remainWaitingTime = 3 - elapsedWaingTime;
    needUpdateHero = false;
    if (remainWaitingTime < 0) {
      isWaiting = false;
      if (heroIsDead) {
        heroIsImmortal = true;
        startImmortalTime = Date.now();
      }
    }
  } else if (heroIsImmortal) {
    elapsedImmortalTime = Math.floor((Date.now() - startImmortalTime) / 1000);
    remainImmortalTime = 1.5 - elapsedImmortalTime;
    if (remainImmortalTime < 0) {
      heroIsImmortal = false;
      heroIsDead = false;
    }
    updateHero();
    updateMonsters();
  } else {
    needUpdateHero ? updateHero() : (needUpdateHero = true);
    updateSoldiers();
    needUpdateMonsters ? updateMonsters() : (needUpdateMonsters = true);
  }
}

function isInCollision(object_a, object_b) {
  if (
    object_a.x <= object_b.x + 20 &&
    object_a.x + 20 >= object_b.x &&
    object_a.y <= object_b.y + 32 &&
    object_a.y + 32 >= object_b.y
  ) {
    return true;
  }
  return false;
}

function resetKeyboardState() {
  for (let key in keysPressed) {
    keysPressed[key] = false;
  }
}

function resetHero() {
  hero.x = canvas.width / 2;
  hero.y = canvas.height / 2;
}

function reset() {
  livesRemain = 3;
  elapsedTime = 0;
  soldiersSaved = 0;
  level = 1;
  levelMap = [];
  generateNextLevel(level);
  resetHero();
}

function renderBackground() {
  ctx.drawImage(bg.image, 0, 0);
}

function renderCharacters() {
  if (!heroIsDead) {
    ctx.drawImage(hero.image, hero.x, hero.y);
  } else {
    ctx.drawImage(heroDied.image, hero.x, hero.y);
  }

  monsters.forEach((monster) => {
    ctx.drawImage(monster.image, monster.x, monster.y);
  });

  levelMap.forEach((soldier) => {
    if (!soldier.isSaved) {
      ctx.drawImage(soldier.image, soldier.x, soldier.y);
    }
  });
}

function renderInfo() {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  // ctx.fillText(`Time: ${elapsedTime}s`, 20, 100);
  ctx.fillText(`${livesRemain} ❤`, 450, 40);
  ctx.fillText(`Level: ${level}`, 20, 40);
  // ctx.fillText(`Soldiers Saved: ${soldiersSaved}`, 20, 80);

  if (isWaiting) {
    ctx.font = '50px sans-serif';
    if (heroIsDead) {
      ctx.fillText(`You're dead.`, 100, 200);
      ctx.fillText(`Respawn in ${remainWaitingTime}s`, 80, 320);
    } else {
      ctx.fillText(`Ready?`, 190, 200);
      ctx.fillText(`${remainWaitingTime}s`, 230, 320);
    }

    ctx.font = '20px sans-serif';
  }
  if (heroIsImmortal) {
    ctx.font = '50px sans-serif';
    ctx.fillText(`Reborning`, 150, 200);
    ctx.fillText(`${remainImmortalTime}s`, 230, 320);
    ctx.font = '20px sans-serif';
  }
}

function renderNewInfo() {
  renderBackground();
  renderCharacters();
  renderInfo();
}

/**
 * This function, render, runs as often as possible.
 */
function render() {
  renderBackground();
  renderCharacters();
  renderInfo();

  if (needShowHUD) {
    renderNewInfo();
    alert(message);
    needShowHUD = false;
    message = null;
  }
}

/**
 * The main game loop. Most every game will have two distinct parts:
 * update (updates the state of the game, in this case our hero and monster)
 * render (based on the state of our game, draw the right things)
 */

var needUpdateState = false;
function main() {
  if (needUpdateState) {
    update();
  }

  render();

  // Request to do this again ASAP. This is a special method
  // for web browsers.
  requestAnimationFrame(main);
}

// Cross-browser support for requestAnimationFrame.
// Safely ignore this line. It's mostly here for people with old web browsers.
var w = window;
requestAnimationFrame =
  w.requestAnimationFrame ||
  w.webkitRequestAnimationFrame ||
  w.msRequestAnimationFrame ||
  w.mozRequestAnimationFrame;

// Let's play this game!
loadImages();

generateNextLevel(level);
setupKeyboardListeners();
main();

function startGame() {
  startTime = Date.now();
  needUpdateState = true;
  // isLevelFinished = false;

  isWaiting = true;
  startWaitingTime = Date.now();

  startButton.style.display = 'none';
}

function restartGame() {
  reset();
  startGame();
}

var isWaiting = false;
function playNextLevel() {
  // Reset other state
  // isLevelFinished = false;
  isLevelWon = false;
  needShowHUD = false;
  soldiersSaved = 0;

  // Continue main()
  needUpdateState = true;
  isWaiting = true;

  //
  isWaiting = true;
  startWaitingTime = Date.now();

  nextLevelButton.blur();
}
