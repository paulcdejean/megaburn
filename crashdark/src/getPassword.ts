import { NS } from "@ns";
import { zeroLogin } from "./minigames/easy/zeroLogin"
import { cloudBlare } from "./minigames/easy/cloudBlare"
import { freshInstall } from "./minigames/easy/freshInstall"
import { deskMemo } from "./minigames/easy/deskMemo"

export function getPassword(ns: NS, server: string): string | null {
  const details = ns.dnet.getServerDetails(server);
  if (details.modelId === "ZeroLogon") {
    return zeroLogin(ns, server);
  } else if (details.modelId === "CloudBlare(tm)") {
    return cloudBlare(ns, server);
  } else if (details.modelId === "FreshInstall_1.0") {
    return freshInstall(ns, server);
  } else if (details.modelId === "DeskMemo_3.1") {
    return deskMemo(ns, server);
  } else {
    return null
  }
}
