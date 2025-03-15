import { BoardState } from "./Game";
import { get_analysis } from "@rust"
import { CurrentTurn } from "./getCurrentTurn";
import webWorker from "./worker/analysis?worker&inline"
import { NS } from "@ns";


export interface AnalysisState {
  analysis: Float64Array
  bestMove: number
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Analysis {
  private static worker : Worker
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static get(ns: NS, boardHistory : [BoardState], komi: number, turn: CurrentTurn) : Promise<AnalysisState> {
    if (this.worker === undefined) {
      this.worker = new webWorker()
      ns.atExit(() => {
        this.worker.terminate()
      }, "Analysis")
    }

    this.worker.postMessage(3.5)

    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        const analysis : AnalysisState = {
          analysis: new Float64Array(boardHistory.length).fill(event.data as number),
          bestMove: 0,
        }

        resolve(analysis)
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

export async function getAnalysis(boardHistory : [BoardState], komi: number, turn: CurrentTurn) : Promise<AnalysisState> {
  // TODO make good
  const analysis = get_analysis(boardHistory, komi, turn)
  // Last element represents passing, if all moves tie with passing we should pass.
  let bestMove = analysis.length - 1
  let bestScore = analysis[bestMove]

  let n = 0
  for (const score of analysis) {
    if (score > bestScore) {
      bestScore = score
      bestMove = n
    }
    n++
  }

  return {
    analysis: analysis,
    bestMove: bestMove
  }
}
