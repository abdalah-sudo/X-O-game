function randomPick() {
    // Pause the game to allow Computer to pick
    isPauseGame = true

    setTimeout(() => {
        let bestMove = getBestMove();
        updateCell(cells[bestMove], bestMove);
        
        // Check if Computer won
        if (!checkWinner()) {
            changePlayer();
            // Switch back to Human player
            isPauseGame = false;
            return;
        }
        player = (player == 'X') ? 'O' : 'X';
    }, 1000); // Delay Computer move by 1 second
}

function getBestMove() {
    // Implementing a simple strategy to block the player or win
    const emptyCells = [];
    for (let i = 0; i < inputCells.length; i++) {
        if (inputCells[i] === '') {
            emptyCells.push(i);
        }
    }

    // Check for winning or blocking move
    for (let i = 0; i < emptyCells.length; i++) {
        const index = emptyCells[i];
        inputCells[index] = player;
        if (checkWinner()) {
            return index;  // Return the winning move
        }
        inputCells[index] = '';  // Revert after checking

        // Check if opponent can win and block
        const opponent = (player === 'X') ? 'O' : 'X';
        inputCells[index] = opponent;
        if (checkWinner()) {
            inputCells[index] = '';  // Revert after checking
            return index;  // Block opponent's winning move
        }
        inputCells[index] = '';  // Revert after checking
    }

    // If no winning/blocking moves, pick a random move
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
