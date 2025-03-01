import { NS, GoOpponent } from "@ns";
import { CurrentTurn, getCurrentTurn } from "./getCurrentTurn";
import { getBoardFromAPI } from "./getBoardFromAPI"
import { getAnalysis } from "./getAnalysis";

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
      this.updateGameState()
      if (boardCallback !== undefined) {
        boardCallback(this.gameState)
      }
      const opponentMove = await responsePromise
      this.updateGameState()

      if(opponentMove.type === "move" && opponentMove.x !== null && opponentMove.y !== null) {
        this.gameState.board[opponentMove.y * this.boardSize + opponentMove.x] = PointState.White
        if (boardCallback !== undefined) {
          boardCallback(this.gameState)
        }
        if (analysisCallBack !== undefined) {
          const newAnalaysisState = await getAnalysis(this.gameState)
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
}
