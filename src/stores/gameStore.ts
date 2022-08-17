import { defineStore } from 'pinia';
import { CacheUtils } from '../utils/cache';
import { defaultBoard, defaultRule, GameUtils, Rule } from '../utils/game';

export type PieceType = {
  rowIndex: number;
  colIndex: number;
  isWhite: boolean;
  num: number;
};

export type PieceMoveData = { num: number; x: number; y: number };

export type GameFrameData = {
  rule: Rule;
  steps?: number;
  board?: number[];
  selfIsWhite?: boolean;
  stepIsWhite?: boolean;
  onlyOnePieceStep?: number;
  gameIsEnd?: boolean;
  gameEndBecause?: string;
};

export const useGameStore = defineStore('game', {
  state: () => {
    return {
      steps: 0,
      rule: CacheUtils.getItem('rule', defaultRule),
      board: [...defaultBoard],
      boardSize: Math.min(window.innerWidth, window.innerHeight, 640) - 20,
      piecesRedraw: Math.random(), // 重绘
      selfIsWhite: false, // 自己是白方
      stepIsWhite: false, // 轮到白方走棋
      onlyOnePieceStep: 0, // 某方只剩一个棋子，大于0表示白方，小于0表示黑方，绝对值表示步数
      gameIsEnd: false, // 游戏是否结束
      gameEndBecause: '', // 游戏结束的原因
      afterRuleChange: (rule: Rule) => {}, // 切换规则后的回调
    };
  },
  getters: {
    boardEdgeSize: (state) => state.boardSize * 0.04,
    boardGridSize: (state) => state.boardSize * 0.23,
    pieceRadius: (state) => state.boardSize * 0.092,
    ruleStr: (state) =>
      `${Object.keys(state.rule)
        .filter((key) => state.rule[key])
        .join('、')}`,
    pieces: (state) => {
      return state.board.reduce((result, piece, index) => {
        if (piece === 0) {
          return result;
        }
        const rowIndex = Math.floor(index / 4);
        const colIndex = index % 4;
        result.push({
          rowIndex,
          colIndex,
          isWhite: piece > 0,
          num: piece,
        });
        return result;
      }, [] as PieceType[]);
    },
  },

  actions: {
    /**
     * 处理棋子移动事件
     * @param data 移动后的位置和棋子编号
     * @param pieceNum 棋子编号
     */
    handlePieceMove(data: PieceMoveData) {
      const oldPointIndex = this.board.findIndex((piece) => piece === data.num);
      const oldRowIndex = Math.floor(oldPointIndex / 4);
      const oldColIndex = oldPointIndex % 4;

      const calcRowIndex = Math.min(
        3,
        Math.max(
          0,
          Math.round((data.y - this.boardEdgeSize) / this.boardGridSize),
        ),
      );

      const calcColIndex = Math.min(
        3,
        Math.max(
          0,
          Math.round((data.x - this.boardEdgeSize) / this.boardGridSize),
        ),
      );

      const newRowIndex = this.selfIsWhite ? 3 - calcRowIndex : calcRowIndex;
      const newColIndex = this.selfIsWhite ? 3 - calcColIndex : calcColIndex;

      const newPointIndex = newRowIndex * 4 + newColIndex;

      // 如果移动一格且此格没有棋子，则可以移动
      if (
        Math.abs(newRowIndex - oldRowIndex) +
          Math.abs(newColIndex - oldColIndex) ===
          1 &&
        this.board[newPointIndex] === 0
      ) {
        this.board[oldPointIndex] = 0;
        this.board[newPointIndex] = data.num;
        this.steps++;
        this.checkBoard(newRowIndex, newColIndex); // 检查棋盘是否结束
        if (
          !this.gameIsEnd &&
          this.onlyOnePieceStep !== 0 &&
          this.stepIsWhite === this.onlyOnePieceStep > 0
        ) {
          this.onlyOnePieceStep += this.onlyOnePieceStep > 0 ? 1 : -1;
          if (Math.abs(this.onlyOnePieceStep) === 11) {
            this.gameIsEnd = true;
            this.gameEndBecause = `${
              this.onlyOnePieceStep > 0 ? '白' : '黑'
            }方只剩一个棋子撑过10步，和棋`;
          }
        }
        if (!this.gameIsEnd) {
          this.checkOnlyOnePiece(); // 检查反方是否只剩一个棋子
          this.stepIsWhite = !this.stepIsWhite;
        }
      }

      this.piecesRedraw = Math.random();
    },

    /**
     * 检查局面
     * 判断是否结束，如果结束则更新gameIsEnd属性
     */
    checkBoard(rowIndex: number, colIndex: number) {
      const killed = GameUtils.checkBoard(
        this.board,
        rowIndex,
        colIndex,
        this.rule,
      );
      // 将被吃掉的棋子从棋盘上移除
      killed.forEach((killed) => {
        this.board[killed] = 0;
      });
      const isEnd = GameUtils.checkGameOver(this.board, this.selfIsWhite);
      if (isEnd) {
        this.gameIsEnd = true;
        this.gameEndBecause = `${this.stepIsWhite ? '白' : '黑'}方胜利，${
          this.stepIsWhite ? '黑' : '白'
        }方无可移动棋子`;
      }
    },

    /**
     * 检查对方是否仅剩一个棋子
     */
    checkOnlyOnePiece() {
      if (this.onlyOnePieceStep !== 0) {
        return;
      }
      const otherSideCount = this.board.filter((item) => {
        return this.stepIsWhite ? item < 0 : item > 0;
      }).length;
      if (otherSideCount === 1) {
        this.onlyOnePieceStep = this.stepIsWhite ? -1 : 1;
      }
    },

    /**
     * 重开游戏
     */
    handleRestart() {
      this.gameIsEnd = false;
      this.onlyOnePieceStep = 0;
      this.stepIsWhite = false;
      this.steps = 0;
      this.board = [...defaultBoard];
    },

    changeSelfColor() {
      if (this.steps === 0) {
        this.selfIsWhite = !this.selfIsWhite;
      }
    },

    /**
     * 根据帧同步信息，更新游戏
     */
    syncByFrameData(data: GameFrameData) {
      (Object.keys(data) as (keyof GameFrameData)[]).forEach((key) => {
        (this as any)[key] = data[key];
      });
    },

    toggleRuleItem(ruleKey: string) {
      this.rule[ruleKey] = !this.rule[ruleKey];
      if (typeof this.afterRuleChange === 'function') {
        this.afterRuleChange(this.rule);
      }
    },

    syncByRule(rule: Rule) {
      this.rule = rule;
    },

    setRuleChangeListener(callback: (rule: Rule) => void) {
      this.afterRuleChange = callback;
    },

    removeRuleChangeListener() {
      this.afterRuleChange = (rule: Rule) => {};
    },
  },
});
