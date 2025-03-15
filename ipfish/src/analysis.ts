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

export class Analysis {
  private static worker : Worker | undefined
   
  public static async get(ns: NS, analysisBoard : AnalaysisBoard) : Promise<AnalysisState> {
    if (this.worker === undefined) {
      ns.atExit(() => {
        if(this.worker !== undefined) this.worker.terminate()
        this.worker = undefined
      }, "Analysis")

      this.worker = new analysisWorker()

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
      ns.tprint(`Go worker ${initalized}`)
    }

    this.worker.postMessage(analysisBoard)

    return new Promise((resolve, reject) => {
      if (this.worker === undefined) {
        reject("Worker non existent during analysis")
      } else {
        this.worker.onmessage = (event : MessageEvent<AnalysisState>) => {
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
