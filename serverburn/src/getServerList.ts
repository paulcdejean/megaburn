import { NS } from "@ns";

export function getServerList(ns: NS) : Set<string> {
  const unscannedServers = new Set(["home"])
  const scannedServers = new Set<string>()
  while (unscannedServers.size > 0) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const serverToScan : string = unscannedServers.values().next().value!
    unscannedServers.delete(serverToScan)
    scannedServers.add(serverToScan)
    for (const server of ns.scan(serverToScan)) {
      if (!scannedServers.has(server)) {
        unscannedServers.add(server)
      }
    }
  }
  return scannedServers
}
