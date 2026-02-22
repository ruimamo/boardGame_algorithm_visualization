/** ゲーム盤面の状態（三目並べ: 長さ9, 0=空, 1=X, -1=O） */
export type GameBoardState = {
  board: number[];
};

/** 手の表現（三目並べ: position=0〜8） */
export type MoveDict = {
  position: number;
};

/** 終局結果 */
export type GameResult = {
  winner: 1 | -1 | 0; // 1=先手勝ち, -1=後手勝ち, 0=引き分け
};
