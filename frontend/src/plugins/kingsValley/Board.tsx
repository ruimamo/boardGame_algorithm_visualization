import { useState, useMemo } from "react";
import type { BoardProps } from "../../types/game";

const CELL = 70;
const SIZE = CELL * 5;

type KVState = { board: number[][]; turn: number; denyKingMove: boolean };

const DIRECTIONS = [
  { dr: -1, dc:  0, key: "up" },
  { dr:  1, dc:  0, key: "down" },
  { dr:  0, dc: -1, key: "left" },
  { dr:  0, dc:  1, key: "right" },
  { dr: -1, dc: -1, key: "up-left" },
  { dr: -1, dc:  1, key: "up-right" },
  { dr:  1, dc: -1, key: "down-left" },
  { dr:  1, dc:  1, key: "down-right" },
] as const;

function getSlideDest(
  board: number[][], row: number, col: number, dr: number, dc: number,
  isKing: boolean, denyKingMove: boolean,
): { row: number; col: number } | null {
  if (isKing && denyKingMove) return null;
  const nr = row + dr, nc = col + dc;
  if (nr < 0 || nr > 4 || nc < 0 || nc > 4) return null;
  if (board[nr][nc] !== 0) return null;
  let r = row, c = col;
  while (r + dr >= 0 && r + dr <= 4 && c + dc >= 0 && c + dc <= 4 && board[r + dr][c + dc] === 0) {
    r += dr; c += dc;
  }
  if (!isKing && r === 2 && c === 2) return null; // ヴァッサルは中央に入れない
  return { row: r, col: c };
}

function getValidDests(
  board: number[][], row: number, col: number, turn: number, denyKingMove: boolean,
): Array<{ row: number; col: number; direction: string }> {
  const piece = board[row][col];
  if (piece === 0 || (turn === 1 && piece < 0) || (turn === -1 && piece > 0)) return [];
  const isKing = Math.abs(piece) === 2;
  return DIRECTIONS.flatMap(({ dr, dc, key }) => {
    const dest = getSlideDest(board, row, col, dr, dc, isKing, denyKingMove);
    return dest ? [{ ...dest, direction: key }] : [];
  });
}

const PLAYER1 = "#e53935";
const PLAYER2 = "#1e88e5";

function pieceColor(v: number) { return v > 0 ? PLAYER1 : PLAYER2; }

export const KingsValleyBoard: React.FC<BoardProps> = ({ state, onMove, isInteractive }) => {
  const { board, turn, denyKingMove } = state as KVState;
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  const validDests = useMemo(() => {
    if (!selected || !isInteractive) return [];
    return getValidDests(board, selected.row, selected.col, turn, denyKingMove);
  }, [selected, board, turn, denyKingMove, isInteractive]);

  const destMap = useMemo(
    () => new Map(validDests.map((d) => [`${d.row},${d.col}`, d.direction])),
    [validDests],
  );

  const handleCellClick = (row: number, col: number) => {
    if (!isInteractive) return;
    const piece = board[row][col];
    const isMyPiece = (turn === 1 && piece > 0) || (turn === -1 && piece < 0);
    const key = `${row},${col}`;

    if (selected) {
      if (destMap.has(key)) {
        onMove({ from_row: selected.row, from_col: selected.col, direction: destMap.get(key)! });
        setSelected(null);
      } else if (isMyPiece && !(row === selected.row && col === selected.col)) {
        setSelected({ row, col });
      } else {
        setSelected(null);
      }
    } else if (isMyPiece) {
      setSelected({ row, col });
    }
  };

  return (
    <svg
      width={SIZE}
      height={SIZE}
      style={{ display: "block", userSelect: "none", background: "white" }}
    >
      {/* セル背景 */}
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => {
          const isCenter = r === 2 && c === 2;
          const isSelected = selected?.row === r && selected?.col === c;
          const isDest = destMap.has(`${r},${c}`);
          const fill = isSelected ? "#fff9c4"
            : isDest ? "#c8e6c9"
            : isCenter ? "#fff3e0"
            : "white";
          return (
            <rect
              key={`bg-${r}-${c}`}
              x={c * CELL} y={r * CELL}
              width={CELL} height={CELL}
              fill={fill}
              stroke="#ccc" strokeWidth={1}
            />
          );
        })
      )}

      {/* グリッド線（外枠） */}
      <rect x={0} y={0} width={SIZE} height={SIZE} fill="none" stroke="#333" strokeWidth={2} />

      {/* ピース */}
      {board.map((row, r) =>
        row.map((v, c) => {
          if (v === 0) return null;
          const cx = c * CELL + CELL / 2;
          const cy = r * CELL + CELL / 2;
          const color = pieceColor(v);
          const isKing = Math.abs(v) === 2;
          return (
            <g key={`piece-${r}-${c}`}>
              <circle cx={cx} cy={cy} r={isKing ? 26 : 20} fill={color} />
              {isKing && (
                <text
                  x={cx} y={cy + 5}
                  textAnchor="middle" fontSize={16} fontWeight="bold"
                  fill="white" style={{ pointerEvents: "none" }}
                >
                  K
                </text>
              )}
            </g>
          );
        })
      )}

      {/* クリック領域 */}
      {Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 5 }, (_, c) => (
          <rect
            key={`click-${r}-${c}`}
            x={c * CELL} y={r * CELL}
            width={CELL} height={CELL}
            fill="transparent"
            style={{ cursor: isInteractive ? "pointer" : "default" }}
            onClick={() => handleCellClick(r, c)}
          />
        ))
      )}
    </svg>
  );
};
