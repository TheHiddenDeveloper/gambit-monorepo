# **App Name**: Chess Insights Hub

## Core Features:

- Game Import & Management: Import chess games from Lichess API or PGN files, storing them in a searchable local library.
- Interactive Game Analysis: Embedded chessboard with move list, engine annotations (blunders, mistakes, inaccuracies), best move suggestions, and evaluation arrows.
- Evaluation Graph: Display a graph showing centipawn loss/gain per move to visually represent the game's flow.
- Progress Tracking: Track accuracy, ACPL, rating, and opening performance over time. Also get insights into time-pressure performance.
- Dashboard Overview: Provide a quick snapshot of the user's rating, accuracy trends, last game summary, and current streaks.
- AI-Powered Weakness Detection: Use an AI tool to analyze multiple games and detect recurring strategic weaknesses in the player's gameplay.
- User Settings: Allow users to adjust Stockfish analysis depth, toggle dark/light mode, and adjust text size.

## Style Guidelines:

- Primary color: Indigo (#3F51B5) for trust and intelligence. Use the user's requested color. 
- Background color: Off-white (#F9FAFB) for a clean dashboard look. Use the user's requested color. 
- Accent color: Emerald green (#10B981) for success metrics (accuracy, improvements). Use the user's requested color.
- Error/Warning color: Warm red (#EF4444) for blunders and mistakes. Use the user's requested color.
- Font: 'Inter' (sans-serif) for clean, modern, highly legible typography. Use the user's requested font. Note: currently only Google Fonts are supported.
- Sidebar navigation with icons; grid-based dashboard cards. Use the user's requested layout guidelines.
- Chessboard: Use chessground or chessboardjsx, resizable and responsive. Use the user's requested technology. 
- Subtle animations: Smooth transitions on navigation, hover effects on buttons/cards. Use the user's requested animation.