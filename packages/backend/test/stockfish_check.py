from stockfish import Stockfish
from pathlib import Path

STOCKFISH_PATH = Path("O:/ChessInsight/app/stockfish/stockfish.exe")

engine = Stockfish(path=str(STOCKFISH_PATH), depth=15)

# Test if it works by just calling evaluation methods
engine.set_fen_position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")

print("Best move:", engine.get_best_move())
print("Evaluation:", engine.get_evaluation())
