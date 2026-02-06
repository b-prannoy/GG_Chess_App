// Chess piece Unicode characters and SVG paths
export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
export type PieceColor = "w" | "b";
export type Piece = `${PieceColor}${PieceType}`;

// Unicode chess piece symbols
export const pieceUnicode: Record<Piece, string> = {
    wk: "♔",
    wq: "♕",
    wr: "♖",
    wb: "♗",
    wn: "♘",
    wp: "♙",
    bk: "♚",
    bq: "♛",
    br: "♜",
    bb: "♝",
    bn: "♞",
    bp: "♟",
};

// Piece values for display
export const pieceValues: Record<PieceType, number> = {
    k: 0,
    q: 9,
    r: 5,
    b: 3,
    n: 3,
    p: 1,
};

// Piece names for accessibility
export const pieceNames: Record<PieceType, string> = {
    k: "King",
    q: "Queen",
    r: "Rook",
    b: "Bishop",
    n: "Knight",
    p: "Pawn",
};

// Get piece display info
export function getPieceInfo(piece: string | null) {
    if (!piece) return null;

    const color = piece[0] as PieceColor;
    const type = piece[1] as PieceType;

    return {
        color,
        type,
        unicode: pieceUnicode[`${color}${type}` as Piece],
        value: pieceValues[type],
        name: pieceNames[type],
        isWhite: color === "w",
    };
}

// Files and ranks for board notation
export const files = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
export const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"] as const;

// Get square name from row/col (0-indexed)
export function getSquareName(row: number, col: number): string {
    return `${files[col]}${ranks[row]}`;
}

// Get row/col from square name
export function getSquarePosition(square: string): { row: number; col: number } {
    const file = square[0];
    const rank = square[1];
    return {
        col: files.indexOf(file as (typeof files)[number]),
        row: ranks.indexOf(rank as (typeof ranks)[number]),
    };
}

// Check if square is light or dark
export function isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 1;
}
