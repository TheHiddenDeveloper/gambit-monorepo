export interface Game {
  id: string;
  date: string;
  whitePlayer: Player;
  blackPlayer: Player;
  result: '1-0' | '0-1' | '1/2-1/2';
  pgn: string;
  opening: {
    eco: string;
    name: string;
  };
  accuracy: {
    white: number;
    black: number;
  };
  evaluation: { move: number; cp: number }[];
}

export type MoveClassification = 'brilliant' | 'great' | 'mistake' | 'blunder' | 'inaccuracy';

export interface Player {
  name: string;
  rating: number;
}

export interface DashboardData {
    rating: { value: number; change: number };
    accuracy: { value: number; change: number };
    lastGame: { result: string; opponent: string; opponentRating: number };
    streaks: { win: number; loss: number; draw: number };
    ratingHistory: { name: string; rating: number }[];
    accuracyHistory: { name:string; accuracy: number }[];
}

export interface OpeningPerformance {
    eco: string;
    name: string;
    games: number;
    win: number;
    draw: number;
    loss: number;
    avgAccuracy: number;
}
