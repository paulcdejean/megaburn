import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  while (true) {
    const connectedServers = ns.dnet.probe();
    ns.tprint(connectedServers);
    for (const server of connectedServers) {
      const details = ns.dnet.getServerAuthDetails(server);
      ns.tprint(details)
    }
    await ns.dnet.nextMutation();
  }
}
