'use client';

import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import type { Square, Piece } from 'react-chessboard/dist/chessboard/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Copy } from 'lucide-react';

const pieces: Piece[] = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];

export default function BoardEditorPage() {
  const { toast } = useToast();
  const [position, setPosition] = useState<{ [key: string]: Piece | undefined }>({});
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [castling, setCastling] = useState({ wK: true, wQ: true, bK: true, bQ: true });
  const [enPassant, setEnPassant] = useState('');
  const [halfMoves, setHalfMoves] = useState(0);
  const [fullMoves, setFullMoves] = useState(1);
  const [draggingPiece, setDraggingPiece] = useState<{piece: Piece, mouseX: number, mouseY: number} | null>(null);

  const fen = useMemo(() => {
    let piecePlacement = '';
    let emptyCount = 0;
    for (let i = 8; i >= 1; i--) {
      emptyCount = 0;
      for (let j = 0; j < 8; j++) {
        const square = (String.fromCharCode(97 + j) + i) as Square;
        if (position[square]) {
          if (emptyCount > 0) {
            piecePlacement += emptyCount;
            emptyCount = 0;
          }
          const piece = position[square]!;
          piecePlacement += piece[0] === 'w' ? piece[1].toUpperCase() : piece[1].toLowerCase();
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        piecePlacement += emptyCount;
      }
      if (i > 1) {
        piecePlacement += '/';
      }
    }
    
    const castlingStr = 
        (castling.wK ? 'K' : '') +
        (castling.wQ ? 'Q' : '') +
        (castling.bK ? 'k' : '') +
        (castling.bQ ? 'q' : '') || '-';
        
    const enPassantStr = enPassant || '-';

    return `${piecePlacement} ${turn} ${castlingStr} ${enPassantStr} ${halfMoves} ${fullMoves}`;
  }, [position, turn, castling, enPassant, halfMoves, fullMoves]);

  const onDrop = (sourceSquare: Square, targetSquare: Square, piece: Piece) => {
    // Piece is from board
    const newPosition = { ...position };
    delete newPosition[sourceSquare];
    newPosition[targetSquare] = piece;
    setPosition(newPosition);
    return true;
  };
  
  const handlePieceDragBegin = (e: React.DragEvent, piece: Piece) => {
      e.dataTransfer.effectAllowed = 'move';
      // Pass a dummy piece type that react-chessboard understands but we can identify
      e.dataTransfer.setData('text/plain', piece);
      document.body.style.cursor = 'grabbing';
  }

  const handleClearBoard = () => {
    setPosition({});
  };
  
  const handleCopyFen = () => {
    navigator.clipboard.writeText(fen);
    toast({
      title: "FEN Copied!",
      description: "The FEN string has been copied to your clipboard.",
    });
  }
  
  const onSquareClick = (square: Square) => {
    const newPosition = {...position};
    // If a piece is being "dragged" from the palette, place it.
    if (draggingPiece) {
      if (newPosition[square] === draggingPiece.piece) {
        delete newPosition[square];
      } else {
        newPosition[square] = draggingPiece.piece;
      }
    } else {
       // If no piece from palette, just remove the piece on the square
       if (newPosition[square]) {
           delete newPosition[square];
       }
    }
    setPosition(newPosition);
  }

  const onPieceDragBegin = (piece: Piece, sourceSquare: Square) => {
    // Prevent board piece drag if a palette piece is selected
    if (draggingPiece) {
      return false;
    }
    return true;
  }
  
  const onPieceDrop = (source: Square, target: Square, piece: Piece) => {
     // This is only for internal board drops, not from the palette
     const newPosition = {...position};
     delete newPosition[source];
     newPosition[target] = piece;
     setPosition(newPosition);
     return true;
  };

  return (
    <div 
        className="flex-1 space-y-4 p-4 sm:p-8 pt-6"
        onMouseUp={() => setDraggingPiece(null)}
        onMouseMove={(e) => {
            if (draggingPiece) {
                setDraggingPiece(prev => prev ? {...prev, mouseX: e.clientX, mouseY: e.clientY } : null);
            }
        }}
    >
      {draggingPiece && (
         <div 
            className="pointer-events-none absolute z-50"
            style={{ left: draggingPiece.mouseX - 30, top: draggingPiece.mouseY - 30, width: 60 }}
         >
             <img src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${draggingPiece.piece}.png`} alt="piece" />
         </div>
      )}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Board Editor</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
                <div className="w-full aspect-square">
                  <Chessboard
                    position={position}
                    onPieceDrop={onPieceDrop}
                    onSquareClick={onSquareClick}
                    onPieceDragBegin={onPieceDragBegin}
                    customBoardStyle={{ borderRadius: '4px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
                  />
                </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Setup Position</CardTitle>
              <CardDescription>Drag pieces to the board to create a custom position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-6 gap-2 rounded-md bg-muted p-2">
                    {pieces.map(p => (
                       <div key={p} className="aspect-square cursor-grab"
                         onMouseDown={(e) => setDraggingPiece({piece: p, mouseX: e.clientX, mouseY: e.clientY})}
                       >
                         <img src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p}.png`} alt={p} />
                       </div>
                    ))}
                </div>
                 <Button variant="outline" className="w-full" onClick={handleClearBoard}>
                    <Trash2 className="mr-2" /> Clear Board
                 </Button>
            </CardContent>
          </Card>
           <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Game State</CardTitle>
                    <CardDescription>Configure turns, castling, and the resulting FEN.</CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Turn</Label>
                        <RadioGroup defaultValue="w" onValueChange={(v: 'w' | 'b') => setTurn(v)} className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="w" id="turn-w" />
                                <Label htmlFor="turn-w">White to move</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="b" id="turn-b" />
                                <Label htmlFor="turn-b">Black to move</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>Castling Rights</Label>
                       <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="wk" checked={castling.wK} onCheckedChange={checked => setCastling(p => ({ ...p, wK: !!checked }))} />
                            <Label htmlFor="wk">White Kingside (K)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="wq" checked={castling.wQ} onCheckedChange={checked => setCastling(p => ({ ...p, wQ: !!checked }))} />
                            <Label htmlFor="wq">White Queenside (Q)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="bk" checked={castling.bK} onCheckedChange={checked => setCastling(p => ({ ...p, bK: !!checked }))} />
                            <Label htmlFor="bk">Black Kingside (k)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="bq" checked={castling.bQ} onCheckedChange={checked => setCastling(p => ({ ...p, bQ: !!checked }))} />
                            <Label htmlFor="bq">Black Queenside (q)</Label>
                          </div>
                       </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="fen">FEN String</Label>
                        <div className="flex gap-2">
                          <Input id="fen" readOnly value={fen} className="font-mono text-xs" />
                          <Button variant="outline" size="icon" onClick={handleCopyFen}>
                            <Copy className="h-4 w-4"/>
                          </Button>
                        </div>
                    </div>
                 </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
