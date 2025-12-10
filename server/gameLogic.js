import playersData from './data/players.js';

const shuffleDeck = (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

const distributeCards = (deck, playerCount) => {
    const hands = Array.from({ length: playerCount }, () => []);
    deck.forEach((card, index) => {
        hands[index % playerCount].push(card);
    });
    return hands;
};

export const playTurn = (activeCards, attribute) => {
    let highestValue = -1;
    let winnerIndex = null;
    let tiedIndices = [];

    activeCards.forEach(({ playerIndex, card }) => {
        const value = card.stats[attribute];

        if (value > highestValue) {
            highestValue = value;
            winnerIndex = playerIndex;
            tiedIndices = [playerIndex];
        } else if (value === highestValue) {
            tiedIndices.push(playerIndex);
            winnerIndex = null;
        }
    });

    if (tiedIndices.length === 1) {
        return { winnerIndex: tiedIndices[0], tiedIndices: [], winningValue: highestValue };
    } else {
        return { winnerIndex: null, tiedIndices, winningValue: highestValue };
    }
};

export const initializeGame = (playerCount, playerNames = []) => {
    const deck = shuffleDeck(playersData);
    const hands = distributeCards(deck, playerCount);
    return {
        hands,
        activePlayerIndex: 0,
        pot: [],
        tiedPlayers: [],
        scores: new Array(playerCount).fill(0),
        winningStreak: new Array(playerCount).fill(0),
        droppedPlayers: new Array(playerCount).fill(false), // [true, false, ...]
        playerNames: playerNames, // Store names
        round: 1,
        gameState: 'PLAYING',
        revealed: false,
        feedback: 'Game Started!',
        powerModePlayer: null,
        diceValue: 1,
        diceResult: null,
        transferState: { active: false, from: null, to: null, count: 0 },
        spyState: { active: false, makerIndex: null, cardId: null, holderIndex: null },
        shopEffects: { powerMode: false } // Temporary flags
    };
};

export const checkElimination = (game) => {
    game.hands.forEach((hand, idx) => {
        if (!game.droppedPlayers[idx] && hand.length === 0) {
            game.droppedPlayers[idx] = true;
            game.feedback = `${game.playerNames[idx] || `Player ${idx + 1}`} has been ELIMINATED!`;
        }
    });
};

export const checkWinCondition = (game, totalCards = 80) => {
    for (let i = 0; i < game.hands.length; i++) {
        if (game.hands[i].length === totalCards) {
            game.gameState = 'FINISHED';
            game.winnerIndex = i;
            game.feedback = `${game.playerNames[i] || `Player ${i + 1}`} WINS THE TOURNAMENT! 🏆`;
            return true;
        }
    }
    return false;
};

export const applyShopEffect = (game, playerIndex, item) => {
    if (item === 'spy') {
        // Activate spy mode regardless of card count
        activateSpyMode(game, playerIndex);
        game.feedback = `${game.playerNames[playerIndex] || `Player ${playerIndex + 1}`} bought Spy Mode!`;
    } else if (item === 'power') {
        // Instant Power Mode
        game.winningStreak[playerIndex] = 3;
        game.powerModePlayer = playerIndex;
        game.stealState = { active: true, stealer: playerIndex, count: 2 };
        game.feedback = `${game.playerNames[playerIndex]} bought Power Mode! Select cards to steal!`;
        game.shopEffects.powerMode = true;
    }
    return game;
};

export const getRoundSummary = (game) => {
    return game.hands.map((h, i) => ({
        name: game.playerNames[i] || `Player ${i + 1}`,
        cards: h.length,
        wins: game.scores[i],
        eliminated: game.droppedPlayers[i]
    }));
};

const updateSpyHolder = (game) => {
    if (!game.spyState.active || !game.spyState.cardId) return;

    // Find who holds the spy card
    let holder = null;
    game.hands.forEach((hand, idx) => {
        if (hand.some(c => c.id === game.spyState.cardId)) {
            holder = idx;
        }
    });

    if (holder !== null) {
        game.spyState.holderIndex = holder;
    } else {
        // Card might be in pot or lost (shouldn't happen easily)
        game.spyState.holderIndex = null;
    }
};

export const processNextTurn = (game) => {
    const { hands, lastResult, pot, winningStreak } = game;
    // lastResult: { winnerIndex, tiedIndices, winningValue }

    if (!lastResult) return game; // No turn to process

    const playedCards = [];

    // Collect played cards (card at index 0 from each non-empty hand)
    // We assume the game state 'activeCards' logic from playTurn implies we just take the top card
    // from everyone who has cards.
    // However, playTurn only looks at cards, it doesn't remove them.
    // We must now remove them.

    // Identify participants logic: anyone with cards participating?
    // In make_move we identified participants.
    // We'll iterate all hands. If it has cards, we shift.
    // CAUTION: If a player is out of cards, they don't play.

    for (let i = 0; i < hands.length; i++) {
        if (hands[i].length > 0) {
            const card = hands[i].shift();
            playedCards.push(card);
        }
    }

    // Combine with pot
    const allCards = [...pot, ...playedCards];
    game.pot = []; // Clear pot buffer

    if (lastResult.winnerIndex !== null) {
        // Winner takes all
        // Add to bottom of winner's hand
        game.hands[lastResult.winnerIndex].push(...allCards);
        game.scores[lastResult.winnerIndex] += 1;

        // Update streaks: Reset others, increment winner
        for (let i = 0; i < winningStreak.length; i++) {
            if (i === lastResult.winnerIndex) {
                winningStreak[i] += 1;
            } else {
                winningStreak[i] = 0;
            }
        }

        game.activePlayerIndex = lastResult.winnerIndex;
        game.feedback = `Player ${lastResult.winnerIndex + 1} won the round!`;

        // Check for 3 wins Power Mode
        if (winningStreak[lastResult.winnerIndex] >= 3) {
            game.feedback += " 🔥 Power Mode Active! Steal 2 Cards!";
            game.powerModePlayer = lastResult.winnerIndex;
            game.stealState = { active: true, stealer: lastResult.winnerIndex, count: 2 };
        } else {
            game.powerModePlayer = null;
        }

    } else {
        // Tie
        game.pot = allCards;
        game.feedback = "It's a tie! Cards added to the pot.";
        // activePlayerIndex stays same (or potentially rotates - sticking to same for stability)
        // Reset streaks on tie? Usually yes.
        winningStreak.fill(0);
        game.powerModePlayer = null;
    }

    game.round += 1;
    game.revealed = false;
    game.lastResult = null;

    // Spy Logic: Check for holder update (if active)
    if (game.spyState.active) {
        updateSpyHolder(game);
    }

    // Check Elimination
    checkElimination(game);

    // Check Win
    checkWinCondition(game, 80); // Assuming 80 is total

    // Update Active Player
    // If current active player is elim, rotate
    const totalPlayers = game.hands.length;
    let nextIdx = (game.activePlayerIndex + 1) % totalPlayers;
    // Skip eliminated/dropped players
    let loopCount = 0;
    while (game.droppedPlayers[nextIdx] && loopCount < totalPlayers) {
        nextIdx = (nextIdx + 1) % totalPlayers;
        loopCount++;
    }

    // If everyone else dropped, last man standing wins?
    // checkWinCondition handles 80 cards. If logic is "Last Man Standing" it implies he gets all cards.
    // If players drop, cards redistribute. So eventually one holds all.

    if (loopCount < totalPlayers) {
        game.activePlayerIndex = nextIdx;
    }

    return game;
};

export const getBestAttribute = (card) => {
    // Simple logic: pick highest stat
    const stats = card.stats;
    let maxVal = -1;
    let bestAttr = 'matches'; // default
    for (const [attr, val] of Object.entries(stats)) {
        if (typeof val === 'number' && val > maxVal) {
            maxVal = val;
            bestAttr = attr;
        }
    }
    return bestAttr;
};

export const handlePlayerDrop = (game, playerIndex) => {
    if (game.droppedPlayers[playerIndex]) return game;

    game.droppedPlayers[playerIndex] = true;
    const droppedHand = game.hands[playerIndex];
    game.hands[playerIndex] = []; // Empty the hand

    // Identify active players
    const activeIndices = game.hands.map((_, i) => i)
        .filter(i => !game.droppedPlayers[i] && i !== playerIndex); // Filter self just in case

    if (activeIndices.length > 0) {
        // Distribute round-robin
        droppedHand.forEach((card, i) => {
            const targetIndex = activeIndices[i % activeIndices.length];
            game.hands[targetIndex].push(card);
        });
        game.feedback = `${game.playerNames[playerIndex] || `Player ${playerIndex + 1}`} dropped! Cards redistributed.`;
    } else {
        game.gameState = 'FINISHED';
        game.feedback = 'All players dropped. Game Over.';
    }

    // If it was the dropped player's turn or they were the winner of last turn
    // Ideally we should pass the turn if it was their turn.
    // Simpler: Just ensure activePlayerIndex points to a valid player.

    // If active player dropped, rotate to next valid
    if (game.activePlayerIndex === playerIndex) {
        let nextIndex = (playerIndex + 1) % game.hands.length;
        while (game.droppedPlayers[nextIndex] && nextIndex !== playerIndex) {
            nextIndex = (nextIndex + 1) % game.hands.length;
        }
        game.activePlayerIndex = nextIndex;
    }

    // Also clear them from streaks? Maybe keep history but valid for now.
    return game;
};

export const handleStealMove = (game, { targetIndex, cardIndices }) => {
    // Validate
    if (!game.stealState || !game.stealState.active) return game;

    // Note: cardIndices should be an array of indices to steal from target's hand
    const { stealer } = game.stealState;
    if (game.hands[targetIndex].length === 0) return game;

    const targetHand = game.hands[targetIndex];
    const stealerHand = game.hands[stealer];

    // Sort indices descending to remove safely
    const sortedIndices = [...cardIndices].sort((a, b) => b - a);

    const stolenCards = [];
    sortedIndices.forEach(idx => {
        if (idx >= 0 && idx < targetHand.length) {
            stolenCards.push(targetHand[idx]);
            targetHand.splice(idx, 1);
        }
    });

    stealerHand.push(...stolenCards);

    // Reset State
    game.stealState = { active: false, stealer: null, count: 0 };
    // Reset streak after use? Usually power mode uses up the streak.
    game.winningStreak[stealer] = 0;

    game.feedback = `${game.playerNames[stealer] || `Player ${stealer + 1}`} stole ${stolenCards.length} cards from ${game.playerNames[targetIndex] || `Player ${targetIndex + 1}`}!`;

    return game;
};

export const activateSpyMode = (game, playerIndex) => {
    if (game.spyState.active) return game;

    // Validate trigger condition again (25 cards)
    if (game.hands[playerIndex].length < 25) return game;

    game.spyState.active = true;
    game.spyState.makerIndex = playerIndex;

    // Mark the top card
    if (game.hands[playerIndex].length > 0) {
        game.spyState.cardId = game.hands[playerIndex][0].id;
        game.spyState.holderIndex = playerIndex;
        game.feedback = `${game.playerNames[playerIndex] || `Player ${playerIndex + 1}`} activated Spy Mode! 🕵️`;
    }
    return game;
};
