import { AnalysisState, BoardState } from "./Game";
import { get_analysis } from "@rust"
import { CurrentTurn } from "./getCurrentTurn";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAnalysis(boardHistory : [BoardState], komi: number, turn: CurrentTurn) : Promise<AnalysisState> {
  // TODO make good
  const analysis = get_analysis(boardHistory)
  const bestMove = 0
  return {
    analysis: analysis,
    bestMove: bestMove
  }
}
