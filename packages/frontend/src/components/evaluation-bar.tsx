'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface EvaluationBarProps {
  evaluation: number; // Centipawn evaluation
}

// This function maps the centipawn evaluation to a percentage for the bar.
// A value of +1000 (10 pawns) or more is considered a 99% advantage for white.
// A value of -1000 or less is a 99% advantage for black.
const getWhiteHeightPercentage = (evaluation: number): number => {
  const advantage = Math.max(-1000, Math.min(1000, evaluation));
  const normalized = (advantage + 1000) / 2000; // a value between 0 and 1
  return Math.round(normalized * 100);
};

export function EvaluationBar({ evaluation }: EvaluationBarProps) {
  const whiteHeightPercent = getWhiteHeightPercentage(evaluation);
  const evalInPawns = (evaluation / 100).toFixed(1);

  return (
    <div className="relative flex h-full w-6 flex-col overflow-hidden rounded-md bg-gray-600">
      <div
        className="absolute left-0 bottom-0 w-full bg-white transition-all duration-300"
        style={{ 
            height: `${whiteHeightPercent}%`,
        }}
      />
      <div className="relative z-10 flex h-full w-full flex-col justify-end p-1">
        <span
          className={cn(
            'transform text-center text-xs font-bold',
            whiteHeightPercent > 50 ? 'text-black' : 'text-white'
          )}
        >
          {evalInPawns}
        </span>
      </div>
    </div>
  );
}
