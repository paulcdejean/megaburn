import { NS } from "@ns";
import GoBoard from "./ui/GoBoard";

export async function main(ns: NS): Promise<void> {
  ipfish(ns)

  while(true) {
    await ns.asleep(2000)
  }
}

export function ipfish(ns: NS): void {
  ns.disableLog("ALL")
  ns.clearLog()
  // Cleans up react element after exit
  ns.atExit(() => {
    ns.clearLog()
    ns.closeTail()
  })

  ns.tail()
  ns.resizeTail(750, 500)
  ns.moveTail(350, 450)

  ns.printRaw(React.createElement(GoBoard))
}
