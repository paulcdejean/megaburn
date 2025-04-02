import { GoOpponent, NS } from "@ns"
import { Game } from "./Game"

export async function autoPlay(ns : NS, boardSize: 5 | 7 | 9 | 13, opponent : GoOpponent, analysisWorker : Worker) : Promise<void> {
  while (true) {
    const squareCount = boardSize ** 2
    const game = new Game(ns, opponent, boardSize, analysisWorker)
    while (ns.go.getCurrentPlayer() !== "None") {
      const analysis = await game.analysis()
      if (analysis.bestMove == squareCount) {
        const isGameOver = await game.passTurn()
        if (isGameOver) {
          break
        }
      } else {
        const bestMoveColumn = Math.floor(analysis.bestMove % game.boardSize)
        const bestMoveRow = Math.floor(analysis.bestMove / game.boardSize)
        if (analysis.analysis[analysis.bestMove] < -0.2) {
          ns.tprint("Blunder detected, gameplay stopped!")
          ns.exit()
        }

        await game.makeMove(bestMoveRow, bestMoveColumn)
      }
    }
  }
}
