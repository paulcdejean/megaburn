import { NS } from "@ns";
import { manageNetwork } from "./network/manageNetwork";
import { basicHack } from "./hack/basicHack";
import { formulasHack } from "./hack/formulasHack";
import { farmScript } from "./constants";

export async function main(ns: NS): Promise<void> {
  // Will create data/network.json if it doesn't already exist
  const network = manageNetwork(ns)

  // Copy HGW scripts to network
  for (const server of network.keys()) {
    ns.scp(farmScript, server, "home")
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
    }
  })

  if(ns.fileExists("Formulas.exe", "home")) {
    await formulasHack(ns, target, network)
  } else {
    await basicHack(ns, target, network)
  }
}
