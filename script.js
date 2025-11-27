const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

// Player objects
const player1 = {
    x: 100, y: 300, width: 50, height: 50,
    color: 'white', vx:0, vy:0, onGround: true
};

const player2 = {
    x: 600, y: 300, width: 50, height: 50,
    color: 'blue', vx:0, vy:0, onGround: true
};

// Keyboard state
const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if(!gameStarted && e.key === "Enter") gameStarted = true;
});
document.addEventListener("keyup", (e) => keys[e.key] = false);

function updatePlayer(player, controls) {
    // Horizontal movement
    if(keys[controls.left]) player.vx = -5;
    else if(keys[controls.right]) player.vx = 5;
    else player.vx = 0;

    player.x += player.vx;

    // Gravity + jump
    if(!player.onGround) player.vy += 0.5;
    player.y += player.vy;

    if(player.y >= 300) { player.y = 300; player.vy = 0; player.onGround = true; }

    if(keys[controls.jump] && player.onGround) { player.vy = -10; player.onGround = false; }

    // Basic attacks
    if(keys[controls.attack1]) {
        // You can draw attack animation here
    }
    if(keys[controls.attack2]) {
        // You can draw special attack animation here
    }
}

function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawStartMenu() {
    ctx.fillStyle = 'white';
    ctx.font = '30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("Press Enter to Begin", canvas.width/2, canvas.height/2);
}

function gameLoop() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(!gameStarted){
        drawStartMenu();
    } else {
        // Controls
        updatePlayer(player1, {left:"a", right:"d", jump:"w", attack1:"s", attack2:"q"});
        updatePlayer(player2, {left:"ArrowLeft", right:"ArrowRight", jump:"ArrowUp", attack1:"ArrowDown", attack2:"/"});

        // Draw players
        drawPlayer(player1);
        drawPlayer(player2);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
