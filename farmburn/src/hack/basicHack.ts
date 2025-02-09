import { NS } from "@ns";
import { Network } from "../types";

export async function basicHack(ns : NS, target : string, network : Network): Promise<void> {
  // Because we don't have formulas, can't do anything what so ever, until we weaken the target to minimum security
  // Don't use optional chain, because we want it to throw an error rather than evaulting to true

  if ((network.get(target)!.hackDifficulty === network.get(target)!.minDifficulty) && ns.getHackingLevel() > 10) {
    await simpleHWGW(ns, target, network)
  } else {
    await simpleWeaken(ns, target, network)
  }

  await ns.asleep(0)
  await ns.weaken(target, {
    additionalMsec: Math.ceil(ns.getWeakenTime(target)) - ns.getWeakenTime(target) + 500
  })
  await ns.asleep(1000)


  ns.tprint(`${target} security level = ${network.get(target)!.hackDifficulty}`)
  ns.tprint(`${target} current money = ${network.get(target)!.moneyAvailable}`)
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

    availableRam.set(batchHackServer, availableRam.get(batchHackServer)! - hackRequiredRam)
    availableRam.set(batchFirstWeakenServer, availableRam.get(batchHackServer)! - firstWeakenRequiredRam)
    availableRam.set(batchGrowServer, availableRam.get(batchHackServer)! - growRequiredRam)
    availableRam.set(batchSecondWeakenServer, availableRam.get(batchHackServer)! - secondWeakenRequiredRam)

    const weakenExtraMsec = Math.ceil(ns.getWeakenTime(target)) - ns.getWeakenTime(target)
    const hackExtraMsec = Math.ceil(ns.getWeakenTime(target))- ns.getHackTime(target)
    const growExtraMsec = Math.ceil(ns.getWeakenTime(target)) - ns.getGrowTime(target)

    execPromises.push(new Promise<void>(
      (resolve) => {
        setTimeout(() => {
          ns.exec("remotes/hack.js", batchHackServer, {temporary: true, threads: hackThreads}, target, hackExtraMsec, false, hackThreads)
          ns.exec("remotes/weaken.js", batchFirstWeakenServer, {temporary: true, threads: firstWeakenThreads}, target, weakenExtraMsec, false, firstWeakenThreads)
          ns.exec("remotes/grow.js", batchGrowServer, {temporary: true, threads: growThreads}, target, growExtraMsec, false, growThreads)
          ns.exec("remotes/weaken.js", batchSecondWeakenServer, {temporary: true, threads: secondWeakenThreads}, target, weakenExtraMsec, false, secondWeakenThreads)
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
