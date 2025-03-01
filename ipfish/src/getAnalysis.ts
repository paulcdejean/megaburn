import { GameState, AnalysisState } from "./Game";
import { get_analysis } from "@rust"

export async function getAnalysis(gameState : GameState) : Promise<AnalysisState> {
  // TODO make good
  const analysis = get_analysis([gameState.board])
  const bestMove = 0
  return {
    analysis: analysis,
    bestMove: bestMove
  }
}
