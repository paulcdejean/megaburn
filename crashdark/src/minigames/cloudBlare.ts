import { NS } from "@ns";

export function cloudBlare(ns: NS, server: string): string {
  const details = ns.dnet.getServerDetails(server);
  const result = [];
  for (const letter of details.data) {
    if (!isNaN(parseInt(letter))) {
      result.push(letter);
    }
  }
  return result.join("")
}
