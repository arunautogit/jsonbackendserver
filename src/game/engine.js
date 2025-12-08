
// Shuffle an array (Fisher-Yates)
export const shuffleDeck = (deck) => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

// Distribute cards equally among players
export const distributeCards = (deck, playerCount) => {
    const hands = Array.from({ length: playerCount }, () => []);
    deck.forEach((card, index) => {
        hands[index % playerCount].push(card);
    });
    return hands;
};

// Compare current cards of active players based on attribute
export const playTurn = (
    activeCards,
    attribute
) => {
    let highestValue = -1;
    let winnerIndex = null;
    let tiedIndices = [];

    // Find highest value
    activeCards.forEach(({ playerIndex, card }) => {
        const value = card.stats[attribute];

        if (value > highestValue) {
            highestValue = value;
            winnerIndex = playerIndex;
            tiedIndices = [playerIndex];
        } else if (value === highestValue) {
            tiedIndices.push(playerIndex);
            winnerIndex = null; // Potential tie
        }
    });

    if (tiedIndices.length === 1) {
        return { winnerIndex: tiedIndices[0], tiedIndices: [], winningValue: highestValue };
    } else {
        return { winnerIndex: null, tiedIndices, winningValue: highestValue };
    }
};
