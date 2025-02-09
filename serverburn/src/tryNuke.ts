import { NS } from "@ns";

export function tryNuke(ns : NS, server : string) : boolean {
  let portsOpen = 0
  if(ns.fileExists("BruteSSH.exe", "home")) {
    ns.brutessh(server)
    portsOpen++
  }
  if(ns.fileExists("FTPCrack.exe", "home")) {
    ns.ftpcrack(server)
    portsOpen++
  }
  if(ns.fileExists("relaySMTP.exe", "home")) {
    ns.relaysmtp(server)
    portsOpen++
  }
  if(ns.fileExists("HTTPWorm.exe", "home")){
    ns.httpworm(server)
    portsOpen++
  }
  if(ns.fileExists("SQLInject.exe", "home")) {
    ns.sqlinject(server)
    portsOpen++
  }
  if(ns.fileExists("NUKE.exe", "home") && ns.getServerNumPortsRequired(server) <= portsOpen) {
    ns.nuke(server)
  }
  return ns.hasRootAccess(server)
}
