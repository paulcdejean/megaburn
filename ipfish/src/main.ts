import { NS } from "@ns";
import IpFish from "./ui/IpFish";

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
  ns.resizeTail(840, 860)
  ns.moveTail(840, 50)

  ns.printRaw(React.createElement(IpFish))
}
