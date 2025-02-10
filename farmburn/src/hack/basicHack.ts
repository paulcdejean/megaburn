import { NS } from "@ns";
import { Network } from "../types";

export async function basicHack(ns : NS, target : string, network : Network): Promise<number> {
  // Because we don't have formulas, can't do anything what so ever, until we weaken the target to minimum security
  // Don't use optional chain, because we want it to throw an error rather than evaulting to true

  if ((network.get(target)!.hackDifficulty === network.get(target)!.minDifficulty) && ns.getHackingLevel() > 10) {
    await simpleHWGW(ns, target, network)
  } else {
    await simpleWeaken(ns, target, network)
  }

  return ns.weaken(target)
}


async function simpleHWGW(ns : NS, target : string, network : Network) : Promise<void[]> {
  const homeReservedRam = 256
  const amountToHack = 0.375 // Totally made up number
  const hackThreads = Math.floor(amountToHack / ns.hackAnalyze(target))
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads)
  const firstWeakenThreads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, 1))
  // (1 - 0.375) * 1.6 = 1
  const growThreads = Math.ceil(ns.growthAnalyze(target, 1.6, 1))
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads)
  const secondWeakenThreads = Math.ceil(growSecurityIncrease /  ns.weakenAnalyze(1, 1))
  const availableRam = new Map<string, number>()

  for (const [serverName, serverData] of network) {
    if (serverName !== "home") {
      availableRam.set(serverName, serverData.maxRam)
    } else {
      availableRam.set(serverName, Math.max(0, serverData.maxRam - homeReservedRam))
    }
  }

  const hackIter = network.keys()
  const firstWeakenIter = network.keys()
  const growIter = network.keys()
  const secondWeakenIter = network.keys()

  let currentHackServer = hackIter.next().value
  let currentFirstWeakenServer = firstWeakenIter.next().value
  let currentGrowServer = growIter.next().value
  let currentSecondWeakenServer = secondWeakenIter.next().value

  const hackRequiredRam = hackThreads * ns.getScriptRam("remotes/hack.js", "home")
  const firstWeakenRequiredRam = firstWeakenThreads * ns.getScriptRam("remotes/weaken.js", "home")
  const growRequiredRam = growThreads * ns.getScriptRam("remotes/grow.js", "home")
  const secondWeakenRequiredRam = secondWeakenThreads * ns.getScriptRam("remotes/weaken.js", "home")

  const execPromises = []

  while(true) {
    // Page through until there's one with space
    while(currentHackServer !== undefined && availableRam.get(currentHackServer)! < hackRequiredRam) {
      currentHackServer = hackIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentHackServer === undefined) break
    const batchHackServer = currentHackServer

    // Page through until there's one with space
    while(currentFirstWeakenServer !== undefined && availableRam.get(currentFirstWeakenServer)! < firstWeakenRequiredRam) {
      currentFirstWeakenServer = firstWeakenIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentFirstWeakenServer === undefined) break
    const batchFirstWeakenServer = currentFirstWeakenServer

    // Page through until there's one with space
    while(currentGrowServer !== undefined && availableRam.get(currentGrowServer)! < growRequiredRam) {
      currentGrowServer = growIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentGrowServer === undefined) break
    const batchGrowServer = currentGrowServer

    // Page through until there's one with space
    while(currentSecondWeakenServer !== undefined && availableRam.get(currentSecondWeakenServer)! < secondWeakenRequiredRam) {
      currentSecondWeakenServer = secondWeakenIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentSecondWeakenServer === undefined) break
    const batchSecondWeakenServer = currentSecondWeakenServer

    execPromises.push(new Promise<void>(
      (resolve) => {
        setTimeout(() => {
          ns.exec("remotes/hack.js", batchHackServer, {temporary: true, threads: hackThreads}, target, 0, false, hackThreads)
          ns.exec("remotes/weaken.js", batchFirstWeakenServer, {temporary: true, threads: firstWeakenThreads}, target, 0, false, firstWeakenThreads)
          ns.exec("remotes/grow.js", batchGrowServer, {temporary: true, threads: growThreads}, target, 0, false, growThreads)
          ns.exec("remotes/weaken.js", batchSecondWeakenServer, {temporary: true, threads: secondWeakenThreads}, target, 0, false, secondWeakenThreads)
          resolve()
        })
      }
    ))
  }

  return Promise.all(execPromises)
}


async function simpleWeaken(ns : NS, target : string, network : Network) : Promise<void[]> {
  const homeReservedRam = 256
  const execPromises = []
  for (const [serverName, serverData] of network) {
    let availableRam = serverData.maxRam
    if (serverName === "home") {
      availableRam = Math.max(0, availableRam - homeReservedRam)
    }
    const scriptRam = ns.getScriptRam("remotes/weaken.js", "home")
    const weakenThreads = Math.floor(availableRam / scriptRam)
    if (weakenThreads > 0) {
      execPromises.push(new Promise<void>(
        (resolve) => {
          setTimeout(() => {
            ns.exec("remotes/weaken.js", serverName, {temporary: true, threads: weakenThreads}, target, 0, false, weakenThreads)
            resolve()
          })
        }
      ))
    }
  }
  return Promise.all(execPromises)
}
