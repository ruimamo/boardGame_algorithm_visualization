import type { MiniBoardProps } from "../../types/game";

export const TicTacToeMiniBoard: React.FC<MiniBoardProps> = ({ state, size }) => {
  const { board } = state as { board: number[] };
  const cell = size / 3;

  const cx = (col: number) => col * cell + cell / 2;
  const cy = (row: number) => row * cell + cell / 2;
  const r = cell * 0.28;
  const arm = cell * 0.22;

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {/* グリッド線 */}
      <line x1={cell} y1={0} x2={cell} y2={size} stroke="#555" strokeWidth={0.8} />
      <line x1={cell * 2} y1={0} x2={cell * 2} y2={size} stroke="#555" strokeWidth={0.8} />
      <line x1={0} y1={cell} x2={size} y2={cell} stroke="#555" strokeWidth={0.8} />
      <line x1={0} y1={cell * 2} x2={size} y2={cell * 2} stroke="#555" strokeWidth={0.8} />

      {board.map((value, i) => {
        const row = Math.floor(i / 3);
        const col = i % 3;
        return (
          <g key={i}>
            {value === 1 && (
              <g>
                <line
                  x1={cx(col) - arm} y1={cy(row) - arm}
                  x2={cx(col) + arm} y2={cy(row) + arm}
                  stroke="#e53935" strokeWidth={1.5} strokeLinecap="round"
                />
                <line
                  x1={cx(col) + arm} y1={cy(row) - arm}
                  x2={cx(col) - arm} y2={cy(row) + arm}
                  stroke="#e53935" strokeWidth={1.5} strokeLinecap="round"
                />
              </g>
            )}
            {value === -1 && (
              <circle
                cx={cx(col)}
                cy={cy(row)}
                r={r}
                fill="none"
                stroke="#1e88e5"
                strokeWidth={1.5}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
