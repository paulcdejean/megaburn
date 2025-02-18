import { NS } from "@ns";

export function getServerList(ns: NS) : Set<string> {
  const unscannedServers = new Array<string>("home")
  const scannedServers = new Set<string>()
  while (unscannedServers.length > 0) {
    const serverToScan : string = unscannedServers.pop()!
    scannedServers.add(serverToScan)
    for (const server of ns.scan(serverToScan)) {
      if (!scannedServers.has(server)) {
        unscannedServers.push(server)
      }
    }
  }
  return scannedServers
}
