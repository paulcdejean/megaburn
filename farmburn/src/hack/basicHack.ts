
import { NS, RunOptions } from "@ns";
import { Network } from "../types";
import { Batch, Action, Farm } from "./Farm";
import { arbitraryFuzz, arbitraryHackingNumber, debugEnabled, maxNumberOfScripts } from "@/constants";

export async function basicHack(ns : NS, target : string, network : Network): Promise<void> {
  const startTime = performance.now()
  const hackingMoneyBefore = ns.getMoneySources().sinceInstall.hacking

  // Because we don't have formulas, can't do anything what so ever, until we weaken the target to minimum security
  let farm : Farm
  if ((network.get(target)!.hackDifficulty === network.get(target)!.minDifficulty) && ns.getHackingLevel() > 10) {
    farm = await simpleHWGW(ns, target, network)
  } else {
    farm = await simpleWeaken(ns, target, network)
  }

  const runExecsStartTime = performance.now()
  await Promise.all(farm.startupPromises)
  const runExecsFinishTime = performance.now()
  ns.tprint(`Completed farm execs in ${ns.tFormat(runExecsFinishTime - runExecsStartTime)}`)

  await Promise.all(farm.nextwritePromises)
  const hackingMoneyAfter = ns.getMoneySources().sinceInstall.hacking
  const profit = hackingMoneyAfter - hackingMoneyBefore
  const endTime = performance.now()
  ns.tprint(`Farmed ${ns.formatNumber(profit)} from ${target} in ${ns.tFormat(endTime - startTime)}`)
  if (debugEnabled) {
    ns.tprint(`${target} security level = ${network.get(target)!.hackDifficulty}`)
    ns.tprint(`${target} current money = ${ns.formatNumber(network.get(target)!.moneyAvailable)}`)
  }
}

async function simpleHWGW(ns : NS, target : string, network : Network) : Promise<Farm> {
  ns.tprint(`Farming ${target}`)

  const farm = new Farm(ns, target)
  const homeReservedRam = 32
  const amountToHack = arbitraryHackingNumber // Totally made up number
  const hackThreads = Math.floor(amountToHack / ns.hackAnalyze(target))
  const hackSecurityIncrease = ns.hackAnalyzeSecurity(hackThreads)
  const firstWeakenThreads = Math.ceil(hackSecurityIncrease / ns.weakenAnalyze(1, 1))
  // We fuzz the math here to account for levelups, sorta?
  const growThreads = Math.ceil(ns.growthAnalyze(target, (1 / (1 - arbitraryHackingNumber)) + arbitraryFuzz, 1))
  const growSecurityIncrease = ns.growthAnalyzeSecurity(growThreads)
  const secondWeakenThreads = Math.ceil(growSecurityIncrease /  ns.weakenAnalyze(1, 1))
  const availableRam = new Map<string, number>()

  for (const [serverName, serverData] of network) {
    if (serverData.hasAdminRights) {
      if (serverName !== "home") {
        availableRam.set(serverName, serverData.maxRam)
      } else {
        availableRam.set(serverName, Math.max(0, serverData.maxRam - homeReservedRam))
      }
    }
  }

  const hackIter = availableRam.keys()
  const firstWeakenIter = availableRam.keys()
  const growIter = availableRam.keys()
  const secondWeakenIter = availableRam.keys()

  let currentHackServer = hackIter.next().value
  let currentFirstWeakenServer = firstWeakenIter.next().value
  let currentGrowServer = growIter.next().value
  let currentSecondWeakenServer = secondWeakenIter.next().value

  const hackRequiredRam = hackThreads * farm.scriptRamCosts.hack
  const firstWeakenRequiredRam = firstWeakenThreads * farm.scriptRamCosts.weaken
  const growRequiredRam = growThreads * farm.scriptRamCosts.grow
  const secondWeakenRequiredRam = secondWeakenThreads * farm.scriptRamCosts.weaken

  const spoolExecStartTime = performance.now()
  const scriptsPerBatch = 4 // HWGW is 4 letters
  let max = Math.floor(maxNumberOfScripts / scriptsPerBatch) // For lag
  while(max > 0) {
    // Page through until there's one with space
    while(currentHackServer !== undefined && availableRam.get(currentHackServer)! < hackRequiredRam) {
      currentHackServer = hackIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentHackServer === undefined) break
    availableRam.set(currentHackServer, availableRam.get(currentHackServer)! - hackRequiredRam)

    // Page through until there's one with space
    while(currentFirstWeakenServer !== undefined && availableRam.get(currentFirstWeakenServer)! < firstWeakenRequiredRam) {
      currentFirstWeakenServer = firstWeakenIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentFirstWeakenServer === undefined) break
    availableRam.set(currentFirstWeakenServer, availableRam.get(currentFirstWeakenServer)! - firstWeakenRequiredRam)

    // Page through until there's one with space
    while(currentGrowServer !== undefined && availableRam.get(currentGrowServer)! < growRequiredRam) {
      currentGrowServer = growIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentGrowServer === undefined) break
    availableRam.set(currentGrowServer, availableRam.get(currentGrowServer)! - growRequiredRam)

    // Page through until there's one with space
    while(currentSecondWeakenServer !== undefined && availableRam.get(currentSecondWeakenServer)! < secondWeakenRequiredRam) {
      currentSecondWeakenServer = secondWeakenIter.next().value
    }
    // Couldn't fit the operation so end things here
    if (currentSecondWeakenServer === undefined) break
    availableRam.set(currentSecondWeakenServer, availableRam.get(currentSecondWeakenServer)! - secondWeakenRequiredRam)

    const batchHackServer = currentHackServer
    const batchFirstWeakenServer = currentFirstWeakenServer
    const batchGrowServer = currentGrowServer
    const batchSecondWeakenServer = currentSecondWeakenServer

    const batch : Batch = [
      {action: Action.hack, threads: hackThreads, server: batchHackServer},
      {action: Action.weaken, threads: firstWeakenThreads, server: batchFirstWeakenServer},
      {action: Action.grow, threads: growThreads, server: batchGrowServer},
      {action: Action.weaken, threads: secondWeakenThreads, server: batchSecondWeakenServer},
    ]

    farm.runBatch(ns, batch)
    max--
  }
  const spoolExecFinishTime = performance.now()
  ns.tprint(`Spooled up farm execs in ${ns.tFormat(spoolExecFinishTime - spoolExecStartTime, true)}`)

  return farm
}

async function simpleWeaken(ns : NS, target : string, network : Network) : Promise<Farm> {
  const farm = new Farm(ns, target)
  for (const [serverName, serverData] of network) {
    let availableRam = serverData.maxRam
    if (serverName === "home") {
      availableRam = Math.max(1, availableRam - farm.homeReservedRam)
    }
    const weakenThreads = Math.floor(availableRam / farm.scriptRamCosts.weaken)
    if (weakenThreads > 0 && serverData.hasAdminRights) {
      farm.runBatch(ns, [{action: Action.weaken, threads: weakenThreads, server: serverName}])
    }
  }
  ns.tprint(`Weakening ${target}`)
  return farm
}

export async function shareServers(ns : NS, network : Network) : Promise<void> {
  for (const [serverName, serverData] of network) {
    const shareHomeReservedRam = 256
    let availableRam = serverData.maxRam
    if (serverName === "home") {
      availableRam = Math.max(1, availableRam - shareHomeReservedRam)
    }
    const shareThreads = Math.floor(availableRam / ns.getScriptRam("remotes/share.js", "home"))
    if (shareThreads > 0 && serverData.hasAdminRights) {
      const runOptions : RunOptions = {
        preventDuplicates: false,
        temporary: true,
        threads: shareThreads
      }
      ns.exec("remotes/share.js", serverName, runOptions)
      await ns.asleep(0)
    }
  }
}
