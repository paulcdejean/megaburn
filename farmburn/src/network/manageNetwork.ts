import { NS, Server } from "@ns";
import { getServerList } from "./getServerList";
import { tryNuke } from "./tryNuke";
import { managePurchasedServers } from "./managePurchasedServers";
import { Network } from "@/types";

export function manageNetwork(ns: NS): Network {
  ns.disableLog("scan")

  const serverStrings = getServerList(ns)
  const network = new Map<string, Required<Server>>
  for (const server of serverStrings) {
    network.set(server, ns.getServer(server) as Required<Server>)
  }

  for (const [server, data] of network) {
    if(!data.hasAdminRights) {
      data.hasAdminRights = tryNuke(ns, server)
    }
  }

  managePurchasedServers(ns, network)

  ns.write("data/network.json", JSON.stringify(Object.fromEntries(network)), "w")
  return network
}
