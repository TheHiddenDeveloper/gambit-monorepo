import type { Game, DashboardData, OpeningPerformance } from './types';

export const mockGames: Game[] = [
  {
    id: 'game1',
    date: '2023-10-26',
    whitePlayer: { name: 'You', rating: 1500 },
    blackPlayer: { name: 'Opponent1', rating: 1520 },
    result: '1-0',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 *',
    opening: { eco: 'C92', name: 'Ruy Lopez, Closed' },
    accuracy: { white: 95.2, black: 91.8 },
    evaluation: [
      { move: 1, cp: 20 }, { move: 2, cp: 25 }, { move: 3, cp: 15 }, { move: 4, cp: 30 }, { move: 5, cp: 28 },
      { move: 6, cp: 45 }, { move: 7, cp: 40 }, { move: 8, cp: 120 }, { move: 9, cp: 110 }, { move: 10, cp: 250 },
    ],
  },
  {
    id: 'game2',
    date: '2023-10-25',
    whitePlayer: { name: 'Opponent2', rating: 1480 },
    blackPlayer: { name: 'You', rating: 1495 },
    result: '0-1',
    pgn: '1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. Qc2 O-O 5. a3 Bxc3+ 6. Qxc3 b6 7. Bg5 Bb7 8. e3 d6 9. Nf3 Nbd7 10. Be2 h6 *',
    opening: { eco: 'E32', name: "Nimzo-Indian, Classical" },
    accuracy: { white: 88.1, black: 96.5 },
    evaluation: [
      { move: 1, cp: 10 }, { move: 2, cp: 5 }, { move: 3, cp: 12 }, { move: 4, cp: -10 }, { move: 5, cp: -5 },
      { move: 6, cp: -20 }, { move: 7, cp: -15 }, { move: 8, cp: -80 }, { move: 9, cp: -75 }, { move: 10, cp: -150 },
    ],
  },
  {
    id: 'game3',
    date: '2023-10-24',
    whitePlayer: { name: 'You', rating: 1490 },
    blackPlayer: { name: 'Opponent3', rating: 1485 },
    result: '1/2-1/2',
    pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7 8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5 *',
    opening: { eco: 'B99', name: 'Sicilian, Najdorf, 7...Be7 Main line' },
    accuracy: { white: 92.3, black: 93.1 },
    evaluation: [
      { move: 1, cp: 22 }, { move: 2, cp: 20 }, { move: 3, cp: 18 }, { move: 4, cp: 25 }, { move: 5, cp: 23 },
      { move: 6, cp: 10 }, { move: 7, cp: 5 }, { move: 8, cp: 0 }, { move: 9, cp: -5 }, { move: 10, cp: 0 },
    ],
  },
];

export const mockDashboardData: DashboardData = {
    rating: { value: 1500, change: 25 },
    accuracy: { value: 92.4, change: 1.2 },
    lastGame: { result: 'Win', opponent: 'Opponent1', opponentRating: 1520 },
    streaks: { win: 3, loss: 0, draw: 1 },
    ratingHistory: [
        { name: 'Jan', rating: 1400 },
        { name: 'Feb', rating: 1420 },
        { name: 'Mar', rating: 1450 },
        { name: 'Apr', rating: 1440 },
        { name: 'May', rating: 1475 },
        { name: 'Jun', rating: 1500 },
    ],
    accuracyHistory: [
        { name: 'Jan', accuracy: 88 },
        { name: 'Feb', accuracy: 89 },
        { name: 'Mar', accuracy: 91 },
        { name: 'Apr', accuracy: 90 },
        { name: 'May', accuracy: 92 },
        { name: 'Jun', accuracy: 93 },
    ]
};

export const mockOpeningPerformance: OpeningPerformance[] = [
    { eco: 'C92', name: 'Ruy Lopez, Closed', games: 15, win: 8, draw: 4, loss: 3, avgAccuracy: 94.1 },
    { eco: 'E32', name: 'Nimzo-Indian, Classical', games: 12, win: 7, draw: 2, loss: 3, avgAccuracy: 93.5 },
    { eco: 'B99', name: 'Sicilian, Najdorf', games: 25, win: 10, draw: 5, loss: 10, avgAccuracy: 91.2 },
    { eco: 'A45', name: 'Trompowsky Attack', games: 8, win: 5, draw: 1, loss: 2, avgAccuracy: 90.8 },
];
