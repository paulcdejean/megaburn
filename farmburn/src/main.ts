import { NS } from "@ns";
import { manageNetwork } from "./network/manageNetwork";
import { basicHack } from "./basicHack";
import { formulasHack } from "./formulasHack";

export async function main(ns: NS): Promise<void> {
  // Will create data/network.json if it doesn't already exist
  manageNetwork(ns)

  // Determine the target
  if (!ns.fileExists("data/target.txt")) {
    ns.write("data/target.txt", "n00dles", "w")
  }
  const target = ns.read("data/target.txt")

  if(ns.fileExists("Formulas.exe", "home")) {
    await formulasHack(ns, target)
  } else {
    await basicHack(ns, target)
  }
}
