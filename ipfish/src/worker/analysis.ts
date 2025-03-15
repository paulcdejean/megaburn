import { AnalaysisBoard, AnalysisState } from "@/analysis"
import { get_analysis } from "@rust"

onmessage = (event : MessageEvent<AnalaysisBoard>) => {
  postMessage(getAnalysis(event.data))
}

export function getAnalysis(analysisBoard: AnalaysisBoard) : AnalysisState {
  // TODO make good
  const analysis = get_analysis(analysisBoard.boardHistory, analysisBoard.komi, analysisBoard.turn)
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
