 
import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"
import { getMoveOptions,  getPriorityMove, createBoard } from "./go.js"

export async function main(ns: NS): Promise<void> {
  const game = new Game(ns, "Daedalus", 13)
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

  const boardState = createBoard(ns)
  const smart = true
  const player = "black"
  const opponentMove = "notpassing" // This is the string "pass" if they are passing
  const moves = getMoveOptions(ns, boardState, player, smart, opponentMove)
  const priorityMoves = await getPriorityMove(ns, moves)
  ns.tprint(JSON.stringify(priorityMoves))
  ns.exit()

  const initalAnalysisState = await game.analysis()

  ns.printRaw(React.createElement(IpFish, {game: game,
                                           initalBoardState: game.getBoard(),
                                           initalAnalysisState: initalAnalysisState,
                                           komi: game.komi,
                                           initialTurn: game.turn,
                                          }))
}
