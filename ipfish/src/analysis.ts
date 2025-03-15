import { BoardState } from "./Game";
import { CurrentTurn } from "./getCurrentTurn";
import analysisWorker from "./worker/analysis?worker&inline"
import { NS } from "@ns";


export interface AnalysisState {
  analysis: Float64Array
  bestMove: number
}

export interface AnalaysisBoard {
  boardHistory : [BoardState],
  komi: number,
  turn: CurrentTurn
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Analysis {
  private static worker : Worker
   
  public static async get(ns: NS, analysisBoard : AnalaysisBoard) : Promise<AnalysisState> {
    if (this.worker === undefined) {
      this.worker = new analysisWorker()
      ns.atExit(() => {
        this.worker.terminate()
      }, "Analysis")

      const initalized = await new Promise((resolve, reject) => {
        this.worker.onmessage = (event : MessageEvent<string>) => {
          resolve(event.data) 
        }
        this.worker.onerror = (event) => {
          reject(`Worker init onerror triggered ${event.message}`)
        }
        this.worker.onmessageerror = (event) => {
          reject(`Worker init onmessageerror triggered ${event.data}`)
        }
      })
      ns.tprint(`Go worker ${initalized}`)
    }

    this.worker.postMessage(analysisBoard)

    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event : MessageEvent<AnalysisState>) => {
        resolve(event.data) 
      }
      this.worker.onerror = (event) => {
        reject(`Worker onerror triggered ${event.message}`)
      }
      this.worker.onmessageerror = (event) => {
        reject(`Worker onmessageerror triggered ${event.data}`)
      }
    })
  }
}
