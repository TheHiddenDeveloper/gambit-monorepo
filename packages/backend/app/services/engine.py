# app/services/engine.py
from stockfish import Stockfish
from pathlib import Path

STOCKFISH_PATH = Path(__file__).parent.parent / "stockfish" / "stockfish.exe"

_engine: Stockfish | None = None


def init_engine():
    """Initialize Stockfish engine."""
    global _engine
    if _engine is None:
        if not STOCKFISH_PATH.exists():
            raise FileNotFoundError(f"Stockfish not found at {STOCKFISH_PATH}")
        _engine = Stockfish(path=str(STOCKFISH_PATH), depth=15)


def close_engine():
    """Close Stockfish engine (wrapper doesn’t expose quit, so just drop ref)."""
    global _engine
    _engine = None


def evaluate_fen(fen: str, depth: int = 15) -> int:
    """Evaluate a position in centipawns (positive = advantage for white)."""
    global _engine
    if _engine is None:
        raise RuntimeError("Engine not initialized. Call init_engine() first.")

    _engine.set_depth(depth)
    _engine.set_fen_position(fen)

    evaluation = _engine.get_evaluation()
    if evaluation["type"] == "mate":
        # Represent mate as a large score
        return 10000 if evaluation["value"] > 0 else -10000
    return evaluation["value"]
