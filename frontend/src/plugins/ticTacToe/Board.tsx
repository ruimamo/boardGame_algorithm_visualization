import type { BoardProps } from "../../types/game";

const CELL = 80;
const SIZE = CELL * 3;

const cx = (col: number) => col * CELL + CELL / 2;
const cy = (row: number) => row * CELL + CELL / 2;

export const TicTacToeBoard: React.FC<BoardProps> = ({
  state,
  onMove,
  isInteractive,
  lastMove,
}) => {
  const { board } = state as { board: number[] };
  const lastPos = (lastMove as { position?: number } | null | undefined)?.position;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      style={{ display: "block", userSelect: "none", background: "white" }}
    >
      {/* 1. lastMove のハイライト背景（グリッド線の下） */}
      {board.map((_, i) => {
        if (lastPos !== i) return null;
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <rect
            key={`bg-${i}`}
            x={col * CELL}
            y={row * CELL}
            width={CELL}
            height={CELL}
            fill="#fffde7"
          />
        );
      })}

      {/* 2. グリッド線 */}
      <line x1={CELL}     y1={0}    x2={CELL}     y2={SIZE} stroke="#333" strokeWidth={2} />
      <line x1={CELL * 2} y1={0}    x2={CELL * 2} y2={SIZE} stroke="#333" strokeWidth={2} />
      <line x1={0}    y1={CELL}     x2={SIZE} y2={CELL}     stroke="#333" strokeWidth={2} />
      <line x1={0}    y1={CELL * 2} x2={SIZE} y2={CELL * 2} stroke="#333" strokeWidth={2} />

      {/* 3. X / O の記号 + クリック領域 */}
      {board.map((value, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = col * CELL;
        const y = row * CELL;
        const isEmpty = value === 0;
        const clickable = isInteractive && isEmpty;

        return (
          <g key={i}>
            {/* X（先手） */}
            {value === 1 && (
              <g>
                <line
                  x1={cx(col) - 22} y1={cy(row) - 22}
                  x2={cx(col) + 22} y2={cy(row) + 22}
                  stroke="#e53935" strokeWidth={6} strokeLinecap="round"
                />
                <line
                  x1={cx(col) + 22} y1={cy(row) - 22}
                  x2={cx(col) - 22} y2={cy(row) + 22}
                  stroke="#e53935" strokeWidth={6} strokeLinecap="round"
                />
              </g>
            )}

            {/* O（後手） */}
            {value === -1 && (
              <circle
                cx={cx(col)}
                cy={cy(row)}
                r={24}
                fill="none"
                stroke="#1e88e5"
                strokeWidth={6}
              />
            )}

            {/* クリック領域 */}
            {clickable && (
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={() => onMove({ position: i })}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
