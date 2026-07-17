import chess.pgn
from io import StringIO
from sqlalchemy.orm import Session
from .. import models


def import_pgn(pgn: str, db: Session):
    """
    Parse PGN string, save game metadata and moves into the database.
    """
    # Parse PGN with python-chess
    pgn_io = StringIO(pgn)
    game = chess.pgn.read_game(pgn_io)

    if not game:
        raise ValueError("Invalid PGN data")

    # ---------- Store Game ----------
    game_model = models.Game(
        lichess_id=game.headers.get("GameId"),
        event=game.headers.get("Event"),
        site=game.headers.get("Site"),
        date=game.headers.get("Date"),
        utc_date=game.headers.get("UTCDate"),
        utc_time=game.headers.get("UTCTime"),
        variant=game.headers.get("Variant"),
        termination=game.headers.get("Termination"),
        time_control=game.headers.get("TimeControl"),
        white=game.headers.get("White"),
        black=game.headers.get("Black"),
        white_elo=int(game.headers["WhiteElo"]) if "WhiteElo" in game.headers else None,
        black_elo=int(game.headers["BlackElo"]) if "BlackElo" in game.headers else None,
        white_rating_diff=game.headers.get("WhiteRatingDiff"),
        black_rating_diff=game.headers.get("BlackRatingDiff"),
        result=game.headers.get("Result"),
        eco_code=game.headers.get("ECO"),
        opening_name=game.headers.get("Opening"),
        raw_pgn=pgn,
    )

    db.add(game_model)
    db.commit()
    db.refresh(game_model)

    # ---------- Store Moves ----------
    board = game.board()
    move_number = 1
    moves_to_add = []

    for node in game.mainline():
        move = node.move
        color = "white" if board.turn == chess.WHITE else "black"

        # FEN before making the move
        fen_before = board.fen()
        board.push(move)
        # FEN after making the move
        fen_after = board.fen()

        move_model = models.Move(
            game_id=game_model.id,
            move_number=move_number,
            color=color,
            san=board.san(move),     # algebraic notation
            uci=move.uci(),          # universal notation
            fen=fen_before,          # before move
            fen_after=fen_after,     # after move
            evaluation=None,         # placeholder for Stockfish
            best_move=None           # placeholder for Stockfish
        )

        moves_to_add.append(move_model)
        move_number += 1

    db.add_all(moves_to_add)
    db.commit()

    return game_model
