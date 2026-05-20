import { NS } from "@ns";
import { hasSession } from "./hasSession"
import { obtainSession } from "./obtainSession"

export async function main(ns: NS): Promise<void> {
  // LOOT!
  const host = ns.self().server;
  if (host !== "home") {
    for (const filename of ns.ls(host)) {
      if (filename !== ns.getScriptName()) {
        const lastFour = filename.slice(-4);
        if (lastFour === ".txt" || lastFour === ".lit") {
          const result = ns.scp(filename, "darkweb");
          if (result === false) {
            ns.tprint(`Failed to copy ${filename} from ${host} to darkweb`)
          }
        } else if (lastFour === "ache") {
          ns.dnet.openCache(filename, false);
        } else {
          ns.tprint(`Found strange file: ${filename}`)
        }
      }
    }
  }

  // LOOP!
  while (true) {
    const connectedServers = ns.dnet.probe();
    for (const server of connectedServers) {
      if (ns.dnet.getServerDetails(server).depth > 4) {
        ns.tprint(`Deep server ${server} connects to ${host}`);
        ns.tprint(ns.dnet.getServerDetails(server));
      }
      if (hasSession(ns, server) || await obtainSession(ns, server)) {
        if (ns.ps(server).length === 0) {
          ns.scp(ns.getScriptName(), server);
          ns.exec(ns.getScriptName(), server);
        }
      }
    }
    await ns.dnet.nextMutation();
  }
}
