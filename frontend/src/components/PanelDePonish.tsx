import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

const COLS = 6;
const ROWS = 12;
const INITIAL_EMPTY_ROWS = 6;
const RISE_INTERVAL_MS = 3_000;
const CELL_SIZE_REM = 2.25;

const COLORS = [
  'bg-red-400', 
  'bg-blue-400', 
  'bg-yellow-400', 
  'bg-green-400', 
  'bg-purple-400'
] as const;

type Cell = number;
type Board = Cell[][];
type Pos = { r: number; c: number };

const randomColor = (): Cell => Math.floor(Math.random() * COLORS.length) + 1;

const createRandomRow = (): Cell[] => Array.from({ length: COLS }, () => randomColor());

function initializeBoard(): Board {
	return [
    ...Array.from({ length: INITIAL_EMPTY_ROWS },  () => Array(COLS).fill(0)), 
    ...Array.from({ length: ROWS - INITIAL_EMPTY_ROWS }, createRandomRow),
  ];
}

const cloneBoard = (board: Board): Board =>	board.map(row => [...row]);


function detectMatches(board: Board): Set<string> {
	const matches = new Set<string>();
	// horizontal
	for (let r = 0; r < ROWS; r++) {
		let count = 1;
		for (let c = 1; c < COLS; c++) {
			if (board[r][c] !== 0 && board[r][c] === board[r][c - 1]) {
				count++;
        const end = c === COLS - 1 || board[r][c] !== board[r][c + 1];
        if (count >=3 && end) for (let k = 0; k < count; k++) matches.add(`${r},${c - k}`);
			} else {
				count = 1;
			}
		}
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    let count = 1;
    for (let r = 1; r < ROWS; r++) {
      if (board[r][c] !== 0 && board[r][c] === board[r - 1][c]) {
        count++;
        const end = r === ROWS - 1 || board[r][c] !== board[r + 1][c];
        if (count >= 3 && end) for (let k = 0; k < count; k++) matches.add(`${r - k},${c}`);
      } else {
        count = 1;
      }
    }
  }
  return matches;
}

function applyGravity(board: Board): void {
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== 0) {
        if (writeRow !== r) {
          board[writeRow][c] = board[r][c];
          board[r][c] = 0;
        }
        writeRow--;
      }
    }
  }
}

function resolveBoardInPlace(b: Board) {
  let matches = detectMatches(b);
  while (matches.size > 0) {
    matches.forEach((key) => {
      const [r, c] = key.split(',').map(Number);
      b[r][c] = 0;
    });
    applyGravity(b);
    matches = detectMatches(b);
  }
}

const PanelDePonish: React.FC = () => {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [cursor, setCursor] = useState<Pos>({ r: ROWS - 1, c: 0 });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const swapAndResolve = (p1: Pos, p2: Pos) => {
    setBoard((prev) => {
      const next = cloneBoard(prev);
      [next[p1.r][p1.c], next[p2.r][p2.c]] = [next[p2.r][p2.c], next[p1.r][p1.c]];
      resolveBoardInPlace(next);
      return next;
    });
  };

  const rise = () => {
    setBoard((prev) => {
			const next = [...prev.slice(1), createRandomRow()];
      resolveBoardInPlace(next);
      if (next[0].some((cell) => cell !== 0)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setRunning(false);
      }
      return next;
    });
  };

  const startGame = () => {
    setBoard(initializeBoard());
    setCursor({ r: ROWS - 1, c: 0 });
    setRunning(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!running) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.keys)){
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
          swapAndResolve(cursor, { r: cursor.r, c: cursor.c + 1 }); 
          break;
      }
    }, 
    [running, cursor]
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
  }, [running]);

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
          gap: '1px', 
        }}
			>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const underCursor = r === cursor.r && (c === cursor.c || c === cursor.c + 1);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, Math.min(c, COLS - 2))}
                className={`aspect-square w-full transition-transform active:scale-90 border border-black/20 ${
                  cell ? COLORS[cell - 1] : 'bg-gray-800'
                } ${underCursor ? 'ring-2 ring-yellow-300' : ''}`}
              />
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