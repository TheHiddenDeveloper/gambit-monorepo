from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    lichess_id = Column(String, unique=True, index=True)
    raw_pgn = Column(Text, nullable=False)

    # Metadata
    event = Column(String)
    site = Column(String)
    date = Column(String)
    utc_date = Column(String)
    utc_time = Column(String)
    variant = Column(String)
    termination = Column(String)
    time_control = Column(String)
    rated = Column(Boolean, default=True)

    # Players
    white = Column(String, nullable=False)
    black = Column(String, nullable=False)
    white_elo = Column(Integer)
    black_elo = Column(Integer)
    white_rating_diff = Column(String)
    black_rating_diff = Column(String)

    # Result + opening
    result = Column(String, nullable=False)
    eco_code = Column(String)
    opening_name = Column(String)

    # Timestamps
    created_at = Column(DateTime)  # actual game start time (from Lichess)
    imported_at = Column(DateTime, default=datetime.utcnow)  # when saved locally

    # Relationships
    moves = relationship("Move", back_populates="game", cascade="all, delete-orphan")


class Move(Base):
    __tablename__ = "moves"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    move_number = Column(Integer, nullable=False)
    color = Column(String, nullable=False)  # "white" / "black"
    san = Column(String, nullable=False)    # e.g. "Nf3"
    uci = Column(String)                    # e.g. "e2e4"
    fen = Column(Text)                      # position BEFORE move
    fen_after = Column(Text)                # position AFTER move
    evaluation = Column(String, nullable=True)  # e.g. "cp 37", "mate -2"
    best_move = Column(String, nullable=True)   # Stockfish best move suggestion (uci)

    # Relationships
    game = relationship("Game", back_populates="moves")
    analysis = relationship("Analysis", back_populates="move", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True, index=True)
    move_id = Column(Integer, ForeignKey("moves.id", ondelete="CASCADE"), nullable=False)

    # Engine evaluation
    eval_cp = Column(Integer, nullable=True)   # centipawn score
    eval_mate = Column(Integer, nullable=True) # mate in N
    best_move = Column(String, nullable=True)  # suggested move
    mistake_type = Column(String, nullable=True) # "inaccuracy", "mistake", "blunder"
    depth = Column(Integer, nullable=True)     # search depth
    nodes = Column(Integer, nullable=True)     # nodes searched
    time_ms = Column(Integer, nullable=True)   # time taken for analysis (ms)

    # Relationships
    move = relationship("Move", back_populates="analysis")
