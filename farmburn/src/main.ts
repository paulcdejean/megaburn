import { NS } from "@ns";
import { manageNetwork } from "./network/manageNetwork";
import { basicHack, shareServers } from "./hack/basicHack";
import { formulasHack } from "./hack/formulasHack";
import { farmScript, shareScript } from "./constants";

export async function main(ns: NS): Promise<void> {
  while(true) {
  // Will create data/network.json if it doesn't already exist
    const network = manageNetwork(ns)

    // Copy HGW scripts to network
    for (const server of network.keys()) {
      ns.scp(farmScript, server, "home")
      ns.scp(shareScript, server, "home")
    }

    // Determine the target
    if (!ns.fileExists("data/target.txt")) {
      ns.write("data/target.txt", "n00dles", "w")
    }
    const target = ns.read("data/target.txt")

    // Cleanup the farm scripts on exit
    ns.atExit(() => {
      for (const server of network.keys()) {
        ns.scriptKill(farmScript, server)
        ns.scriptKill(shareScript, server)
      }
    })

    let purchasedServerCount = 0
    for (const server of network.values()) {
      if (server.purchasedByPlayer) {
        purchasedServerCount++
      }
    }

    if (purchasedServerCount >= ns.getPurchasedServerLimit() && ns.args[0] === "share") {
      ns.tprint("Maxed purchased servers, now sharing")
      await shareServers(ns, network)

      while (true) {
        await ns.asleep(20000)
      }
    }
    else if(ns.fileExists("Formulas.exe", "home")) {
      await formulasHack(ns, target, network)
    } else {
      await basicHack(ns, target, network)
    }
  }
}
