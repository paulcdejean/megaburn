import { NS, GoOpponent } from "@ns";
import { get_analysis } from "@rust";

type BoardSize = 5 | 7 | 9 | 13 | 19

export type BoardState = Uint8Array

export interface AnalysisState {
  analysis: Float64Array
  bestMove: number
}

export interface GameState {
  board: BoardState
  turn: CurrentTurn
  komi: number // This isn't just the starting komi, but also reflects currently captured stones and their effect on the score
}

export enum PointState {
  Empty = 1,
  Black = 2,
  White = 3,
  Offline = 4,
}

export enum CurrentTurn {
  Black = 1,
  White = 2,
  Inactive = 3,
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const goAlphabet = [...'abcdefghjklmnopqrstuvwxyz'];

// Represents only a single game of ipvgo
export class Game {
  private ns : NS
  public readonly boardSize :  5 | 7 | 9 | 13 | 19
  public readonly gameState : GameState

  constructor(ns : NS, opponent : GoOpponent, boardSize :  5 | 7 | 9 | 13) {
    this.ns = ns
    ns.go.resetBoardState(opponent, boardSize)
    this.boardSize = ns.go.getBoardState().length as 5 | 7 | 9 | 13 | 19 // 19 is secret opponent
    const gameState = this.ns.go.getGameState()
    this.gameState = {
      board: getBoardFromAPI(this.ns),
      turn: getCurrentTurn(this.ns),
      komi: gameState.blackScore - gameState.whiteScore - gameState.komi
    }
  }

  public updateGameState() {
    const gameState = this.ns.go.getGameState()
    this.gameState.board = getBoardFromAPI(this.ns)
    this.gameState.komi = gameState.blackScore - gameState.whiteScore - gameState.komi
    this.gameState.turn = getCurrentTurn(this.ns)
  }

  // IMPORTANT: this is zero indexed
  public getPoint(row : number, column : number) : PointState {
    return this.gameState.board[this.boardSize * row + column]
  }

  public async makeMove(row : number, column : number, boardCallback? : (gameState: GameState) => void, analysisCallBack? : (analysisState: AnalysisState) => void) {
    try {
      const responsePromise = this.ns.go.makeMove(column, row)
      this.gameState.board[this.boardSize * row + column] = PointState.Black
      const startingGameState = this.gameState
      if (boardCallback !== undefined) {
        boardCallback(startingGameState)
      }
      const opponentMove = await responsePromise

      if(opponentMove.type === "move" && opponentMove.x !== null && opponentMove.y !== null) {
        this.gameState.board[opponentMove.y * this.boardSize + opponentMove.x] = PointState.White
        const newGameState = this.gameState
        if (boardCallback !== undefined) {
          boardCallback(newGameState)
        }
        if (analysisCallBack !== undefined) {
          const newAnalaysisState = await this.getAnalysis()
          analysisCallBack(newAnalaysisState)
        }
      }
    } catch (e) {
      // Currently e is a string unfortunately
      // The string looks like this:
      // "RUNTIME ERROR
      // ipfish.js@home (PID - 37)
      // go.makeMove: The point 2,2 is occupied by a router, so you cannot place a router there
      // Stack:
      // ipfish.js:L73@Game.makeMove
      // ipfish.js:L124@onClick"
      const errorMessage = (e as string).replace(/[\s\S]*go\.makeMove: (.*)[\s\S]*/, "$1")
      this.ns.toast(errorMessage, this.ns.enums.ToastVariant.ERROR, 5000)
    }
  }

  public async getAnalysis() : Promise<AnalysisState> {
    // TODO make good
    const analysis = get_analysis([this.gameState.board])
    const bestMove = 0
    return {
      analysis: analysis,
      bestMove: bestMove
    }
  }
}

function getCurrentTurn(ns : NS) : CurrentTurn {
  const turnString = ns.go.getCurrentPlayer()
  if (turnString === "White") {
    return CurrentTurn.White
  } else if (turnString === "Black") {
    return CurrentTurn.Black
  } else {
    return CurrentTurn.Inactive
  }
}

function getBoardFromAPI(ns : NS) : BoardState {
  const stringState = ns.go.getBoardState()
  const boardSize = stringState.length as BoardSize
  const board = new Uint8Array(boardSize**2)
  
  let row = 0
  let column = 0
  for (const str of stringState) {
    column = 0
    for (const point of str) {
      const pointNumber = (column * boardSize) + row
      if (point === ".") board[pointNumber] = PointState.Empty
      else if (point === "X") board[pointNumber] = PointState.Black
      else if (point === "O") board[pointNumber] = PointState.White
      else if (point === "#") board[pointNumber] = PointState.Offline
      else throw new Error(`Invalid point data ${point} at position ${pointNumber}`)
      column++
    }
    row++
  }
  return board
}
