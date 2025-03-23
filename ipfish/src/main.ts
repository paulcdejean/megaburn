 
import { NS, AutocompleteData, GoOpponent } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./Game"
import analysisWorker from "./worker/analysis?worker&inline"

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
  const worker = new analysisWorker()

  ns.atExit(() => {
    if(worker !== undefined) worker.terminate()
  }, "worker")

  const initalized = await new Promise((resolve, reject) => {
    if (worker === undefined) {
      reject("Worker non existent during init")
    } else {
      worker.onmessage = (event : MessageEvent<string>) => {
        resolve(event.data) 
      }
      worker.onerror = (event) => {
        reject(`Worker init onerror triggered ${event.message}`)
      }
      worker.onmessageerror = (event) => {
        reject(`Worker init onmessageerror triggered ${event.data}`)
      }
    }
  })
  ns.tprint(`Go worker ${initalized}`)

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
    

    while (true) {
      const squareCount = boardSize ** 2
      const game = new Game(ns, opponent, boardSize, worker)
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
    const game = new Game(ns, "Daedalus", boardSize, worker)
    await ipfish(ns, game)

    while (true) {
      await ns.asleep(2000)
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
