import { ref } from 'vue';

const LEADERBOARD_KEY = 'game_center_leaderboard';

export function useLeaderboard() {
    const getLeaderboard = () => {
        const data = localStorage.getItem(LEADERBOARD_KEY);
        return data ? JSON.parse(data) : {};
    };

    const saveScore = (gameId, score) => {
        const leaderboard = getLeaderboard();
        if (!leaderboard[gameId]) {
            leaderboard[gameId] = [];
        }

        const entry = {
            score,
            date: new Date().toISOString(),
        };

        leaderboard[gameId].push(entry);

        // Sort based on game type (most are high score, some are low time)
        // For simplicity, we'll handle sorting in the UI or assume high score for now.
        // Actually, let's standardize:
        // - Minesweeper, Reaction Time, Aim Trainer: Lower is better (Need to handle this)
        // - Others: Higher is better

        // We'll just store all and sort when retrieving/displaying

        // Keep top 50 to save space
        // specific sorting logic should be done when displaying or efficiently here if we knew the game type.
        // Let's just append for now and slice later.

        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
    };

    const getTopScores = (gameId, limit = 10, ascending = false) => {
        const leaderboard = getLeaderboard();
        const scores = leaderboard[gameId] || [];

        scores.sort((a, b) => {
            return ascending ? a.score - b.score : b.score - a.score;
        });

        return scores.slice(0, limit);
    };

    return {
        saveScore,
        getTopScores
    };
}
