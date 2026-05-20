import { NS } from "@ns";


export function deskMemo(ns: NS, server: string): string | null{
  const details = ns.dnet.getServerDetails(server);
  return details.passwordHint.slice(details.passwordLength * -1);
}
