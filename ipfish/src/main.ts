 
import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"

export async function main(ns: NS): Promise<void> {
  const boardSize = 5

  if (ns.args[0] === "auto") {
    while (true) {
      const squareCount = boardSize ** 2
      const game = new Game(ns, "Daedalus", boardSize)
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
          await game.makeMove(bestMoveRow, bestMoveColumn)
        }
      }
    }
  } else {
    const game = new Game(ns, "Daedalus", boardSize)
    await ipfish(ns, game)

    while (true) {
      await ns.asleep(2000)
    }
  }

}

export async function ipfish(ns: NS, game : Game): Promise<void> {
  ns.disableLog("ALL")
  ns.clearLog()
  // Cleans up react element after exit
  ns.atExit(() => {
    ns.clearLog()
    ns.ui.closeTail()
  }, "main")

  ns.ui.openTail()
  ns.ui.resizeTail(720, 860)
  ns.ui.moveTail(1020, 50)
  ns.ui.renderTail()

  const analysisState = await game.analysis()


  ns.printRaw(React.createElement(IpFish, {game: game,
                                           initalBoardState: game.getBoard(),
                                           initalAnalysisState: analysisState,
                                           komi: game.komi,
                                           initialTurn: game.turn,
                                          }))
}
