const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;

// Load images
const img_idle = new Image(); img_idle.src = "images/knight_idle.png";
const img_walk = new Image(); img_walk.src = "images/knight_walk.gif";
const img_attack = new Image(); img_attack.src = "images/knight_attack.png";
const img_special = new Image(); img_special.src = "images/knight_special.gif"; // ← updated to GIF

// Controls state
const keys = {};
document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (e.key === "Enter") gameStarted = true;
});
document.addEventListener("keyup", e => keys[e.key] = false);

class Player {
    constructor(x, tintColor, controls) {
        this.x = x;
        this.y = 360;
        this.width = 80;
        this.height = 80;

        this.vx = 0;
        this.hp = 100;

        this.state = "idle"; // idle, walk, attack, special
        this.tint = tintColor;
        this.controls = controls;

        this.attackCooldown = 0;
        this.specialCooldown = 0;
    }

    update() {
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.specialCooldown > 0) this.specialCooldown--;

        // Movement
        if (keys[this.controls.left]) this.vx = -4;
        else if (keys[this.controls.right]) this.vx = 4;
        else this.vx = 0;

        this.x += this.vx;

        // Action states
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

    getAttackHitbox() {
        return {
            x: this.x + (this.tint === "blue" ? -20 : 60),
            y: this.y + 20,
            w: 40,
            h: 30
        };
    }

    draw() {
        let img;
        if (this.state === "idle") img = img_idle;
        if (this.state === "walk") img = img_walk;
        if (this.state === "attack") img = img_attack;
        if (this.state === "special") img = img_special;

        ctx.save();
        if (this.tint === "blue") ctx.filter = "hue-rotate(180deg)";
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

const p1 = new Player(150, "none", {
    left: "a",
    right: "d",
    attack: "s",
    special: "q"
});

const p2 = new Player(650, "blue", {
    left: "ArrowLeft",
    right: "ArrowRight",
    attack: "ArrowDown",
    special: "/"
});

function rectCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.w > b.x &&
           a.y < b.y + b.height &&
           a.y + a.h > b.y;
}

function drawHP() {
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, p1.hp * 2, 20);

    ctx.fillStyle = "blue";
    ctx.fillRect(canvas.width - 20 - p2.hp * 2, 20, p2.hp * 2, 20);
}

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

    p1.update();
    p2.update();

    // Hit detection
    if (p1.state === "attack" && p1.attackCooldown > 30) {
        let hb = p1.getAttackHitbox();
        let hurt = { x: p2.x, y: p2.y, width: 80, height: 80 };

        if (rectCollide(hb, hurt)) {
            p2.hp -= 1;
            p2.x += 5;
        }
    }

    if (p2.state === "attack" && p2.attackCooldown > 30) {
        let hb = p2.getAttackHitbox();
        let hurt = { x: p1.x, y: p1.y, width: 80, height: 80 };

        if (rectCollide(hb, hurt)) {
            p1.hp -= 1;
            p1.x -= 5;
        }
    }

    p1.draw();
    p2.draw();
    drawHP();

    // KO
    if (p1.hp <= 0 || p2.hp <= 0) {
        ctx.fillStyle = "yellow";
        ctx.font = "50px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            p1.hp <= 0 ? "Player 2 Wins!" : "Player 1 Wins!",
            canvas.width / 2, 200
        );
        return;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
