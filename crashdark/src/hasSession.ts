import { NS } from "@ns";
import { getPassword } from "./getPassword"

export function hasSession(ns: NS, server: string): boolean {
  if (ns.hasRootAccess(server) || ns.dnet.getServerDetails(server).hasSession) {
    const password = getPassword(ns, server);
    if (password === null) {
      return false
    } else {
      const result = ns.dnet.connectToSession(server, password);
      return result.success;
    }
  } else {
    return false
  }
}
