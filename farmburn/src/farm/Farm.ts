import { farmScript } from "@/constants"
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
  readonly hack: number,
  readonly grow: number,
  readonly weaken: number,
}

type ExtraMsecs = {
  readonly hack: number,
  readonly grow: number,
  readonly weaken: number,
}

export class Farm {
  public readonly homeReservedRam : number = 32
  private port : number = 2000
  private nextwritePromises : Promise<true | void>[] = []
  public readonly scriptRamCosts : ScriptRamCosts
  private readonly extraMsecs : ExtraMsecs
  public readonly target : string

  constructor(ns : NS, target: string) {
    this.target = target
    this.scriptRamCosts = {
      hack: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.grow) * 100 - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      grow: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100  - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      weaken: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100 - ns.getFunctionRamCost(Action.grow) * 100) / 100,
    }
    // Cycle time is weaken time rounded up to the nearest second
    const cycleTime = Math.ceil(ns.getWeakenTime(target) / 1000) * 1000
    this.extraMsecs = {
      hack: cycleTime - ns.getHackTime(target) + Number.EPSILON,
      grow: cycleTime - ns.getGrowTime(target) + Number.EPSILON,
      weaken: cycleTime - ns.getWeakenTime(target) + Number.EPSILON,
    }
  }

  private async runOperation(ns : NS, operation : Operation, runOptions : Required<RunOptions>, actionOptions : Required<BasicHGWOptions>, port: number) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const result = ns.exec(farmScript, operation.server, runOptions,
          operation.action, this.target, actionOptions.additionalMsec, actionOptions.stock, actionOptions.threads, port)
        if (result > 0) {
          resolve()
        } else {
          reject(new Error(`Failed to exec ${operation.action} on ${operation.server} with ${operation.threads} threads`))
        }
      })
    })
  }

  public async runBatch(ns : NS, batch : Batch) {
    const operations : Promise<void>[] = []
    for (const operation of batch) {
      const runOptions : Required<RunOptions> = {
        preventDuplicates: false,
        ramOverride: this.scriptRamCosts[operation.action],
        temporary: true,
        threads: operation.threads,
      }
      const actionOptions : Required<BasicHGWOptions> = {
        additionalMsec: this.extraMsecs[operation.action],
        stock: false, // TODO
        threads: operation.threads
      }
      operations.push(this.runOperation(ns, operation, runOptions, actionOptions, this.port))
      this.nextwritePromises.push(ns.getPortHandle(this.port).nextWrite())
      this.port++
    }
    // This actually runs the operations
    await Promise.all(operations)
  }

  public async waitToFinish() {
    return Promise.all(this.nextwritePromises)
  }
}
