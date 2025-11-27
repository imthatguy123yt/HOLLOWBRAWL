const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

// Load images (all in same folder)
const img_idle = new Image(); img_idle.src = "knight_idle.png";
const img_walk = new Image(); img_walk.src = "knight_walk.gif";
const img_attack = new Image(); img_attack.src = "knight_attack.png";
const img_special = new Image(); img_special.src = "knight_special.gif";

// Keyboard state
const keys = {};
document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (!gameStarted && e.key === "Enter") gameStarted = true;
});
document.addEventListener("keyup", e => keys[e.key] = false);

class Player {
    constructor(x, color, controls) {
        this.x = x;
        this.y = 360;
        this.width = 80;
        this.height = 80;
        this.vx = 0;
        this.hp = 100;
        this.state = "idle"; // idle, walk, attack, special
        this.color = color;
        this.controls = controls;
        this.attackCooldown = 0;
        this.specialCooldown = 0;
    }

    update() {
        // Cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;

        // Movement
        if (keys[this.controls.left]) this.vx = -4;
        else if (keys[this.controls.right]) this.vx = 4;
        else this.vx = 0;
        this.x += this.vx;

        // State logic
        if (keys[this.controls.attack] && this.attackCooldown === 0) {
            this.state = "attack";
            this.attackCooldown = 40;
        }
        else if (keys[this.controls.special] && this.specialCooldown === 0) {
            this.state = "special";
            this.specialCooldown = 90;
        }
        else if (this.vx !== 0) {
            this.state = "walk";
        } else {
            this.state = "idle";
        }
    }

    getHitbox() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    getAttackHitbox() {
        const offset = this.color === "blue" ? -20 : 60;
        return { x: this.x + offset, y: this.y + 20, width: 40, height: 30 };
    }

    draw() {
        let img;
        switch(this.state){
            case "idle": img = img_idle; break;
            case "walk": img = img_walk; break;
            case "attack": img = img_attack; break;
            case "special": img = img_special; break;
        }

        ctx.save();
        if (this.color === "blue") ctx.filter = "hue-rotate(180deg)";
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

// Create players
const player1 = new Player(150, "white", { left: "a", right: "d", attack: "s", special: "q" });
const player2 = new Player(650, "blue", { left: "ArrowLeft", right: "ArrowRight", attack: "ArrowDown", special: "/" });

// Collision detection
function rectCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Draw HP bars
function drawHP() {
    // Player 1
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, player1.hp * 2, 20);
    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 20, 200, 20);

    // Player 2
    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width - 20 - player2.hp * 2, 20, player2.hp * 2, 20);
    ctx.strokeStyle = "white";
    ctx.strokeRect(canvas.width - 220, 20, 200, 20);
}

// Start menu
function drawStartMenu() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Press Enter to Begin", canvas.width / 2, canvas.height / 2);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        drawStartMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    // Update players
    player1.update();
    player2.update();

    // Attack hitboxes
    [player1, player2].forEach(attacker => {
        const defender = attacker === player1 ? player2 : player1;
        const hb = attacker.getAttackHitbox();
        if ((attacker.state === "attack" && attacker.attackCooldown > 30) ||
            (attacker.state === "special" && attacker.specialCooldown > 60)) {
            if (rectCollide(hb, defender.getHitbox())) {
                defender.hp -= attacker.state === "attack" ? 1 : 2;
                defender.x += attacker.color === "white" ? 5 : -5; // knockback
                if (defender.hp < 0) defender.hp = 0;
            }
        }
    });

    // Draw players
    player1.draw();
    player2.draw();

    // Draw HP bars
    drawHP();

    // Win condition
    if (player1.hp <= 0 || player2.hp <= 0) {
        ctx.fillStyle = "yellow";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            player1.hp <= 0 ? "Player 2 Wins!" : "Player 1 Wins!",
            canvas.width / 2, 250
        );
        return;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
