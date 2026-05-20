import { NS } from "@ns";
import { zeroLogin } from "./minigames/zeroLogin"
import { cloudBlare } from "./minigames/cloudBlare"
import { freshInstall } from "./minigames/freshInstall"

export function getPassword(ns: NS, server: string): string | null {
  const details = ns.dnet.getServerDetails(server);
  if (details.modelId === "ZeroLogon") {
    return zeroLogin(ns, server);
  } else if (details.modelId === "CloudBlare(tm)") {
    return cloudBlare(ns, server);
  } else if (details.modelId === "FreshInstall_1.0") {
    return freshInstall(ns, server);
  } else {
    return null
  }
}
