import { arbitraryHackingNumber } from "@/constants";
import { Network } from "@/types";
import { NS, Server } from "@ns";


export function determineTarget(ns : NS, network : Network) {
  let winningScore = 0
  let winningServer = "n00dles"
  for (const [serverName, serverData] of network) {
    if(serverData.hasAdminRights
      && serverData.requiredHackingSkill < ns.getHackingLevel()
      && serverData.moneyMax > 0) {
      const score = determineMoneyPerSecondPerThread(ns, serverName)
      //ns.tprint(`${serverName} score = ${ns.formatNumber(score * 10000)}`)
      if (score > winningScore) {
        winningScore = score
        winningServer = serverName
      }
    }
  }
  return winningServer
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

function determineMoneyHacked(ns : NS, target : string) : number {
  const server = ns.getServer(target) as Required<Server>
  const player = ns.getPlayer()
  server.hackDifficulty = server.minDifficulty
  return server.moneyMax * arbitraryHackingNumber * ns.formulas.hacking.hackChance(server, player)
}

function determineTimeHeuristic(ns : NS, target : string) : number {
  const server = ns.getServer(target) as Required<Server>
  const player = ns.getPlayer()
  const firstWeakenTime = ns.formulas.hacking.weakenTime(server, player)
  server.hackDifficulty = server.minDifficulty
  const secondWeakenTime = ns.formulas.hacking.weakenTime(server, player)
  return (firstWeakenTime + secondWeakenTime) / 2
}

function determineMoneyPerSecondPerThread(ns : NS, target : string) : number {

  return determineMoneyHacked(ns, target) / determineNumberOfThreads(ns, target) / determineTimeHeuristic(ns, target)
}
