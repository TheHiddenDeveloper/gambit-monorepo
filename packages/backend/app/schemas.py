from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ---------- Analysis ----------

class AnalysisBase(BaseModel):
    eval_cp: Optional[int] = None
    eval_mate: Optional[int] = None
    best_move: Optional[str] = None
    mistake_type: Optional[str] = None
    depth: Optional[int] = None
    nodes: Optional[int] = None
    time_ms: Optional[int] = None

class AnalysisCreate(AnalysisBase):
    pass

class Analysis(AnalysisBase):
    id: int

    class Config:
        from_attributes = True


# ---------- Move ----------

class MoveBase(BaseModel):
    move_number: int
    color: str
    san: str
    uci: Optional[str] = None
    fen: Optional[str] = None

class MoveCreate(MoveBase):
    pass

class Move(MoveBase):
    id: int
    analysis: List[Analysis] = []   # attach analysis results

    class Config:
        from_attributes = True


# ---------- Game ----------

class PGNImport(BaseModel):
    pgn: str

class GameBase(BaseModel):
    lichess_id: Optional[str] = None
    event: Optional[str] = None
    site: Optional[str] = None
    date: Optional[str] = None
    utc_date: Optional[str] = None
    utc_time: Optional[str] = None
    variant: Optional[str] = None
    termination: Optional[str] = None
    time_control: Optional[str] = None
    rated: Optional[bool] = True
    white: str
    black: str
    white_elo: Optional[int] = None
    black_elo: Optional[int] = None
    white_rating_diff: Optional[str] = None
    black_rating_diff: Optional[str] = None
    result: str
    eco_code: Optional[str] = None
    opening_name: Optional[str] = None
    created_at: Optional[datetime] = None

class GameCreate(GameBase):
    raw_pgn: str

class Game(GameBase):
    id: int
    raw_pgn: str
    imported_at: datetime
    moves: List[Move] = []

    class Config:
        from_attributes = True
