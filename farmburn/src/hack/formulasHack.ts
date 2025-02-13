import { NS } from "@ns";
import { Network } from "../types";
import { basicHack } from "./basicHack";



export async function formulasHack(ns : NS, target : string, network : Network): Promise<void> {
  return basicHack(ns, target, network)
}
