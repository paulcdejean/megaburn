import { NS, GoOpponent } from "@ns";

export type BoardState = Uint8Array
export type EvaluationState = Float64Array

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

// Represents only a single game of ipvgo
export class Game {
  public readonly board : BoardState 
  private ns : NS
  public readonly boardSize :  5 | 7 | 9 | 13

  constructor(ns : NS, opponent : GoOpponent, boardSize :  5 | 7 | 9 | 13) {
    this.ns = ns
    ns.go.resetBoardState(opponent, boardSize)
    this.boardSize = boardSize

    const stringState = ns.go.getBoardState() // For some reason this does columns then rows smdh
    if (boardSize !== 5) throw new Error('Only 5x5 boards are currently supported')
    this.board = new Uint8Array(boardSize**2)
    let row = 1
    let column = 0
    for (const str of stringState) {
      column = 0
      for (const point of str) {
        const pointNumber = (column * 5) + row - 1
        if (point === ".") this.board[pointNumber] = PointState.Empty
        else if (point === "X") this.board[pointNumber] = PointState.Black
        else if (point === "O") this.board[pointNumber] = PointState.White
        else if (point === "#") this.board[pointNumber] = PointState.Offline
        else throw new Error(`Invalid point data ${point} at position ${row*column-1}`)
        column++
      }
      row++
    }
  }

  getGameState() : GameState {
    return {
      board: this.board,
      turn: getCurrentTurn(this.ns)
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
