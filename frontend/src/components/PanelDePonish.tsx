import React, { useEffect, useRef, useState } from 'react';

const COLS = 6;
const ROWS = 12;
const RISE_INTERVAL_MS = 4_000;
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500'];

type Cell = number;
type Board = Cell[][];

function randomColor(): Cell {
	return Math.floor(Math.random() * COLORS.length) + 1;
}

function createRandomRow(): Cell[] {
	return Array.from({ length: COLS }, () => randomColor());
}

function initializeBoard(): Board {
	const board: Board = [];
	for (let i = 0; i < ROWS; i++) {
		board.push(createRandomRow());
	}
	return board;
}

function cloneBoard(board: Board): Board {
	return board.map(row => [...row]);
}

function detectMatches(board: Board): Set<string> {
	const matches = new Set<string>();
	// horizontal
	for (let r = 0; r < ROWS; r++) {
		let count = 1;
		for (let c = 1; c < COLS; c++) {
			if (board[r][c] !== 0 && board[r][c] === board[r][c-1]) {
				count++
				if (count >= 3 && (c === COLS - 1 || board[r][c] !== board[r][c+1])) {
					for (let k = 0; k < count; k++) {
						matches.add(`${r},${c-k}`);
					}
				}
			} else {
				count = 1;
			}
		}
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    let count = 1;
    for (let r = 1; r < ROWS; r++) {
      if (board[r][c] !== 0 && board[r][c] === board[r-1][c]) {
        count++;
        if (count >= 3 && (r === ROWS -1 || board[r][c] !== board[r+1][c])) {
          for (let k = 0; k < count; k++) {
            matches.add(`${r-k},${c}`);
          }
        }
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

const PanelDePonish: React.FC = () => {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const swap = (b: Board, pos1: { r: number; c: number }, pos2: {r: number; c: number }) => {
    const temp = b[pos1.r][pos1.c];
    b[pos1.r][pos1.c] = b[pos2.r][pos2.c];
    b[pos2.r][pos2.c] = temp;
  };

  const handleCellClick = (r: number, c: number) => {
    if (!running) return;
    if (!selected) {
      setSelected({ r, c });
      return;
    }
    const { r: r0, c: c0 } = selected;
    const isAdjacent = 
			(Math.abs(r0 - r) === 1 && c0 === c) || 
			(Math.abs(c0 - c) === 1 && r0 === r);

    if (!isAdjacent) {
      setSelected({ r, c });
      return;
    }
      const newBoard = cloneBoard(board);
      swap(newBoard, selected, { r, c });
      resolveBoard(newBoard);
      setSelected(null);
  };

  const resolveBoard = (b: Board) => {
		let matches = detectMatches(b);
    while (matches.size > 0) {
      matches.forEach(key => {
        const [r, c] = key.split(',').map(Number);
        b[r][c] = 0;
      });
      applyGravity(b);
      matches = detectMatches(b);
    }
    setBoard(cloneBoard(b));
  };

  const rise = () => {
    setBoard(prev => {
			const newRow = createRandomRow();
			const next = [...prev.slice(1), newRow]
      if (next[0].some(cell => cell !== 0)) {
        if (intervalRef.current !== null) clearInterval(intervalRef.current);
        setRunning(false);
      }
      return next;
    });
  };

  const startGame = () => {
    setBoard(initializeBoard());
    setRunning(true);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(rise, RISE_INTERVAL_MS);
      return () => {
				if (intervalRef.current !== null) clearInterval(intervalRef.current);
			};
		}
  }, [running]);

  return (
    <div className='flex flex-col items-center gap-4 p-4'>
			<h1 className='text-2xl font-bold text-white drop-shadow-xl'>Panel&nbsp;de&nbsp;Ponish&nbsp;Mini</h1>
			<div
				className='grid gap-0 border-4 border-gray-700 rounded-2xl shadow-2xl'
				style={{ gridTemplateColumns: `repeat(${COLS}, 2.5rem)` }}
			>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className={`w-10 h-10 select-none ${cell ? COLORS[cell - 1] : 'bg-gray-800'} ${
                selected && selected.r === r && selected.c === c ? 'ring-4 ring-white ring-offset-2' : ''
              } transition-transform active:scale-90`}
            />
					))
				)}
			</div>
			<button
				onClick={startGame}
				className='px-4 py-2 rounded-2xl bg-fuchsia-600 text-white shadow-lg hover:scale-105 transition-transform'
			>
				{running ? 'Restart' : 'Start'}
			</button>
		</div>
	);
};

export default PanelDePonish