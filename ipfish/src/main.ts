import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"
import { getAnalysis } from "./getAnalysis";

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
  })

  ns.ui.openTail()
  ns.ui.resizeTail(720, 860)
  ns.ui.moveTail(1020, 50)
  ns.ui.renderTail()

  const initalAnalysisState = await getAnalysis(game.gameState)

  ns.printRaw(React.createElement(IpFish, {game: game, initalGameState: game.gameState, initalAnalysisState: initalAnalysisState}))
}
