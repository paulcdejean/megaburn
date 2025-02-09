import { NS, Server } from "@ns";
import { getServerList } from "./getServerList";
import { tryNuke } from "./tryNuke";
import { managePurchasedServers } from "./managePurchasedServers";

export function manageNetwork(ns: NS): void {
  ns.disableLog("scan")

  const serverStrings = getServerList(ns)
  const serverList = new Map<string, Server>
  for (const server of serverStrings) {
    serverList.set(server, ns.getServer(server))
  }

  for (const [server, data] of serverList) {
    if(!data.hasAdminRights) {
      data.hasAdminRights = tryNuke(ns, server)
    }
  }

  managePurchasedServers(ns, serverList)

  ns.write("data/network.json", JSON.stringify(Object.fromEntries(serverList)), "w")
}
