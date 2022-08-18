export interface Step {
  num: number;
  rowIndex: number;
  colIndex: number;
}

export interface AiNextStep extends Step {
  score: number;
}

export interface Rule {
  [key: string]: boolean;
}

// 棋盘规则
// num棋盘上的棋子，1表示走的棋，2表示被吃掉的棋，0表示空位
// killed表示被吃掉的棋子的坐标
export const checkLineRule: {
  [key: string]: { num: number; killed: number[] }[];
} = {
  二打一: [
    { num: 2110, killed: [0] },
    { num: 211, killed: [1] }, // 0211
    { num: 1120, killed: [2] },
    { num: 112, killed: [3] }, // 0112
  ],
  二打二: [
    { num: 2211, killed: [0, 1] },
    { num: 1122, killed: [2, 3] },
  ],
  二夹一: [
    { num: 1210, killed: [1] },
    { num: 121, killed: [2] }, // 0121
  ],
  二夹二: [{ num: 1221, killed: [1, 2] }],
  二挑二: [{ num: 2112, killed: [0, 3] }],
  一挑二: [
    { num: 2120, killed: [1] },
    { num: 212, killed: [2] }, // 0212
  ],
};

// 默认棋盘
// 每四个表示一行，每个数字表示一个棋子，0表示空位
// 大于0表示白棋，小于0表示黑棋
export const defaultBoard = [
  1, 2, 3, 4, 5, 0, 0, 6, -5, 0, 0, -6, -1, -2, -3, -4,
];

// 默认规则
export const defaultRule = {
  二打一: true,
  二打二: false,
  二夹一: false,
  二夹二: false,
  二挑二: false,
  一挑二: false,
} as Rule;

export class GameUtils {
  /**
   * 机器人走棋
   * @param board 棋盘
   * @param stepIsWhite 步骤是否是白棋
   * @param selfIsWhite 自己是否是白棋
   * @returns
   */
  static aiNextStep(
    board: number[],
    stepIsWhite: boolean,
    selfIsWhite: boolean,
    rule: Rule,
  ) {
    const maxDeep = 3; // 最大搜索深度
    const deepToRotio = (deep: number) => {
      return 1 / Math.pow(3, deep);
    }; // 深度系数，值越小，搜索深度影响越小
    const stepScore = 1; // 能走步骤得分，不能走就是负分
    const killScore = 10; // 吃掉对方棋子得分，被吃就是负分

    const aiNextSteps: AiNextStep[] = [];

    const calcAiNextStep = (
      board: number[],
      stepIsWhite: boolean,
      selfIsWhite: boolean,
      deep = 0,
      nextStepIndex = 0,
    ) => {
      let scoreScale = selfIsWhite === stepIsWhite ? 1 : -1; // 正反馈还是负反馈
      if (deep > 0) {
        scoreScale = scoreScale * deepToRotio(deep); // 根据深度计算系数
      }

      for (let i = 0; i < board.length; i++) {
        if (board[i] !== 0 && board[i] > 0 === stepIsWhite) {
          const rowIndex = Math.floor(i / 4);
          const colIndex = i % 4;
          const nextPositions = [
            [rowIndex - 1, colIndex],
            [rowIndex + 1, colIndex],
            [rowIndex, colIndex - 1],
            [rowIndex, colIndex + 1],
          ];
          for (const [nextRowIndex, nextColIndex] of nextPositions) {
            if (
              nextRowIndex >= 0 &&
              nextRowIndex < 4 &&
              nextColIndex >= 0 &&
              nextColIndex < 4 &&
              board[nextRowIndex * 4 + nextColIndex] === 0
            ) {
              if (deep === 0) {
                nextStepIndex =
                  aiNextSteps.push({
                    score: 0,
                    num: board[i],
                    rowIndex: nextRowIndex,
                    colIndex: nextColIndex,
                  }) - 1;
              }
              // 可以走，积步骤分
              aiNextSteps[nextStepIndex].score += scoreScale * stepScore;
              // 检查是否可以吃掉对方的棋子
              const nextBoard = [...board];
              nextBoard[rowIndex * 4 + colIndex] = 0;
              nextBoard[nextRowIndex * 4 + nextColIndex] = board[i];
              const killed = GameUtils.checkBoard(
                nextBoard,
                nextRowIndex,
                nextColIndex,
                rule,
              );
              // 每吃掉一个棋子，积一个吃子分
              aiNextSteps[nextStepIndex].score +=
                killed.length * scoreScale * killScore;

              if (deep < maxDeep) {
                for (const k of killed) {
                  nextBoard[k] = 0;
                }

                calcAiNextStep(
                  nextBoard,
                  !stepIsWhite,
                  selfIsWhite,
                  deep + 1,
                  nextStepIndex,
                );
              }
            } else if (deep !== 0) {
              // 不可以走，积负步骤分
              aiNextSteps[nextStepIndex].score -= scoreScale * stepScore;
            }
          }
        }
      }

      if (deep === 0) {
        // console.log(aiNextSteps);
        if (aiNextSteps.length > 1) {
          aiNextSteps.sort((a, b) => b.score - a.score);
        }
        return aiNextSteps[0];
      }
    };
    return calcAiNextStep(board, stepIsWhite, selfIsWhite);
  }

  /**
   * 检查棋盘上的棋子是否可以吃掉对方的棋子
   * @param board 棋盘
   * @param line 形成连线的棋子的坐标
   * @param stepIsWhite 当前步骤是否是白棋
   * @param rule 判定规则
   * @returns
   */
  static checkLine(
    board: number[],
    line: number[],
    stepIsWhite: boolean,
    rule: Rule,
  ) {
    let lineNum = 0;
    for (let i = 0; i < 4; i++) {
      if (board[line[i]] !== 0) {
        lineNum +=
          (stepIsWhite === board[line[i]] > 0 ? 1 : 2) * Math.pow(10, 3 - i);
      }
    }
    const killed: number[] = [];
    for (const [ruleKey, enable] of Object.entries(rule)) {
      if (enable === true) {
        checkLineRule[ruleKey].forEach((item) => {
          if (item.num === lineNum) {
            killed.push(...item.killed);
          }
        });
      }
    }
    return killed;
  }

  /**
   *
   * @param board 棋盘
   * @param rowIndex 走棋的行坐标
   * @param colIndex 走棋的列坐标
   * @param rule 规则
   * @returns
   */
  static checkBoard(
    board: number[],
    rowIndex: number,
    colIndex: number,
    rule: Rule,
  ) {
    const currentStepIsWhite = board[rowIndex * 4 + colIndex] > 0;
    // 检查当前行
    const hKilled = GameUtils.checkLine(
      board,
      [rowIndex * 4, rowIndex * 4 + 1, rowIndex * 4 + 2, rowIndex * 4 + 3],
      currentStepIsWhite,
      rule,
    );
    // 检查当前列
    const vKilled = GameUtils.checkLine(
      board,
      [colIndex, colIndex + 4, colIndex + 8, colIndex + 12],
      currentStepIsWhite,
      rule,
    );
    const killed = [
      ...hKilled.map((ci) => rowIndex * 4 + ci),
      ...vKilled.map((ri) => ri * 4 + colIndex),
    ];
    return killed;
  }

  /**
   * 检查局面是否结束，即反方没有可移动的棋子
   * @param board 棋盘
   * @param stepIsWhite 当前步骤是否白棋
   * @returns
   */
  static checkGameOver(board: number[], stepIsWhite: boolean) {
    let end = true;
    for (let i = 0; i < board.length; i++) {
      const item = board[i];
      const isOtherSide = stepIsWhite ? item < 0 : item > 0;

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
            return r >= 0 && r < 4 && c >= 0 && c < 4 && board[r * 4 + c] === 0;
          }) > -1;
        if (canMove) {
          end = false;
          break;
        }
      }
    }
    return end;
  }

  static log(board: number[]) {
    let str = '====\n';
    for (let i = 0; i < board.length; i++) {
      str += board[i] > 0 ? 'X' : board[i] < 0 ? 'Y' : 'O';
      if (i % 4 === 3) {
        str += '\n';
      }
    }
    console.log(str);
  }
}
