type NextStepData = {
  score: number;
  num: number;
  nextRowIndex: number;
  nextColIndex: number;
};

let nextSteps: NextStepData[] = [];

export function aiNextStep(
  board: number[],
  stepIsWhite: boolean,
  selfIsWhite: boolean,
  deep = 0,
  nextStepIndex = 0,
) {
  if (deep === 0) {
    nextSteps = [];
  }
  let scoreScale = selfIsWhite === stepIsWhite ? 1 : -1; // 正反馈还是负反馈

  if (deep > 0) {
    scoreScale = scoreScale / Math.pow(3, deep);
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
              nextSteps.push({
                score: 0,
                num: board[i],
                nextRowIndex,
                nextColIndex,
              }) - 1;
          }
          // 可以走，积1分
          nextSteps[nextStepIndex].score += scoreScale * 1;
          // 检查是否可以吃掉对方的棋子，吃掉一个棋子，积5分
          const nextBoard = [...board];
          nextBoard[rowIndex * 4 + colIndex] = 0;
          nextBoard[nextRowIndex * 4 + nextColIndex] = board[i];
          const killed = checkBoard(
            nextBoard,
            nextRowIndex,
            nextColIndex,
            stepIsWhite,
          );
          nextSteps[nextStepIndex].score += killed.length * scoreScale * 10;

          if (deep < 3) {
            for (const k of killed) {
              nextBoard[k] = 0;
            }

            aiNextStep(
              nextBoard,
              !stepIsWhite,
              selfIsWhite,
              deep + 1,
              nextStepIndex,
            );
          }
        } else if (deep !== 0) {
          // 不可以走，积-1分
          nextSteps[nextStepIndex].score += scoreScale * -1;
        }
      }
    }
  }

  if (deep === 0) {
    if (nextSteps.length > 1) {
      nextSteps.sort((a, b) => b.score - a.score);
      return Math.random() > 0.2 ? nextSteps[0] : nextSteps[1];
    }
    return nextSteps[0];
  }
}

const checkLineRules = [
  { num: 12110, killed: [0] },
  { num: 10211, killed: [1] },
  { num: 11120, killed: [2] },
  { num: 10112, killed: [3] },
];

function checkLine(board: number[], line: number[], stepIsWhite: boolean) {
  let lineNum = 10000;
  for (let i = 0; i < 4; i++) {
    if (board[line[i]] !== 0) {
      lineNum +=
        (stepIsWhite === board[line[i]] > 0 ? 1 : 2) * Math.pow(10, 3 - i);
    }
  }
  for (let i = 0; i < checkLineRules.length; i++) {
    if (lineNum === checkLineRules[i].num) {
      return checkLineRules[i].killed;
    }
  }
  return [];
}

function checkBoard(
  board: number[],
  rowIndex: number,
  colIndex: number,
  stepIsWhite: boolean,
) {
  // 检查当前行
  const hKilled = checkLine(
    board,
    [rowIndex * 4, rowIndex * 4 + 1, rowIndex * 4 + 2, rowIndex * 4 + 3],
    stepIsWhite,
  );
  // 检查当前列
  const vKilled = checkLine(
    board,
    [colIndex, colIndex + 4, colIndex + 8, colIndex + 12],
    stepIsWhite,
  );
  const killed = [
    ...hKilled.map((ci) => rowIndex * 4 + ci),
    ...vKilled.map((ri) => ri * 4 + colIndex),
  ];
  return killed;
}
