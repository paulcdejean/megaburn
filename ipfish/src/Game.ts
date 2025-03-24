import { NS, GoOpponent } from "@ns";
import { CurrentTurn } from "./getCurrentTurn";
import { getBoardFromAPI } from "./getBoardFromAPI"


export type BoardState = Uint8Array

export enum PointState {
  Empty = 1,
  Black = 2,
  White = 3,
  Offline = 4,
}

export interface AnalaysisBoard {
  boardHistory : [BoardState],
  komi: number,
  turn: CurrentTurn,
  passed: boolean,
}


export interface Analysis {
  analysis: Float64Array
  bestMove: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const goAlphabet = [...'abcdefghjklmnopqrstuvwxyz'];

// Represents only a single game of ipvgo
export class Game {
  private ns : NS
  public readonly boardSize :  5 | 7 | 9 | 13 | 19
  public readonly boardHistory : [BoardState]
  public readonly komi : number
  public turn : CurrentTurn
  private worker : Worker
  private opponentPassed : boolean = false

  constructor(ns : NS, opponent : GoOpponent, boardSize :  5 | 7 | 9 | 13, worker : Worker) {
    this.ns = ns
    // Start a new game if there isn't one. Also start a new game if the current one is greater than 7x7.
    // This is because our rust currently only supports 5x5 and maybe 7x7.
    if (ns.go.getGameState().currentPlayer === "None" || ns.go.getBoardState().length > 7) {
      ns.go.resetBoardState(opponent, boardSize)
    }
    this.boardSize = ns.go.getBoardState().length as 5 | 7 | 9 | 13 | 19 // 19 is secret opponent
    this.boardHistory = [getBoardFromAPI(this.ns)]
    this.komi = this.ns.go.getGameState().komi
    this.turn = CurrentTurn.Black

    this.worker = worker
  }

  public getBoard() : BoardState {
    return this.boardHistory[this.boardHistory.length - 1]
  }

  // IMPORTANT: this is zero indexed
  public getPoint(row : number, column : number) : PointState {
    return this.getBoard()[this.boardSize * row + column]
  }

  public async makeMove(row : number, column : number, boardCallback? : (boardState: BoardState) => void, analysisCallBack? : (analysisState: Analysis) => void) {
    try {
      const responsePromise = this.ns.go.makeMove(column, row)
      const boardAfterBlackMoved = getBoardFromAPI(this.ns)
      if (boardCallback !== undefined) {
        boardCallback(boardAfterBlackMoved)
      }
      this.boardHistory.push(boardAfterBlackMoved)

      const opponentMove = await responsePromise
      const boardAfterWhiteMoved = getBoardFromAPI(this.ns)
      if(opponentMove.type === "move" && opponentMove.x !== null && opponentMove.y !== null) {
        this.opponentPassed = false
        if (boardCallback !== undefined) {
          boardCallback(boardAfterWhiteMoved)
        }
        this.boardHistory.push(boardAfterWhiteMoved)
      } else if(opponentMove.type === "pass") {
        this.opponentPassed = true
      }
      if (analysisCallBack !== undefined) {
        const newAnalaysisState = await this.analysis()
        analysisCallBack(newAnalaysisState)
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

  public async passTurn(boardCallback? : (boardState: BoardState) => void, analysisCallBack? : (analysisState: Analysis) => void) : Promise<boolean> {
    const opponentMove = await this.ns.go.passTurn()
    const boardAfterWhiteMoved = getBoardFromAPI(this.ns)
    if(opponentMove.type === "move" && opponentMove.x !== null && opponentMove.y !== null) {
      if (boardCallback !== undefined) {
        boardCallback(boardAfterWhiteMoved)
      }
      this.boardHistory.push(boardAfterWhiteMoved)
    }
    if (analysisCallBack !== undefined) {
      const newAnalaysisState = await this.analysis()
      analysisCallBack(newAnalaysisState)
    }

    if (this.ns.go.getCurrentPlayer() === "None") {
      return true
    }
    return false
  }

  private async realAnalysis() : Promise<Analysis> {
    const analysisBoard : AnalaysisBoard = {
      boardHistory: this.boardHistory,
      komi: this.komi,
      turn: this.turn,
      passed: this.opponentPassed,
    }

    this.worker.postMessage(analysisBoard)
    return new Promise((resolve, reject) => {
      if (this.worker === undefined) {
        reject("Worker non existent during analysis")
      } else {
        this.worker.onmessage = (event : MessageEvent<Analysis>) => {
          resolve(event.data) 
        }
        this.worker.onerror = (event) => {
          reject(`Worker onerror triggered ${event.message}`)
        }
        this.worker.onmessageerror = (event) => {
          reject(`Worker onmessageerror triggered ${event.data}`)
        }
      }
    })
  }

  public async analysis() : Promise<Analysis> {
    // const analysisStart = performance.now()
    const analysis = await this.realAnalysis()
    // const analysisTime = performance.now() - analysisStart
    // this.ns.tprint(`Completed analysis in ${this.ns.tFormat(analysisTime, true)}`)
    return analysis
  }
}
