import { NS, GoOpponent } from "@ns";
import { get_analysis } from "@rust";

export type BoardState = Uint8Array

export interface AnalysisState {
  analysis: Float64Array
  bestMove: number
}

export interface GameState {
  board: BoardState
  turn: CurrentTurn
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
  public readonly board : BoardState 
  private ns : NS
  public readonly boardSize :  5 | 7 | 9 | 13 | 19

  constructor(ns : NS, opponent : GoOpponent, boardSize :  5 | 7 | 9 | 13) {
    this.ns = ns
    ns.go.resetBoardState(opponent, boardSize)
    this.boardSize = ns.go.getBoardState().length as 5 | 7 | 9 | 13 | 19 // 19 is secret opponent
    // if (boardSize !== 5) throw new Error('Only 5x5 boards are currently supported')
    this.board = new Uint8Array(boardSize**2)
    this.updateBoard()
  }

  private updateBoard() {
    const stringState = this.ns.go.getBoardState()
    let row = 0
    let column = 0
    for (const str of stringState) {
      column = 0
      for (const point of str) {
        const pointNumber = (column * this.boardSize) + row
        if (point === ".") this.board[pointNumber] = PointState.Empty
        else if (point === "X") this.board[pointNumber] = PointState.Black
        else if (point === "O") this.board[pointNumber] = PointState.White
        else if (point === "#") this.board[pointNumber] = PointState.Offline
        else throw new Error(`Invalid point data ${point} at position ${pointNumber}`)
        column++
      }
      row++
    }
  }

  public getGameState() : GameState {
    this.updateBoard()
    return {
      board: this.board,
      turn: getCurrentTurn(this.ns)
    }
  }

  // IMPORTANT: this is zero indexed
  public getPoint(row : number, column : number) : PointState {
    return this.board[this.boardSize * row + column]
  }

  public async makeMove(row : number, column : number, boardCallback? : (gameState: GameState) => void, analysisCallBack? : (analysisState: AnalysisState) => void) {
    try {
      const responsePromise = this.ns.go.makeMove(column, row)
      this.board[this.boardSize * row + column] = PointState.Black
      if (boardCallback !== undefined) {
        const newState = this.getGameState()
        boardCallback(newState)
      }
      const opponentMove = await responsePromise

      if(opponentMove.type === "move" && opponentMove.x !== null && opponentMove.y !== null) {
        this.board[opponentMove.y * this.boardSize + opponentMove.x] = PointState.White
        if (boardCallback !== undefined) {
          const newBoardState = this.getGameState()
          boardCallback(newBoardState)
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
    const analysis = get_analysis([this.board])
    const bestMove = 0
    this.ns.tprint(analysis)
    this.ns.exit()
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
