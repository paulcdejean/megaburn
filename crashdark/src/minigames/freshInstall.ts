// The factory default is usually one of admin, password, 0000, 12345
// Some common passwords include 777777, pass, maggie, 159753, aaaaaa, ginger, princess, joshua, cheese, amanda, summer, love, ashley, 6969, nicole

import { NS } from "@ns";

export function freshInstall(ns: NS, server: string): string | null {
  const details = ns.dnet.getServerDetails(server);

  if (details.passwordFormat === "numeric" && details.passwordLength === 4) {
    return "0000"
  } else if (details.passwordFormat === "numeric" && details.passwordLength === 5) {
    return "12345"
  } else if (details.passwordFormat === "alphabetic" && details.passwordLength === 5) {
    return "admin"
  } else if (details.passwordFormat === "alphabetic" && details.passwordLength === 8) {
    return "password"
  } else {
    return null
  }
}
