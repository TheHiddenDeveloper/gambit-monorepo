'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import type { Move, PieceSymbol } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { Square } from 'react-chessboard/dist/chessboard/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, RotateCcw, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { playSound } from '@/lib/sounds';
import { EvaluationBar } from '@/components/evaluation-bar';
import { useSettings } from '@/hooks/use-settings';
import { useStockfish, type StockfishEvaluation } from '@/hooks/use-stockfish';

const MOCK_EVALUATION = 25;

export default function AnalysisBoardPage() {
  const { stockfishDepth } = useSettings();
  const [game, setGame] = useState(() => new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [stockfishEval, setStockfishEval] = useState<StockfishEvaluation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastFenRef = useRef<string>('');

  const { isReady, isAnalyzing: sfAnalyzing, evaluation, analyze, stop, setDepth } = useStockfish({
    depth: stockfishDepth,
    onEvaluation: (eval_result) => {
      setStockfishEval(eval_result);
    },
  });

  useEffect(() => {
    setDepth(stockfishDepth);
  }, [stockfishDepth, setDepth]);

  useEffect(() => {
    setIsAnalyzing(sfAnalyzing);
  }, [sfAnalyzing]);

  const history = useMemo(() => game.history({ verbose: true }) as Move[], [game]);

  const currentFen = useMemo(() => {
    if (currentMoveIndex < 0) {
        const fenFromHeader = game.header().FEN
        if (fenFromHeader) {
            return fenFromHeader;
        }
        const g = new Chess();
        if(history.length > 0) {
            g.loadPgn(game.pgn());
            g.reset();
            return g.fen();
        }
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    }
    return history[currentMoveIndex]?.after || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  }, [currentMoveIndex, history, game]);

  useEffect(() => {
    if (isReady && currentFen && currentFen !== lastFenRef.current) {
      lastFenRef.current = currentFen;
      stop();
      analyze(currentFen);
    }
  }, [currentFen, isReady, analyze, stop, history]);

  const gameForMoveLogic = useMemo(() => {
    return new Chess(currentFen);
  }, [currentFen]);

  const navigateToMove = useCallback((index: number) => {
    setSelectedSquare(null);
    setLegalMoves([]);
    if (index >= -1 && index < history.length) {
      setCurrentMoveIndex(index);
    }
  }, [history.length]);

  const updateGame = (updatedGame: Chess, moveIndex?: number) => {
    setGame(updatedGame);
    setCurrentMoveIndex(moveIndex !== undefined ? moveIndex : updatedGame.history().length - 1);
  };
  
  const makeMove = (sourceSquare: Square, targetSquare: Square, promotionPiece?: PieceSymbol): boolean => {
    const gameCopy = new Chess(currentFen);
    
    let move = null;

    try {
        move = gameCopy.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: promotionPiece || 'q', 
        });
    } catch (error) {
        // This can happen if the move is invalid
        playSound('illegal');
        console.warn("Invalid move attempt:", error);
    }
    
    if (move === null) {
      playSound('illegal');
      return false;
    }
    
    const newGameFromHistory = new Chess();
    const originalHeader = game.header();
    newGameFromHistory.loadPgn(game.pgn());
    newGameFromHistory.reset(); 
    for (const key in originalHeader) {
        const value = originalHeader[key];
        if (value !== null && value !== undefined) {
            newGameFromHistory.header(key, value);
        }
    }

    if(currentMoveIndex >= 0) {
        history.slice(0, currentMoveIndex + 1).forEach(m => newGameFromHistory.move(m.san));
    }
    
    newGameFromHistory.move(move.san);
    
    if (newGameFromHistory.isCheckmate() || newGameFromHistory.isStalemate()) {
        playSound('move-check');
        setTimeout(() => playSound('game-end'), 200);
    } else if (newGameFromHistory.isCheck()) {
        playSound('move-check');
    } else if (move.flags.includes('p')) {
        playSound('promote');
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
        playSound('castle');
    } else if (move.flags.includes('c') || move.flags.includes('e')) {
        playSound('capture');
    } else {
        playSound('move');
    }

    updateGame(newGameFromHistory);

    setSelectedSquare(null);
    setLegalMoves([]);
    return true;
  }

  function onSquareClick(square: Square) {
    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
      makeMove(selectedSquare, square);
      return;
    }

    const piece = gameForMoveLogic.get(square);
    if (!piece || piece.color !== gameForMoveLogic.turn()) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }
    
    setSelectedSquare(square);
    const moves = gameForMoveLogic.moves({ square, verbose: true });
    setLegalMoves(moves.map(m => m.to));
  }
  
  function onDrop(sourceSquare: Square, targetSquare: Square) {
    return makeMove(sourceSquare, targetSquare);
  }
  
  function resetBoard() {
    updateGame(new Chess(), -1);
    playSound('game-start');
  }

  const handleFenLoad = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const fenInput = form.elements.namedItem('fenInput') as HTMLInputElement;
      const fen = fenInput.value.trim();
      if (fen) {
        try {
            const newGame = new Chess(fen);
            updateGame(newGame, -1);
        } catch (err) {
            console.error("Invalid FEN string");
            alert("Invalid FEN string");
        }
      }
  };

  const handlePgnLoad = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const pgnInput = form.elements.namedItem('pgnInput') as HTMLTextAreaElement;
      const pgn = pgnInput.value.trim();
      if (pgn) {
          try {
              const newGame = new Chess();
              newGame.loadPgn(pgn);
              updateGame(newGame);
          } catch(err) {
              console.error("Invalid PGN string");
              alert("Invalid PGN string");
          }
      }
  };

  const squareStyles = useMemo(() => {
    const styles: { [key: string]: React.CSSProperties } = {};

    if (currentMoveIndex >= 0 && history[currentMoveIndex]) {
      const lastMove = history[currentMoveIndex];
      styles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
      styles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.4)' };
    }

    if (gameForMoveLogic.isCheck()) {
      const kingSquare = gameForMoveLogic.board().flat().find(p => p?.type === 'k' && p?.color === gameForMoveLogic.turn())?.square;
      if (kingSquare) {
        styles[kingSquare] = {
          background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.5) 0%, transparent 70%)',
        };
      }
    }

    if(selectedSquare) {
        styles[selectedSquare] = { backgroundColor: 'rgba(0, 128, 0, 0.4)' };
    }

    legalMoves.forEach(square => {
      styles[square] = {
        background: 'radial-gradient(circle, rgba(0,0,0,0.2) 25%, transparent 30%)',
      };
    });

    return styles;
  }, [currentMoveIndex, history, gameForMoveLogic, selectedSquare, legalMoves]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analysis Board</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-row items-start gap-2">
                      <div className="flex flex-col items-center gap-1">
                        <EvaluationBar evaluation={stockfishEval?.score ?? MOCK_EVALUATION} />
                        {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                      <div className="w-full aspect-square">
                        <Chessboard
                            position={currentFen}
                            onPieceDrop={onDrop}
                            onSquareClick={onSquareClick}
                            customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
                            customSquareStyles={squareStyles}
                        />
                      </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Moves & Controls</CardTitle>
                    <CardDescription>
                      Explore moves or set up a custom position.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <ScrollArea className="h-48 w-full rounded-md border p-2">
                         <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-2 gap-y-1 text-sm font-mono">
                            {history.length === 0 && <p className="text-muted-foreground p-2 col-span-3">Move history will appear here.</p>}
                            {history.map((move, index) => {
                                const moveNumber = Math.floor(index / 2) + 1;
                                const isWhiteMove = index % 2 === 0;
                                return (
                                <React.Fragment key={index}>
                                    {isWhiteMove && <div className="text-right text-muted-foreground">{moveNumber}.</div>}
                                    <button
                                        onClick={() => navigateToMove(index)}
                                        className={cn(
                                          'px-2 py-1 rounded-md text-left',
                                          currentMoveIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                        )}
                                    >
                                        {move.san}
                                    </button>
                                    {!isWhiteMove && index + 1 >= history.length ? <div /> : null}
                                </React.Fragment>
                            )})}
                        </div>
                    </ScrollArea>
                    <div className="flex justify-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(-1)} disabled={currentMoveIndex < 0}><ChevronsLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0}><ChevronLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= history.length - 1}><ChevronRight /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(history.length - 1)} disabled={currentMoveIndex >= history.length - 1}><ChevronsRight /></Button>
                   </div>
                   <Button variant="outline" className="w-full" onClick={resetBoard}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset Board
                   </Button>
                   <form className="space-y-2" onSubmit={handlePgnLoad}>
                        <Label htmlFor="pgnInput">Load from PGN</Label>
                        <Textarea id="pgnInput" name="pgnInput" placeholder="1. e4 e5 2. Nf3 ..." className="h-20" />
                        <Button type="submit" className="w-full">Load PGN</Button>
                   </form>
                   <form className="space-y-2" onSubmit={handleFenLoad}>
                      <Label htmlFor="fenInput">Load from FEN</Label>
                      <div className="flex gap-2">
                        <Input id="fenInput" name="fenInput" placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
                        <Button type="submit">Load</Button>
                      </div>
                   </form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
