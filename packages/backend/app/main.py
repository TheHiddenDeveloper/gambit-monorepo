from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from contextlib import asynccontextmanager

from . import models, schemas
from .database import engine, Base, get_db
from .services.pgn_parser import import_pgn
from .services.engine import init_engine, close_engine, evaluate_fen

# Create tables at startup
Base.metadata.create_all(bind=engine)

# --------- Lifecycle ---------
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_engine()   # Start Stockfish
    yield
    close_engine()  # Stop Stockfish

app = FastAPI(title="Chess Insight Backend", lifespan=lifespan)

# ---------------- Endpoints ----------------
@app.post("/import_pgn/", response_model=schemas.Game)
def import_game(pgn_data: schemas.PGNImport, db: Session = Depends(get_db)):
    try:
        game = import_pgn(pgn_data.pgn, db)
        return game
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/games/", response_model=List[schemas.Game])
def list_games(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    games = db.query(models.Game).offset(skip).limit(limit).all()
    return games

@app.get("/games/{game_id}", response_model=schemas.Game)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = (
        db.query(models.Game)
        .options(joinedload(models.Game.moves))
        .filter(models.Game.id == game_id)
        .first()
    )
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@app.post("/analyze/{game_id}")
def analyze_game(game_id: int, db: Session = Depends(get_db)):
    """
    Run Stockfish analysis on all moves of a game.
    Stores numeric centipawn scores (positive = White advantage, negative = Black advantage).
    """
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    analyzed_count = 0
    for move in game.moves:
        if move.evaluation is None:
            try:
                score = evaluate_fen(move.fen)  # now returns an int
                move.evaluation = score
                analyzed_count += 1
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error analyzing move {move.id}: {str(e)}")

    db.commit()
    db.refresh(game)

    return {
        "game_id": game.id,
        "analyzed_moves": analyzed_count,
        "total_moves": len(game.moves),
    }