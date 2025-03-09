import { AnalysisState, BoardState } from "./Game";
import { get_analysis } from "@rust"
import { CurrentTurn } from "./getCurrentTurn";

 
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
