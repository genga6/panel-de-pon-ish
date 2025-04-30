import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { COLS, ROWS, CELL_SIZE_REM, RISE_INTERVAL_MS, COLORS } from './gameConfig';
import { Board, Cell, Pos } from './gameTypes';
import { generateInitialBoard, detectMatches, applyGravity, cloneBoard } from './boardUtils';


const PanelDePonish: React.FC = () => {
  const [board, setBoard] = useState<Board>(() => generateInitialBoard());
  const [cursor, setCursor] = useState<Pos>({ r: ROWS - 1, c: 0 });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const swapCells = useCallback((b: Board, p1: Pos, p2: Pos) => {
    [b[p1.r][p1.c], b[p2.r][p2.c]] = [b[p2.r][p2.c], b[p1.r][p1.c]];
  }, []);

  const resolveBoardAnimated = useCallback((current: Board) => {
    const matches = detectMatches(current);
    if (matches.length === 0) return;

    const next = cloneBoard(current);
    matches.flat().forEach(([r, c]) => (next[r][c] = 0));
    setBoard(cloneBoard(next));

    setTimeout(() => {
      applyGravity(next);
      setBoard(cloneBoard(next));
      resolveBoardAnimated(next);
    }, 220);
  }, []);

  const dropIfPossible = (b: Board) => applyGravity(b);

  const performSwap = useCallback(
    (p1: Pos, p2: Pos) => {
      setBoard((prev) => {
        const next = cloneBoard(prev);
        swapCells(next, p1, p2);
        dropIfPossible(next);
        return next;
      });

      setTimeout(() => 
        setBoard((b) => {
          resolveBoardAnimated(cloneBoard(b));
          return b;
        }), 
      0);
    }, 
    [swapCells, resolveBoardAnimated]
  );

  const rise = useCallback(() => {
    setBoard((prev) => {
			const next = [...prev.slice(1), Array.from({ length: COLS }, () => Math.floor(Math.random() * COLORS.length) + 1)];
      resolveBoardAnimated(next);
      if (next[0].some((x) => x !== 0)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
      }
      return cloneBoard(next);
    });
  }, [resolveBoardAnimated]);

  const startGame = () => {
    setBoard(generateInitialBoard());
    setCursor({ r: ROWS - 1, c: 0 });
    setRunning(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!running) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)){
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowLeft':
          setCursor((cur) => ({ ...cur, c: Math.max(0, cur.c - 1) }));
          break;
        case 'ArrowRight':
          setCursor((cur) => ({ ...cur, c: Math.min(COLS - 2, cur.c + 1) }));
          break;
        case 'ArrowUp':
          setCursor((cur) => ({ ...cur, r: Math.max(0, cur.r - 1) }));
          break;
        case 'ArrowDown':
          setCursor((cur) => ({ ...cur, r: Math.min(ROWS - 1, cur.r + 1) }));
          break;
        case 'Enter':
        case ' ':
          performSwap(cursor, { r: cursor.r, c: cursor.c + 1 }); 
          break;
      }
    }, 
    [running, cursor, performSwap]
  );

  useEffect(() => {
    if (running) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [running, handleKeyDown]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(rise, RISE_INTERVAL_MS);
      return () => intervalRef.current && clearInterval(intervalRef.current);
		};
  }, [running, rise]);

  const handleCellClick = (r: number, c: number) => {
    if (!running) return;
    if (c === COLS - 1) return;
    setCursor({ r, c });
  };

  return (
    <div className='flex flex-col items-center gap-6 p-6 select-none'>
			<h1 className='text-2xl font-bold text-gray-800'>Panel&nbsp;de&nbsp;Ponish&nbsp;Mini</h1>

			<div
				className='grid bg-gray-900 p-px rounded-2xl shadow-2xl'
				style={{ 
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE_REM}rem)`, 
          gridAutoRows: `${CELL_SIZE_REM}rem`, 
          gap: '1px', 
        }}
			>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const underCursor = r === cursor.r && (c === cursor.c || c === cursor.c + 1);
            return (
              <AnimatePresence key={`${r}-${c}`}>
                {cell !== 0 ? (
                  <motion.button
                    layout
                    onClick={() => handleCellClick(r, Math.min(c, COLS - 2))}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, transition: {duration: 0.2 } }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className={`
                      aspect-square w-full transition-transform active:scale-90 border border-black/20 
                      ${COLORS[cell - 1]} 
                      ${underCursor ? 'ring-2 ring-yellow-300' : ''}
                    `}
                  />
                ) : (
                  <div 
                  onClick={() => handleCellClick(r, Math.min(c, COLS - 2))}
                  className={`
                    "aspect=square w-full bg-gray-800/30 transition-transform
                    ${underCursor ? 'ring-2 ring-yellow-300' : ''} 
                  `}
                  />
                )}
              </AnimatePresence>
            );
          })
				)}
			</div>

			<button
				onClick={startGame}
				className='px-4 py-2 rounded-full bg-fuchsia-600 text-white shadow-lg hover:scale-105 transition-transform'
			>
				{running ? 'Restart' : 'Start'}
			</button>
		</div>
	);
};

export default PanelDePonish