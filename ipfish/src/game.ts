import { NS, GoOpponent } from "@ns";
import { CurrentTurn } from "./getCurrentTurn";
import { getBoardFromAPI } from "./getBoardFromAPI"
import analysisWorker from "./worker/analysis?worker&inline"

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
  turn: CurrentTurn
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
  private workerInit : boolean = false

  constructor(ns : NS, opponent : GoOpponent, boardSize :  5 | 7 | 9 | 13) {
    this.ns = ns
    ns.go.resetBoardState(opponent, boardSize)
    this.boardSize = ns.go.getBoardState().length as 5 | 7 | 9 | 13 | 19 // 19 is secret opponent
    this.boardHistory = [getBoardFromAPI(this.ns)]
    this.komi = this.ns.go.getGameState().komi
    this.turn = CurrentTurn.Black

    this.worker = new analysisWorker()
    ns.atExit(() => {
      if(this.worker !== undefined) this.worker.terminate()
    }, "Game")
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
        if (boardCallback !== undefined) {
          boardCallback(boardAfterWhiteMoved)
        }
        this.boardHistory.push(boardAfterWhiteMoved)
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

  public async passTurn(boardCallback? : (boardState: BoardState) => void, analysisCallBack? : (analysisState: Analysis) => void) {
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
      if(this.worker !== undefined) this.worker.terminate()
      this.ns.exit()
    }
  }

  public async analysis() : Promise<Analysis> {
    if (!this.workerInit) {
      const initalized = await new Promise((resolve, reject) => {
        if (this.worker === undefined) {
          reject("Worker non existent during init")
        } else {
          this.worker.onmessage = (event : MessageEvent<string>) => {
            resolve(event.data) 
          }
          this.worker.onerror = (event) => {
            reject(`Worker init onerror triggered ${event.message}`)
          }
          this.worker.onmessageerror = (event) => {
            reject(`Worker init onmessageerror triggered ${event.data}`)
          }
        }
      })
      this.ns.tprint(`Go worker ${initalized}`)
      this.workerInit = true
    }

    this.worker.postMessage({
      boardHistory: this.boardHistory,
      komi: this.komi,
      turn: this.turn,
    })
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
}
