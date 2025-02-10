import { NS, Server } from "@ns";

export function managePurchasedServers(ns : NS, serverList : Map<string, Server>) : void {
  let upgradableServer : string | null = null
  let purchasedServerCount = 0
  for (const [server, data] of serverList) {
    if(data.purchasedByPlayer && server !== "home") {
      purchasedServerCount++
      if(data.maxRam < ns.getPurchasedServerMaxRam()) {
        upgradableServer = server
      }
    }
  }

  if(upgradableServer !== null) {
    upgradeServer(ns, upgradableServer)
    serverList.get(upgradableServer)!.maxRam = ns.getServerMaxRam(upgradableServer)
  } else if(purchasedServerCount < ns.getPurchasedServerLimit()) {
    const newServer = purchaseServer(ns, purchasedServerCount)
    serverList.set(newServer, ns.getServer(newServer))
  }
  return
}

function upgradeServer(ns: NS, server : string) {
  let ram = ns.getPurchasedServerMaxRam()
  const currentRam = ns.getServerMaxRam(server)
  while (ram > currentRam) {
    if(ns.upgradePurchasedServer(server, ram)) {
      ns.tprint(`Upgraded ${server} from ${ns.formatRam(currentRam)} RAM to ${ns.formatRam(ram)} RAM`)
      return
    } else {
      ram /= 2
    }
  }

  const upgradeCost = ns.getPurchasedServerUpgradeCost(server, currentRam * 2)
  ns.tprint(`Need $${ns.formatNumber(upgradeCost)} to upgrade ${server}`)
  return
}

function purchaseServer(ns: NS, purchasedServerCount : number) : string {
  const name = `purchased-${String(purchasedServerCount).padStart(2, '0')}`
  let ram = ns.getPurchasedServerMaxRam()
  while (ram >= 2) {
    const result = ns.purchaseServer(name, ram)
    if (result !== "") {
      ns.tprint(`Purchased server ${result} with ${ns.formatRam(ram)} of RAM`)
      break
    } else {
      ram /= 2
    }
  }
  return name
}
