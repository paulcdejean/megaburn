import { NS } from "@ns";
import analysisWebWorker from "./worker/analysis?worker&inline"

export async function analysisWorker(ns: NS) : Promise<Worker> {
  const worker = new analysisWebWorker()

  ns.atExit(() => {
    if(worker !== undefined) worker.terminate()
  }, "worker")

  const initalized = await new Promise((resolve, reject) => {
    if (worker === undefined) {
      reject("Worker non existent during init")
    } else {
      worker.onmessage = (event : MessageEvent<string>) => {
        resolve(event.data) 
      }
      worker.onerror = (event) => {
        reject(`Worker init onerror triggered ${event.message}`)
      }
      worker.onmessageerror = (event) => {
        reject(`Worker init onmessageerror triggered ${event.data}`)
      }
    }
  })
  ns.tprint(`Go worker ${initalized}`)
  return worker
}
