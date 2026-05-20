import { NS } from "@ns";
import { hasSession } from "./hasSession"
import { obtainSession } from "./obtainSession"

export async function main(ns: NS): Promise<void> {
  while (true) {
    // LOOT!
    const host = ns.self().server;
    if (host !== "home") {
      for (const filename of ns.ls(host)) {
        if (filename !== ns.getScriptName() && filename !== "remotes/phish.js") {
          const lastFour = filename.slice(-4);
          if (lastFour === ".txt" || lastFour === ".lit") {
            const result = ns.scp(filename, "darkweb");
            if (result === false) {
              ns.tprint(`Failed to copy ${filename} from ${host} to darkweb`)
            }
          } else if (lastFour === "ache") {
            const cache = ns.dnet.openCache(filename, false);
            ns.tprint(cache.message);
          } else {
            ns.tprint(`Found strange file: ${filename}`)
          }
        }
      }

      // PHISH!
      const hostRam = ns.getServerMaxRam() - ns.getServerUsedRam();
      const phishRam = ns.getScriptRam("remotes/phish.js");
      const phishThreads = Math.floor(hostRam / phishRam);
      if (phishThreads > 0) {
        ns.exec("remotes/phish.js", host, phishThreads);
      }
    }

    // SPREAD!
    const connectedServers = ns.dnet.probe();
    for (const server of connectedServers) {
      if (hasSession(ns, server) || await obtainSession(ns, server)) {
        if (ns.ps(server).length === 0) {
          ns.scp(ns.getScriptName(), server);
          ns.scp("/remotes/phish.js", server);
          ns.exec(ns.getScriptName(), server);
        }
      }
    }
    await ns.dnet.nextMutation();
  }
}
