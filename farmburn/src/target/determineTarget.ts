import { arbitraryHackingNumber } from "@/constants";
import { Network } from "@/types";
import { NS, Server } from "@ns";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function determineTarget(ns : NS, network : Network) {
  const threads = determineNumberOfThreads(ns, "n00dles")
  ns.tprint(`n00dles threads = ${threads}`)
  return "n00dles"
}

function determineNumberOfThreads(ns : NS, target : string) : number {
  const server = ns.getServer(target) as Required<Server>
  const player = ns.getPlayer()
  const weakenPerThread = ns.weakenAnalyze(1)
  server.hackDifficulty = server.minDifficulty
  const hackThreads = Math.floor(arbitraryHackingNumber / ns.formulas.hacking.hackPercent(server, player))
  const hackSecurityIncrease =  ns.hackAnalyzeSecurity(hackThreads)
  const firstWeakenThreads = Math.ceil(hackSecurityIncrease / weakenPerThread)
  server.moneyAvailable = server.moneyMax * (1 - arbitraryHackingNumber)
  const growThreads = ns.formulas.hacking.growThreads(server, player, server.moneyMax)
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads)
  const secondWeakenThreads = Math.ceil(growSecurityIncrease / weakenPerThread)
  return hackThreads + firstWeakenThreads + growThreads + secondWeakenThreads
}
