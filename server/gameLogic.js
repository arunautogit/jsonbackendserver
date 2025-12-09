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

export const initializeGame = (playerCount) => {
    const deck = shuffleDeck(playersData);
    const hands = distributeCards(deck, playerCount);
    return {
        hands,
        activePlayerIndex: 0,
        pot: [],
        tiedPlayers: [],
        scores: new Array(playerCount).fill(0),
        winningStreak: new Array(playerCount).fill(0),
        round: 1,
        gameState: 'PLAYING',
        revealed: false,
        feedback: 'Game Started!',
        powerModePlayer: null,
        diceValue: 1,
        diceResult: null,
        transferState: { active: false, from: null, to: null, count: 0 }
    };
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
            game.feedback += " 🔥 Power Mode Active!";
            game.powerModePlayer = lastResult.winnerIndex;
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
