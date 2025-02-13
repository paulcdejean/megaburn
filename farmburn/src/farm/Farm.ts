import { BasicHGWOptions, NS, RunOptions } from "@ns"

export enum Action {
  hack = "hack",
  grow = "grow",
  weaken = "weaken",
}

export type Operation = {
  action: Action // Hack, Grow or Weaken
  threads: number // Number of threads to run the action with
  server: string // Server to run the action on
}

export type Batch = Operation[]

type ScriptRamCosts = {
  hack: number,
  grow: number,
  weaken: number,
}

type ExtraMsecs = {
  hack: number,
  grow: number,
  weaken: number,
}

const farmScript = "remotes/hgw.js"

export class Farm {
  private homeReservedRam : number = 32
  private port : number = 2000
  private nextwritePromises : Promise<true | void>[] = []
  private scriptRamCosts : ScriptRamCosts
  private extraMsecs : ExtraMsecs
  public readonly target : string

  constructor(ns : NS, target: string) {
    this.target = target
    this.scriptRamCosts = {
      hack: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.grow) * 100 - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      grow: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100  - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      weaken: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100 - ns.getFunctionRamCost(Action.grow) * 100) / 100,
    }
    this.extraMsecs = {
      hack: Math.ceil(ns.getWeakenTime(target))- ns.getHackTime(target),
      grow: Math.ceil(ns.getWeakenTime(target)) - ns.getGrowTime(target),
      weaken: Math.ceil(ns.getWeakenTime(target)) - ns.getWeakenTime(target),
    }
  }

  public async runBatch(ns : NS, batch : Batch) {
    for (const operation of batch) {
      const runOptions : RunOptions = {
        preventDuplicates: false,
        ramOverride: 2,
        temporary: true,
        threads: operation.threads,
      }
      const actionOptions : BasicHGWOptions = {
        additionalMsec: this.extraMsecs[operation.action],
        stock: false, // TODO
        threads: operation.threads
      }
      // 0 is the setTimeout delay. farmScript is the first argument to exec.
      setTimeout(ns.exec.bind(this), 0, farmScript, operation.server, runOptions,
        // The below are the arguments passed into the script that is execed
        operation.action, this.target, actionOptions.additionalMsec, actionOptions.stock, actionOptions.threads, this.port)
      this.nextwritePromises.push(ns.getPortHandle(this.port).nextWrite())
      this.port++
    }
    await ns.asleep(0) // Yield, causing the batch operation to immediately start
  }

  public async waitToFinish() {
    return Promise.all(this.nextwritePromises)
  }
}
