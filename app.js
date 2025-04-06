// Functions
function loadTexture(path) {
  return new Promise((resolve) => {
    const img = new Image(); // Initialize the image object
    img.src = path; // Set the source of the image to the path provided
    img.onload = () => {
      resolve(img);// Load the image
    }
  })
}

function createEnemies(ctx, canvas, enemyImg) {
  const MONSTER_TOTAL = 5; // Number of enemies
  const MONSTER_WIDTH = MONSTER_TOTAL * 98; // Width of enemies
  const START_X = (canvas.width - MONSTER_WIDTH) / 2; // Starting point for enemies
  const STOP_X = START_X + MONSTER_WIDTH; // Starting point for enemies

  for (let x = START_X; x < STOP_X; x += 98) { // Loop through the x-axis
    for (let y = 0; y < 50 * 5; y += 50) {// Loop through the y-axis
      const enemy = new Enemy(x, y); // Create a new enemy object
      enemy.img = enemyImg; // Set the image of the enemy
      enemyObjects.push(enemy); // Add the enemy to the array of enemies
    }
  }
}

function initGame() { // Initialize the game
  gameObjects = []; // Initialize the game objects array
  createEnemies(); // Create the enemies
  createHero(); // Create the hero object
   
  eventEmitter.on(Messages.KEY_EVENT_UP, () => { // Move the hero up
    hero.y -=5 ;
  });
   
  eventEmitter.on(Messages.KEY_EVENT_DOWN, () => { // Move the hero down
    hero.y += 5;
  });
   
  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => { // Move the hero left
    hero.x -= 5;
  });
   
  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => { // Move the hero right
    hero.x += 5;
  });

  eventEmitter.on(Messages.KEY_EVENT_SPACE, () => {
    if (hero.canFire()) {
      hero.fire();
    }
  });

  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
  });
}

function createHero() { // Create the hero
  hero = new Hero( // Create a new hero object
    canvas.width / 2 - 45, // Set the x position of the hero
    canvas.height - canvas.height / 4 // Set the y position of the hero
  );
  hero.img = heroImg; // Set the image of the hero
  gameObjects.push(hero); // Add the hero to the array of game objects
}

function drawGameObjects(ctx) {
  gameObjects.forEach(go => go.draw(ctx)); // Draw the game objects
}

function rectFromGameObject() { // Get the rectangle from the game object
  return {
    top: this.y, // Set the top position of the rectangle
    left: this.x, // Set the left position of the rectangle
    bottom: this.y + this.height, // Set the bottom position of the rectangle
    right: this.x + this.width // Set the right position of the rectangle
  }
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

function updateGameObjects() {
  const enemies = gameObjects.filter(go => go.type === 'Enemy');
  const lasers = gameObjects.filter((go) => go.type === "Laser");
  enemies.forEach(enemy => { // Check for collision between enemy and laser
    const heroRect = hero.rectFromGameObject();
    if (intersectRect(heroRect, enemy.rectFromGameObject())) {
      eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
    }
  })
  gameObjects = gameObjects.filter(go => !go.dead);
  eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
    first.dead = true;
    second.dead = true;
    hero.incrementPoints();
  })
 
  eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
    enemy.dead = true;
    hero.decrementLife();
  });
}  

function drawLife() {
  // TODO, 35, 27
  const START_POS = canvas.width - 180;
  for(let i=0; i < hero.life; i++ ) {
    ctx.drawImage(
      lifeImg, 
      START_POS + (45 * (i+1) ), 
      canvas.height - 37);
  }
}

function drawPoints() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "left";
  drawText("Points: " + hero.points, 10, canvas.height-20);
}

function drawText(message, x, y) {
  ctx.fillText(message, x, y);
}

// Event Listeners
window.onload = async() => { // Load Window
  // Load the canvas and context
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  const heroImg = await loadTexture('assets/player.png')
  const enemyImg = await loadTexture('assets/enemyShip.png')


  // Set the image in canvas to a black background
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0, canvas.width, canvas.height);
  ctx.drawImage(heroImg, canvas.width/2 - 45, canvas.height - (canvas.height /4));
  createEnemies(ctx, canvas, enemyImg);
};

window.addEventListener("keyup", (evt) => {
  if (evt.key === "ArrowUp") { // Check if the key pressed is ArrowUp
    eventEmitter.emit(Messages.KEY_EVENT_UP); // Emit the KEY_EVENT_UP event
  }
  else if (evt.key === "ArrowDown") { // Check if the key pressed is ArrowDown
    eventEmitter.emit(Messages.KEY_EVENT_DOWN); // Emit the KEY_EVENT_DOWN event
  }
  else if (evt.key === "ArrowLeft") { // Check if the key pressed is ArrowLeft
    eventEmitter.emit(Messages.KEY_EVENT_LEFT); // Emit the KEY_EVENT_LEFT event
  }
  else if (evt.key === "ArrowRight") { // Check if the key pressed is ArrowRight
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT); // Emit the KEY_EVENT_RIGHT event
  }
  else if(evt.keyCode === 32) {
    eventEmitter.emit(Messages.KEY_EVENT_SPACE);
  }
});

window.onload = async () => { // Load the window
  // Load the canvas and context
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  heroImg = await loadTexture("assets/player.png");
  enemyImg = await loadTexture("assets/enemyShip.png");
  laserImg = await loadTexture("assets/laserRed.png");

  initGame(); // Initialize the game
  let gameLoopId = setInterval(() => { // Start the game loop
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGameObjects(ctx);
    drawPoints();
    drawLife();
  }, 100)
 
};

// Variable definitions
let id = setInterval(() => {
  //move the enemy on the y axis
  enemy.y += 10;
})

let gameLoopId = setInterval(() =>
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.fillStyle = "black"; // Set the fill color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with black
    drawHero(); // Draw the hero
    drawEnemies(); // Draw the enemies
    drawStaticObjects(); // Draw the static objects
}, 200);

let onKeyDown = function (e) { // Keydown event listener
  console.log(e.keyCode); // Log the key code
  let onKeyDown = function (e) {
    console.log(e.keyCode);
    switch (e.keyCode) { //Switch case for the key codes
      case 37:
      case 39:
      case 38:
      case 40: // Arrow keys
      case 32:
        e.preventDefault();
        break; // Space
      default:
        break; // do not block other keys
    }
  };
 
  window.addEventListener('keydown', onKeyDown);
};

const Messages = {
  KEY_EVENT_UP: "KEY_EVENT_UP", // Key event up
  KEY_EVENT_DOWN: "KEY_EVENT_DOWN", // Key event down
  KEY_EVENT_LEFT: "KEY_EVENT_LEFT", // Key event left
  KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT", // Key event right
  KEY_EVENT_SPACE: "KEY_EVENT_SPACE", // Key event space
  COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER", // Collision between enemy and laser
  COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO", // Collision between enemy and hero
};

let heroImg, enemyImg, laserImg,canvas, ctx, gameObjects = [], hero, eventEmitter = new EventEmitter(); // Array to hold enemy objects

enemy.dead = true; // collision happened

// Classes
class GameObject {
  constructor(x, y) { // Constructor for the game object
    this.x = x; // Set the x coordinate of the hero
    this.y = y; // Set the y coordinate of the hero
    this.dead = false; // Set the dead property to false
    this.type = ""; // Set the type of the game object
    this.width = 0; // Set the width of the game object
    this.height = 0; // Set the height of the game object
    this.img = undefined; // Set the image of the game object to undefined
  }


  draw(ctx) {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height); // Draw the game object
  }
}

class Hero extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.width = 98;
    this.height = 50;
    this.type = "Enemy";
    this.cooldown = 0;
    this.life = 3;
    this.points = 0;
    this.dead = false; // Added missing property

    // Movement interval
    let moveInterval = setInterval(() => {
      if (this.y < canvas.height - this.height) {
        this.y += 5;
      } else {
        console.log('Stopped at', this.y);
        clearInterval(moveInterval);
      }
    }, 300);
  }

  // Fire method
  fire() {
    gameObjects.push(new Laser(this.x + 45, this.y - 10));
    this.cooldown = 500;
    
    let cooldownInterval = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown -= 100;
      } else {
        clearInterval(cooldownInterval);
      }
    }, 200);
  }

  canFire() {
    return this.cooldown === 0;
  }

  decrementLife() {
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }
}


class Enemy extends GameObject { // Enemy class for GameObject
  constructor(x, y) { // Constructor for the enemy class
    super(x, y); // Call the parent constructor
    (this.width = 98), (this.height = 50); // Set the width and height of the enemy
    this.type = "Enemy"; // Set the type of the enemy
    let id = setInterval(() => { // Move the enemy down
      if (this.y < canvas.height - this.height) { // Check if the enemy is within the canvas height
        this.y += 5; // Move the enemy down
      } else { // If the enemy is out of bounds
        console.log('Stopped at', this.y) // Log the position of the enemy
        clearInterval(id); // Stop the interval
      }
    }, 300) // Set the interval to move the enemy down every 300ms
  }
}

class EventEmitter { // Event emitter class for handling events
  constructor() { // Constructor for the event emitter class
    this.listeners = {}; // Initialize the listeners object
  }

  on(message, listener) { // Add an event listener
    if (!this.listeners[message]) { // Check if the message already has listeners
      this.listeners[message] = []; // If not, create an empty array for the message
    }
    this.listeners[message].push(listener); // Add the listener to the array of listeners for the message
  }

  emit(message, payload = null) { // Emit an event
    if (this.listeners[message]) { // Check if the message has listeners
      this.listeners[message].forEach((l) => l(message, payload)); // Call each listener with the message and payload
    }
  }
}

class Cooldown {
  constructor(time) {
    this.cool = false;
    setTimeout(() => {
      this.cool = true;
    }, time)
  }
}

class Weapon {
  constructor {

  }
  fire() {
    if (!this.cooldown || this.cooldown.cool) {
      this.cooldown = new Cooldown(500); // produce a laser
    } else {
      // do nothing - it hasn't cooled down yet.
    }
  }
}

class Laser extends GameObject {
  constructor(x, y) {
    super(x,y);
    (this.width = 9), (this.height = 33);
    this.type = 'Laser';
    this.img = laserImg;
    let id = setInterval(() => {
      if (this.y > 0) {
        this.y -= 15;
      } else {
        this.dead = true;
        clearInterval(id);
      }
    }, 100)
  }
}







