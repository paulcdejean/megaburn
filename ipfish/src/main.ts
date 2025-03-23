 
import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"

export async function main(ns: NS): Promise<void> {
  const game = new Game(ns, "Daedalus", 5)
  await ipfish(ns, game)

  while(true) {
    await ns.asleep(2000)
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

  let analysisState = await game.analysis()
  const squareCount = game.boardSize ** 2

  while (ns.go.getCurrentPlayer() !== "None") {
    if (analysisState.bestMove == squareCount) {
      await game.passTurn()
    } else {
      const bestMoveColumn = Math.floor(analysisState.bestMove % game.boardSize)
      const bestMoveRow = Math.floor(analysisState.bestMove / game.boardSize)
      await game.makeMove(bestMoveRow, bestMoveColumn)
    }
    analysisState = await game.analysis()
  }

  ns.exit()

  ns.printRaw(React.createElement(IpFish, {game: game,
                                           initalBoardState: game.getBoard(),
                                           initalAnalysisState: analysisState,
                                           komi: game.komi,
                                           initialTurn: game.turn,
                                          }))
}
