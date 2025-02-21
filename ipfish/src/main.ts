import { NS } from "@ns";
import IpFish from "./ui/IpFish";
import { Game } from "./game";

export async function main(ns: NS): Promise<void> {
  

   
  const game = new Game(ns)

  ipfish(ns, game)

  while(true) {
    await ns.asleep(2000)
  }
}

export function ipfish(ns: NS, game : Game): void {
  ns.disableLog("ALL")
  ns.clearLog()
  // Cleans up react element after exit
  ns.atExit(() => {
    ns.clearLog()
    ns.closeTail()
  })

  ns.tail()
  ns.resizeTail(840, 860)
  ns.moveTail(840, 50)

  ns.printRaw(React.createElement(IpFish, {game: game}))
}
