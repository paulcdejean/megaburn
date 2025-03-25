 
import { NS, AutocompleteData, GoOpponent } from "@ns";
import IpFish from "./ui/IpFish";
import { AnalaysisBoard, Game } from "./Game"
import { analysisWorker } from "./analysisWorker";
import { autoPlay } from "./autoPlay";
import { get_lines, MCLine } from "@rust"


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function autocomplete(data: AutocompleteData, args: string[]) {
  return [
    "daedalus",
    "netburners",
    "slumsnakes",
    "blackhand",
    "tetrads",
    "illuminati",
    "analysis",
  ];
}

export async function main(ns: NS): Promise<void> {
  ns.disableLog("ALL")
  const boardSize = 5


  const worker = await analysisWorker(ns);

  const game = new Game(ns, "Daedalus", boardSize, worker)

  const analysisBoard : AnalaysisBoard = game.getAnalysisBoard()

  const lines : MCLine[] = get_lines(analysisBoard.boardHistory, analysisBoard.komi, analysisBoard.turn, analysisBoard.passed)
  ns.tprint(JSON.stringify(lines))

  ns.exit()
  if (ns.args[0] !== "analysis") {
    const argmap: Record<string, GoOpponent> = {
      "daedalus": "Daedalus",
      "netburners": "Netburners",
      "slumsnakes": "Slum Snakes",
      "blackhand": "The Black Hand",
      "tetrads": "Tetrads",
      "illuminati": "Illuminati",
    }
    let opponent : GoOpponent
    if (ns.args[0] as string in argmap) {
      opponent = argmap[ns.args[0] as string]
    } else {
      opponent = "Daedalus"
    }
    // Will run forever.
    await autoPlay(ns, boardSize, opponent, worker)
  } else {
    const game = new Game(ns, "Daedalus", boardSize, worker)
    await ipfish(ns, game)

    while (true) {
      // await ns.asleep(2000)
    }
  }
}

export async function ipfish(ns: NS, game : Game): Promise<void> {
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
