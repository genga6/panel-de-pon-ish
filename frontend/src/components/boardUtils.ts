import { Board, Cell } from './gameTypes';
import { COLORS, ROWS, COLS, INITIAL_EMPTY_ROWS } from './gameConfig';


export function generateInitialBoard(): Board {
	const board: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

	for (let r = INITIAL_EMPTY_ROWS; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			let color: Cell;
			do {
				color = Math.floor(Math.random() * COLORS.length) + 1;
			} while (
				(c >= 2 && color === board[r][c - 1] && color === board[r][c - 2]) ||
				(r >= 2 && color === board[r - 1][c] && color === board[r - 2][c])
			);
			board[r][c] = color;
		}
	}
	return board;
}

export const cloneBoard = (board: Board): Board =>	board.map(row => [...row]);

export function detectMatches(board: Board): [number, number][][] {
	const toErase: [number, number][][] = [];

	// horizontal
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS - 2;) {
			const color = board[r][c];
			if (color !== 0 && color === board[r][c + 1] && color === board[r][c + 2]) {
				const group: [number, number][] = [];
				let k = c;
				while (k < COLS && board[r][k] === color) {
					group.push([r, k]);
					k++;
				}
				toErase.push(group);
				c = k;
			} else {
				c++;
			}
		}
	}

	// vertical
	for (let c = 0; c < COLS; c++) {
		for (let r = 0; r < ROWS - 2; ) {
			const color = board[r][c];
			if (color !== 0 && color === board[r + 1][c] && color === board[r + 2][c]) {
				const group: [number, number][] = [];
				let k = r;
				while (k < ROWS && board[k][c] === color) {
					group.push([k, c]);
					k++;
				}
				toErase.push(group);
				r = k;
			} else {
				r++;
			}
		}
	}
	return toErase;
}

export function applyGravity(board: Board) {
	for (let c = 0; c < COLS; c++) {
		let write = ROWS - 1;
		for (let r = ROWS - 1; r >= 0; r--) {
			if (board[r][c] !== 0) {
				if (write !== r) {
					board[write][c] = board[r][c];
					board[r][c] = 0;
				}
				write--;
			}
		}
	}
}
