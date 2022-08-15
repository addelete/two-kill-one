import { defineStore } from 'pinia';

export type PieceType = {
  rowIndex: number;
  colIndex: number;
  isWhite: boolean;
  num: number;
};

export type PieceMoveData = { num: number; x: number; y: number };

export type GameFrameData = {
  steps?: number;
  board?: number[];
  selfIsWhite?: boolean;
  stepIsWhite?: boolean;
  onlyOnePieceStep?: number;
  gameIsEnd?: boolean;
  gameEndBecause?: string;
};

const defaultBoard = [1, 2, 3, 4, 5, 0, 0, 6, -5, 0, 0, -6, -1, -2, -3, -4]

export const useGameStore = defineStore('game', {
  state: () => {
    return {
      steps: 0,
      board: [...defaultBoard],
      boardSize: Math.min(window.innerWidth, window.innerHeight, 640) - 20,
      piecesRedraw: Math.random(), // 重绘
      selfIsWhite: false, // 自己是白方
      stepIsWhite: false, // 轮到白方走棋
      onlyOnePieceStep: 0, // 某方只剩一个棋子，大于0表示白方，小于0表示黑方，绝对值表示步数
      gameIsEnd: false, // 游戏是否结束
      gameEndBecause: '', // 游戏结束的原因
    };
  },
  getters: {
    boardEdgeSize: (state) => state.boardSize * 0.04,
    boardGridSize: (state) => state.boardSize * 0.23,
    pieceRadius: (state) => state.boardSize * 0.092,
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
      const pieceNumTran = (pieceNum: number) => {
        if (pieceNum === 0) {
          return 'O';
        } else if (pieceNum > 0) {
          return this.stepIsWhite ? 'X' : 'Y';
        } else {
          return this.stepIsWhite ? 'Y' : 'X';
        }
      };
      // 检查一行或一列的棋形，如果符合规则，吃掉反方棋子
      const checkLine = (line: number[]) => {
        const lineStr = line.map((i) => pieceNumTran(this.board[i])).join('');
        const killed: number[] = [];
        if (
          [
            'YXXO',
            'OYXX',
            'XXYO',
            'OXXY',
            // 'YXXY',
            // 'XXYY',
            // 'YYXX',
            // 'OYXY',
            // 'YXYO',
          ].includes(lineStr)
        ) {
          lineStr.split('').forEach((piece, index) => {
            if (piece === 'Y') {
              killed.push(line[index]);
            }
          });
        }
        return killed;
      };
      // 检查当前行
      const hKilled = checkLine([
        rowIndex * 4,
        rowIndex * 4 + 1,
        rowIndex * 4 + 2,
        rowIndex * 4 + 3,
      ]);
      // 检查当前列
      const vKilled = checkLine([
        colIndex,
        colIndex + 4,
        colIndex + 8,
        colIndex + 12,
      ]);
      // 将被吃掉的棋子从棋盘上移除
      [...hKilled, ...vKilled].forEach((killed) => {
        this.board[killed] = 0;
      });

      // 检查局面是否结束，即反方没有可移动的棋子
      // 如果能找到一个反方棋子，且该棋子能移动，则不结束
      let end = true;
      for (let i = 0; i < this.board.length; i++) {
        const item = this.board[i];
        const isOtherSide = this.stepIsWhite ? item < 0 : item > 0;

        if (isOtherSide) {
          const rowIndex = Math.floor(i / 4);
          const colIndex = i % 4;
          const canMove =
            [
              [rowIndex - 1, colIndex],
              [rowIndex + 1, colIndex],
              [rowIndex, colIndex - 1],
              [rowIndex, colIndex + 1],
            ].findIndex(([r, c]) => {
              return (
                r >= 0 &&
                r < 4 &&
                c >= 0 &&
                c < 4 &&
                this.board[r * 4 + c] === 0
              );
            }) > -1;
          if (canMove) {
            end = false;
            break;
          }
        }
      }
      if (end) {
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
  },
});
