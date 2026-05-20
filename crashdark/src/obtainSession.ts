import { NS } from "@ns";
import { getPassword } from "./getPassword"

export async function obtainSession(ns: NS, server: string) {
  const password = getPassword(ns, server);
  if (password === null) {
    return false
  } else {
    const result = await ns.dnet.authenticate(server, password);
    if (result.success) {
      ns.tprint(`Successfully authenticated to ${server} depth = ${ns.dnet.getServerDetails(server).depth}`);
      if (result.data !== undefined) {
        ns.tprint(`${server} has additional data below:`)
        ns.tprint(result.data);
      }
    } else {
      ns.tprint(`Failed to authenticate to ${server}`);
      if (result.data !== undefined) {
        ns.tprint(`${server} has additional data below:`)
        ns.tprint(result.data);
      }
    }
  }
}
