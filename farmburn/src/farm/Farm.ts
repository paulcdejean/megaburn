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
  public readonly nextwritePromises : Promise<true | void>[] = []
  public readonly scriptRamCosts : ScriptRamCosts
  public readonly target : string
  private readonly cycleTime : number

  constructor(ns : NS, target: string) {
    this.target = target
    this.scriptRamCosts = {
      hack: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.grow) * 100 - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      grow: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100  - ns.getFunctionRamCost(Action.weaken) * 100) / 100,
      weaken: (ns.getScriptRam(farmScript, "home") * 100 - ns.getFunctionRamCost(Action.hack) * 100 - ns.getFunctionRamCost(Action.grow) * 100) / 100,
    }
    // Cycle time is weaken time rounded up to the nearest second
    this.cycleTime = Math.ceil(ns.getWeakenTime(target) / 1000) * 1000
  }

  public runBatch(ns : NS, batch : Batch) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const extraMsecs : ExtraMsecs = {
          hack: this.cycleTime - ns.getHackTime(this.target) + 0.5,
          grow: this.cycleTime - ns.getGrowTime(this.target) + 0.5,
          weaken: this.cycleTime - ns.getWeakenTime(this.target) + 0.5,
        }
        if(extraMsecs.weaken < 0) {
          reject(new Error(`Negative extraMsecs with cycle time ${this.cycleTime}\
            and weaken time ${ns.getWeakenTime(this.target)}\
            and security level ${ns.getServerSecurityLevel(this.target)}`))
        }

        const lastOperation = batch.pop() as Operation

        for (const operation of batch) {
          const runOptions : Required<RunOptions> = {
            preventDuplicates: false,
            ramOverride: this.scriptRamCosts[operation.action],
            temporary: true,
            threads: operation.threads,
          }
          const actionOptions : Required<BasicHGWOptions> = {
            additionalMsec: extraMsecs[operation.action],
            stock: false, // TODO
            threads: operation.threads
          }
          const result = ns.exec(farmScript, operation.server, runOptions,
            operation.action, this.target, actionOptions.additionalMsec, actionOptions.stock, actionOptions.threads)
          if (result === 0) {
            reject(new Error(`Failed to exec ${operation.action} on ${operation.server} with ${operation.threads} threads`))
          }
        }

        const runOptions : Required<RunOptions> = {
          preventDuplicates: false,
          ramOverride: this.scriptRamCosts[lastOperation.action],
          temporary: true,
          threads: lastOperation.threads,
        }
        const actionOptions : Required<BasicHGWOptions> = {
          additionalMsec: extraMsecs[lastOperation.action],
          stock: false, // TODO
          threads: lastOperation.threads
        }
        const result = ns.exec(farmScript, lastOperation.server, runOptions,
          lastOperation.action, this.target, actionOptions.additionalMsec, actionOptions.stock, actionOptions.threads, this.port)
        if (result === 0) {
          reject(new Error(`Failed to exec ${lastOperation.action} on ${lastOperation.server} with ${lastOperation.threads} threads`))
        }
        this.nextwritePromises.push(ns.getPortHandle(this.port).nextWrite())
        this.port++
        resolve()
      })
    })
  }
}
