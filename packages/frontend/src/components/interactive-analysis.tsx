'use client';

import React, { useState, useMemo } from 'react';
import type { Game, MoveClassification } from '@/lib/types';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Dot,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Diamond,
  HeartCrack,
  HelpCircle,
  Sparkles,
  ThumbsDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EvaluationBar } from './evaluation-bar';


const MOVE_CLASSIFICATION_THRESHOLDS = {
  blunder: 200, // Losing 2+ pawns of advantage
  mistake: 100, // Losing 1-2 pawns of advantage
  inaccuracy: 50, // Losing 0.5-1 pawns of advantage
  great: 100, // Gaining 1+ pawns of advantage from a neutral/losing position
  brilliant: 250, // A great move that involves a sacrifice
};

const MoveClassificationIcon: React.FC<{ classification: MoveClassification, className?: string }> = ({ classification, className }) => {
    const iconProps = { className: cn("h-4 w-4", className) };
    switch (classification) {
        case 'brilliant':
            return <Sparkles {...iconProps} />;
        case 'great':
            return <Diamond {...iconProps} />;
        case 'mistake':
            return <HelpCircle {...iconProps} />;
        case 'blunder':
            return <HeartCrack {...iconProps} />;
        case 'inaccuracy':
            return <ThumbsDown {...iconProps} />;
        default:
            return null;
    }
}

const getClassificationColor = (classification?: MoveClassification) => {
    switch (classification) {
        case 'brilliant':
            return 'hsl(var(--chart-2))'; // accent color
        case 'great':
            return 'hsl(var(--chart-1))'; // primary color
        case 'inaccuracy':
            return '#f59e0b'; // amber-500
        case 'mistake':
            return '#f97316'; // orange-500
        case 'blunder':
            return 'hsl(var(--destructive))';
        default:
            return 'hsl(var(--primary))';
    }
};

const CustomizedDot: React.FC<any> = (props) => {
  const { cx, cy, payload } = props;
  const { classification } = payload;

  if (classification) {
    return <Dot cx={cx} cy={cy} r={5} fill={getClassificationColor(classification)} />;
  }

  return <Dot cx={cx} cy={cy} r={2} fill="hsl(var(--primary))" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Move</span>
                <span className="font-bold">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-sm text-muted-foreground">Eval</span>
                <span className="font-bold">{(data.cp / 100).toFixed(2)}</span>
            </div>
        </div>
        {data.classification && (
            <div className="mt-2 flex items-center gap-2">
                 <MoveClassificationIcon classification={data.classification} />
                <span className="text-sm font-semibold capitalize" style={{color: getClassificationColor(data.classification)}}>
                    {data.classification}
                </span>
            </div>
        )}
      </div>
    );
  }

  return null;
};


export function InteractiveAnalysis({ game }: { game: Game }) {
  const userIsWhite = game.whitePlayer.name === 'You';
  
  const [history, setHistory] = useState(() => {
    const chess = new Chess();
    chess.loadPgn(game.pgn);
    return chess.history({ verbose: true });
  });

  const processedEvaluation = useMemo(() => {
    const evals = game.evaluation; // Use raw centipawns
    const classifiedEvals = [];
    const tempChess = new Chess();

    for (let i = 0; i < history.length; i++) {
        const move = history[i];
        const turn = move.color;
        const isUserMove = (userIsWhite && turn === 'w') || (!userIsWhite && turn === 'b');
        
        const currentEval = evals[i]?.cp ?? 0;
        const prevEval = i > 0 ? (evals[i-1]?.cp ?? 0) : 0;
        
        const perspectiveEval = turn === 'w' ? currentEval : -currentEval;
        const perspectivePrevEval = turn === 'w' ? prevEval : -prevEval;
        
        const delta = perspectivePrevEval - perspectiveEval; // Positive delta is bad, negative is good
        
        let classification: MoveClassification | undefined = undefined;

        tempChess.move(move);

        if (isUserMove) {
            if (delta > MOVE_CLASSIFICATION_THRESHOLDS.blunder) {
                classification = 'blunder';
            } else if (delta > MOVE_CLASSIFICATION_THRESHOLDS.mistake) {
                classification = 'mistake';
            } else if (delta > MOVE_CLASSIFICATION_THRESHOLDS.inaccuracy) {
                classification = 'inaccuracy';
            } else if (delta < -MOVE_CLASSIFICATION_THRESHOLDS.great) {
                // Check for brilliant move (involves a sacrifice)
                const isSacrifice = tempChess.isCheckmate() || tempChess.isStalemate() ? false :
                    (new Chess(move.before).get(move.from)?.type !== 'p' && new Chess(move.before).get(move.to));
                if (isSacrifice && delta < -MOVE_CLASSIFICATION_THRESHOLDS.brilliant) {
                    classification = 'brilliant';
                } else {
                    classification = 'great';
                }
            }
        }
       
        classifiedEvals.push({ ...(evals[i] || {move: i+1, cp: 0}), classification });
    }
    return classifiedEvals;
  }, [game.pgn, game.evaluation, userIsWhite, history]);


  const [currentMoveIndex, setCurrentMoveIndex] = useState(history.length - 1);

  const movesForDisplay = useMemo(() => {
    const chess = new Chess();
    const moves = [];
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      chess.move(move);
      moves.push({
        ...move,
        fen: chess.fen(),
        classification: processedEvaluation[i]?.classification,
      });
    }
    return moves;
  }, [history, processedEvaluation]);
  
  const currentFen = useMemo(() => {
      if(currentMoveIndex < 0) {
        if (history.length > 0) {
          const tempGame = new Chess(history[0].before);
          return tempGame.fen();
        }
        return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      }
      return movesForDisplay[currentMoveIndex]?.fen || 'start';
  }, [currentMoveIndex, movesForDisplay, history]);
  
  const currentEvaluation = useMemo(() => {
    if (currentMoveIndex < 0) {
        return 0; // Starting position
    }
    return processedEvaluation[currentMoveIndex]?.cp ?? 0;
  }, [currentMoveIndex, processedEvaluation]);


  const navigateToMove = (index: number) => {
    if (index >= -1 && index < history.length) {
      setCurrentMoveIndex(index);
    }
  };
  
  const chartData = processedEvaluation.map(e => ({...e, cp: e.cp / 100}));

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Game Analysis</h2>
            <p className="text-muted-foreground">
                {game.whitePlayer.name} ({game.whitePlayer.rating}) vs {game.blackPlayer.name} ({game.blackPlayer.rating})
            </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-4">
                     <div className="flex flex-row items-start gap-2">
                      <EvaluationBar evaluation={currentEvaluation} />
                      <div className="w-full aspect-square">
                          <Chessboard
                              position={currentFen}
                              arePiecesDraggable={false}
                              customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
                          />
                      </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Evaluation</CardTitle>
                    <CardDescription>Centipawn advantage per move. White is positive, Black is negative.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={(e: any) => e && e.activeTooltipIndex !== undefined && navigateToMove(e.activeTooltipIndex)}>
                             <XAxis dataKey="move" stroke="#888888" fontSize={12} interval="preserveStartEnd" />
                             <YAxis stroke="#888888" fontSize={12} domain={[-8, 8]} allowDataOverflow={true} />
                             <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }} />
                             <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                             <Line type="monotone" dataKey="cp" stroke="hsl(var(--primary))" strokeWidth={2} dot={<CustomizedDot/>} activeDot={<CustomizedDot/>} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Moves</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-x-2 gap-y-1 text-sm">
                            {movesForDisplay.map((move, index) => (
                                <React.Fragment key={index}>
                                    {index % 2 === 0 && <div className="text-right text-muted-foreground pr-2">{Math.floor(index / 2) + 1}.</div>}
                                    <button 
                                        onClick={() => navigateToMove(index)}
                                        className={cn(
                                          'px-2 py-1 rounded-md text-left flex items-center gap-1.5',
                                          currentMoveIndex === index ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                        )}
                                    >
                                        {move.san}
                                        {move.classification && <MoveClassificationIcon classification={move.classification} />}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="mt-4 flex justify-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(-1)} disabled={currentMoveIndex < 0}><ChevronsLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(currentMoveIndex - 1)} disabled={currentMoveIndex < 0}><ChevronLeft /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(currentMoveIndex + 1)} disabled={currentMoveIndex >= history.length -1}><ChevronRight /></Button>
                        <Button variant="outline" size="icon" onClick={() => navigateToMove(history.length - 1)} disabled={currentMoveIndex >= history.length -1}><ChevronsRight /></Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
