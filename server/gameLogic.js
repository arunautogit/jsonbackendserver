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
