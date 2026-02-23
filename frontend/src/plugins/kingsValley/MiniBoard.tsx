import type { MiniBoardProps } from "../../types/game";

type KVState = { board: number[][] };

const PLAYER1 = "#e53935";
const PLAYER2 = "#1e88e5";

export const KingsValleyMiniBoard: React.FC<MiniBoardProps> = ({ state, size }) => {
  const { board } = state as KVState;
  const cell = size / 5;

  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {/* 中央マス背景 */}
      <rect
        x={cell * 2} y={cell * 2}
        width={cell} height={cell}
        fill="#fff3e0"
      />

      {/* グリッド線 */}
      {Array.from({ length: 4 }, (_, i) => (
        <g key={i}>
          <line x1={(i + 1) * cell} y1={0} x2={(i + 1) * cell} y2={size} stroke="#ccc" strokeWidth={0.5} />
          <line x1={0} y1={(i + 1) * cell} x2={size} y2={(i + 1) * cell} stroke="#ccc" strokeWidth={0.5} />
        </g>
      ))}
      <rect x={0} y={0} width={size} height={size} fill="none" stroke="#aaa" strokeWidth={0.8} />

      {/* ピース */}
      {board.map((row, r) =>
        row.map((v, c) => {
          if (v === 0) return null;
          const cx = c * cell + cell / 2;
          const cy = r * cell + cell / 2;
          const color = v > 0 ? PLAYER1 : PLAYER2;
          const isKing = Math.abs(v) === 2;
          return (
            <g key={`${r}-${c}`}>
              <circle cx={cx} cy={cy} r={isKing ? cell * 0.36 : cell * 0.28} fill={color} />
              {isKing && (
                <text
                  x={cx} y={cy + cell * 0.12}
                  textAnchor="middle"
                  fontSize={cell * 0.4}
                  fontWeight="bold"
                  fill="white"
                  style={{ pointerEvents: "none" }}
                >
                  K
                </text>
              )}
            </g>
          );
        })
      )}
    </svg>
  );
};
