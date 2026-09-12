// The Backrooms Game

const gameState = {
    level: 0,
    sanity: 100,
    roomsExplored: 0,
    currentRoom: null,
    gameOver: false,
    escaped: false,
    visitedRooms: new Set(),
    direction: 0, // 0=forward, 1=right, 2=backward, 3=left
};

const rooms = [
    {
        id: 1,
        name: "The Entrance",
        description: "You find yourself in a mundane office space with endless fluorescent lights buzzing overhead. The walls are a sickly yellow, and the smell of stale air fills your nostrils. You feel... wrong here.",
        type: "safe",
        sanityDamage: 0,
        nextRoom: () => Math.random() > 0.5 ? 2 : 3
    },
    {
        id: 2,
        name: "The Hallway",
        description: "An impossibly long hallway stretches before you. The lights flicker in a rhythmic pattern. Something feels like it's watching you from the darkness ahead. The walls seem to close in slightly.",
        type: "danger",
        sanityDamage: 10,
        nextRoom: () => Math.random() > 0.4 ? 1 : 4
    },
    {
        id: 3,
        name: "The Empty Room",
        description: "A completely empty room. The walls are bare, the floor is covered in a thin layer of dust. You can hear a faint humming sound, though you can't determine its source. Unsettling.",
        type: "safe",
        sanityDamage: 5,
        nextRoom: () => Math.random() > 0.6 ? 5 : 2
    },
    {
        id: 4,
        name: "The Creature's Lair",
        description: "You hear an inhuman shriek! A pale, elongated creature with no eyes blocks your path. Its skin is wrinkled and its movements are jerky and unnatural. You must escape NOW!",
        type: "danger",
        sanityDamage: 30,
        nextRoom: () => 1,
        special: "creature"
    },
    {
        id: 5,
        name: "The Safe Haven",
        description: "You discover a small room with warm lighting and comfortable furniture. There's a strange electronic device on the wall. This might be your way out...",
        type: "safe",
        sanityDamage: -15,
        nextRoom: () => Math.random() > 0.3 ? 2 : 3,
        special: "exit"
    }
];

function getRoom(id) {
    return rooms.find(r => r.id === id);
}

function startGame() {
    gameState.level = 0;
    gameState.sanity = 100;
    gameState.roomsExplored = 0;
    gameState.currentRoom = getRoom(1);
    gameState.gameOver = false;
    gameState.escaped = false;
    gameState.visitedRooms.clear();
    gameState.direction = 0;
    
    clearLog();
    addMessage("You've entered the Backrooms... How did you get here?", "system");
    addMessage("Use the controls to navigate through rooms. Avoid the creatures and find your escape!", "system");
    displayRoom();
    updateUI();
}

function displayRoom() {
    const room = gameState.currentRoom;
    const roomDisplay = document.getElementById('roomDisplay');
    
    let html = `<h2>${room.name}</h2>`;
    html += `<p>${room.description}</p>`;
    
    if (room.type === "danger") {
        roomDisplay.className = 'room-display danger';
    } else {
        roomDisplay.className = 'room-display safe';
    }
    
    roomDisplay.innerHTML = html;
}

function moveForward() {
    if (gameState.gameOver || gameState.escaped) return;
    
    gameState.level++;
    const nextRoomId = gameState.currentRoom.nextRoom();
    gameState.currentRoom = getRoom(nextRoomId);
    
    if (!gameState.visitedRooms.has(nextRoomId)) {
        gameState.visitedRooms.add(nextRoomId);
        gameState.roomsExplored++;
    }
    
    addMessage(`You moved forward to: ${gameState.currentRoom.name}`, "system");
    
    if (gameState.currentRoom.type === "danger") {
        addMessage(`⚠️ Danger detected! Sanity -${gameState.currentRoom.sanityDamage}`, "warning");
    }
    
    gameState.sanity -= gameState.currentRoom.sanityDamage;
    
    if (gameState.currentRoom.special === "creature") {
        addMessage("💀 CREATURE ENCOUNTER! You must escape!", "danger");
    }
    
    if (gameState.currentRoom.special === "exit") {
        if (Math.random() > 0.5) {
            escape();
        } else {
            addMessage("The exit device doesn't respond... Try again later.", "warning");
        }
    }
    
    if (gameState.sanity <= 0) {
        gameOver("Your sanity has shattered... The Backrooms win.");
    }
    
    displayRoom();
    updateUI();
}

function moveBackward() {
    if (gameState.gameOver || gameState.escaped) return;
    addMessage("You back away carefully...", "system");
    moveForward();
}

function turnLeft() {
    if (gameState.gameOver || gameState.escaped) return;
    gameState.direction = (gameState.direction + 3) % 4;
    const directions = ["forward", "right", "backward", "left"];
    addMessage(`You turn to face: ${directions[gameState.direction]}`, "system");
}

function turnRight() {
    if (gameState.gameOver || gameState.escaped) return;
    gameState.direction = (gameState.direction + 1) % 4;
    const directions = ["forward", "right", "backward", "left"];
    addMessage(`You turn to face: ${directions[gameState.direction]}`, "system");
}

function explore() {
    if (gameState.gameOver || gameState.escaped) return;
    
    const room = gameState.currentRoom;
    
    if (Math.random() > 0.5) {
        addMessage("✓ You found something useful!", "success");
        gameState.sanity = Math.min(100, gameState.sanity + 10);
    } else {
        addMessage("✗ You found nothing but danger...", "danger");
        gameState.sanity -= 15;
    }
    
    if (gameState.sanity <= 0) {
        gameOver("Your sanity has shattered... The Backrooms win.");
    }
    
    updateUI();
}

function escape() {
    gameState.escaped = true;
    gameState.gameOver = true;
    addMessage("🎉 SUCCESS! The device activates and you're transported back to reality!", "success");
    addMessage(`You survived ${gameState.level} levels and explored ${gameState.roomsExplored} rooms.`, "success");
    addMessage("You escaped the Backrooms!", "success");
    
    document.getElementById('moveForwardBtn').style.display = 'none';
    document.getElementById('moveBackwardBtn').style.display = 'none';
    document.getElementById('moveLeftBtn').style.display = 'none';
    document.getElementById('moveRightBtn').style.display = 'none';
    document.getElementById('exploreBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'block';
    
    updateUI();
}

function gameOver(message) {
    gameState.gameOver = true;
    addMessage(`☠️ GAME OVER: ${message}`, "danger");
    addMessage(`Final Level: ${gameState.level} | Rooms Explored: ${gameState.roomsExplored} | Final Sanity: ${gameState.sanity}%`, "danger");
    
    document.getElementById('moveForwardBtn').style.display = 'none';
    document.getElementById('moveBackwardBtn').style.display = 'none';
    document.getElementById('moveLeftBtn').style.display = 'none';
    document.getElementById('moveRightBtn').style.display = 'none';
    document.getElementById('exploreBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'block';
    
    updateUI();
}

function updateUI() {
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('sanityDisplay').textContent = Math.max(0, gameState.sanity);
    document.getElementById('roomsExploredDisplay').textContent = gameState.roomsExplored;
}

function addMessage(text, type = "system") {
    const messageLog = document.getElementById('messageLog');
    const message = document.createElement('div');
    message.className = `log-message ${type}`;
    message.textContent = text;
    messageLog.appendChild(message);
    messageLog.scrollTop = messageLog.scrollHeight;
}

function clearLog() {
    document.getElementById('messageLog').innerHTML = '';
}

// Event listeners
document.getElementById('moveForwardBtn').addEventListener('click', moveForward);
document.getElementById('moveBackwardBtn').addEventListener('click', moveBackward);
document.getElementById('moveLeftBtn').addEventListener('click', turnLeft);
document.getElementById('moveRightBtn').addEventListener('click', turnRight);
document.getElementById('exploreBtn').addEventListener('click', explore);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameState.gameOver && gameState.escaped) return;
    
    switch(e.key) {
        case 'ArrowUp':
            moveForward();
            break;
        case 'ArrowDown':
            moveBackward();
            break;
        case 'ArrowLeft':
            turnLeft();
            break;
        case 'ArrowRight':
            turnRight();
            break;
        case ' ':
            e.preventDefault();
            explore();
            break;
    }
});

// Start the game
startGame();