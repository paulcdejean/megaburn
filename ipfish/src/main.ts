/* eslint-disable @typescript-eslint/no-unused-vars */
import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"
import { Analysis } from "./analysis";
import { longfunc } from "./longfunc"

// export async function main(ns: NS): Promise<void> {
//   const startTime = performance.now()
//   ns.tprint(`Starting longfunc at ${ns.tFormat(performance.now() - startTime)}`)
//   const longfuncPromise = longfunc(ns)
//   ns.tprint(`Longfunc is running at ${ns.tFormat(performance.now() - startTime)}`)
//   ns.tprint(await longfuncPromise)
//   ns.tprint(`Longfunc has finished running at ${ns.tFormat(performance.now() - startTime)}`)
// }


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

  const initalAnalysisState = await Analysis.get(ns, {
    boardHistory: game.boardHistory,
    komi: game.komi,
    turn: game.turn,
  })

  ns.printRaw(React.createElement(IpFish, {game: game,
                                           initalBoardState: game.getBoard(),
                                           initalAnalysisState: initalAnalysisState,
                                           komi: game.komi,
                                           initialTurn: game.turn,
                                          }))
}
