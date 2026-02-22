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
  const { board } = state;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      style={{ display: "block", userSelect: "none" }}
    >
      {/* グリッド線 */}
      <line x1={CELL} y1={0} x2={CELL} y2={SIZE} stroke="#333" strokeWidth={2} />
      <line x1={CELL * 2} y1={0} x2={CELL * 2} y2={SIZE} stroke="#333" strokeWidth={2} />
      <line x1={0} y1={CELL} x2={SIZE} y2={CELL} stroke="#333" strokeWidth={2} />
      <line x1={0} y1={CELL * 2} x2={SIZE} y2={CELL * 2} stroke="#333" strokeWidth={2} />

      {/* セル */}
      {board.map((value, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        const x = col * CELL;
        const y = row * CELL;
        const isLast = lastMove?.position === i;
        const isEmpty = value === 0;
        const clickable = isInteractive && isEmpty;

        return (
          <g key={i}>
            {/* セル背景（lastMove のハイライト） */}
            <rect
              x={x}
              y={y}
              width={CELL}
              height={CELL}
              fill={isLast ? "#fffde7" : "white"}
              style={{ cursor: clickable ? "pointer" : "default" }}
              onClick={() => clickable && onMove({ position: i })}
            />

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

            {/* クリック可能セルのホバー領域 */}
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
