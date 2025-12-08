import { Player } from '../data/players';

// Shuffle an array (Fisher-Yates)
export const shuffleDeck = (deck: Player[]): Player[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

// Distribute cards equally among players
export const distributeCards = (deck: Player[], playerCount: number): Player[][] => {
    const hands: Player[][] = Array.from({ length: playerCount }, () => []);
    deck.forEach((card, index) => {
        hands[index % playerCount].push(card);
    });
    return hands;
};

// Result of a turn comparison
export interface TurnResult {
    winnerIndex: number | null; // null if tie
    tiedIndices: number[]; // indices of players in the tie
    winningValue: number;
}

// Compare current cards of active players based on attribute
export const playTurn = (
    activeCards: { playerIndex: number; card: Player }[],
    attribute: keyof Player['stats']
): TurnResult => {
    let highestValue = -1;
    let winnerIndex: number | null = null;
    let tiedIndices: number[] = [];

    // Find highest value
    activeCards.forEach(({ playerIndex, card }) => {
        // For price, we handle float comparisons. For others, integers.
        // However, all are numbers in our interface.
        // Note: In some variations, 'Runs' might be lower is, but usually High is good.
        // For Bowling, Wickets High is good. Economy Low is good (but we don't have Eco, we have Wickets).
        // So for Runs, Wickets, Catches, Price -> Higher is better.

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
