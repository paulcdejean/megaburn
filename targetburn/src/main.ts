import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.tprint("Advanced targetting not implemented, setting target to n00dles")
  ns.write("data/target.txt", "n00dles")
}
