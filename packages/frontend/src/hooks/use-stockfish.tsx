'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Stockfish = (typeof window !== 'undefined' && (window as any).Stockfish) 
  ? (window as any).Stockfish 
  : null;

export interface StockfishEvaluation {
  depth: number;
  score: number;
  pv: string;
  isMate: boolean;
}

export interface UseStockfishOptions {
  depth?: number;
  onEvaluation?: (evaluation: StockfishEvaluation) => void;
}

export function useStockfishEngine({ depth = 20, onEvaluation }: UseStockfishOptions = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evaluation, setEvaluation] = useState<StockfishEvaluation | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const depthRef = useRef(depth);

  useEffect(() => {
    depthRef.current = depth;
  }, [depth]);

  useEffect(() => {
    let worker: Worker | null = null;

    const initStockfish = () => {
      try {
        let w: Worker | null = null;
        
        if (Stockfish) {
          w = Stockfish();
        } else if (typeof window !== 'undefined') {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const sf = require('stockfish.js');
          w = sf();
        }

        if (!w) {
          console.warn('Stockfish not available');
          return;
        }

        workerRef.current = w;

        w.onmessage = (event: MessageEvent<string>) => {
          const line = event.data;
          
          if (line.startsWith('Stockfish')) {
            setIsReady(true);
            return;
          }

          const infoMatch = line.match(/info depth (\d+) .*score cp (-?\d+)/);
          if (infoMatch) {
            const evalDepth = parseInt(infoMatch[1], 10);
            const score = parseInt(infoMatch[2], 10) / 100;
            
            const evalResult: StockfishEvaluation = {
              depth: evalDepth,
              score,
              pv: '',
              isMate: line.includes('mate'),
            };

            const pvMatch = line.match(/pv (.+)/);
            if (pvMatch) {
              evalResult.pv = pvMatch[1];
            }

            setEvaluation(evalResult);
            onEvaluation?.(evalResult);
          }

          if (line.includes('bestmove')) {
            setIsAnalyzing(false);
          }
        };

        w.postMessage('uci');
      } catch (error) {
        console.error('Failed to load Stockfish:', error);
      }
    };

    initStockfish();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [onEvaluation]);

  const analyze = useCallback((fen: string) => {
    if (!workerRef.current || !isReady) return;

    setIsAnalyzing(true);
    workerRef.current.postMessage(`position fen ${fen}`);
    workerRef.current.postMessage(`go depth ${depthRef.current}`);
  }, [isReady]);

  const analyzePgn = useCallback((pgn: string) => {
    if (!workerRef.current || !isReady) return;

    setIsAnalyzing(true);
    workerRef.current.postMessage(`position startpos move ${pgn}`);
    workerRef.current.postMessage(`go depth ${depthRef.current}`);
  }, [isReady]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage('stop');
    setIsAnalyzing(false);
  }, []);

  const setDepth = useCallback((newDepth: number) => {
    depthRef.current = newDepth;
  }, []);

  return {
    isReady,
    isAnalyzing,
    evaluation,
    analyze,
    analyzePgn,
    stop,
    setDepth,
  };
}

export function useStockfish(options?: UseStockfishOptions) {
  return useStockfishEngine(options);
}