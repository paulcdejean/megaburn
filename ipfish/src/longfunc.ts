import { NS } from "@ns"
import webWorker from "./worker/longfunc?worker&inline"

export async function longfunc(ns : NS) : Promise<string> {
  const worker = new webWorker()

  ns.atExit(() => {
    worker.terminate()
  }, "longfunc")

  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      resolve(event.data as string)
    }

    worker.onerror = (event) => {
      reject(`Worker onerror triggered ${event.message}`)
    }

    worker.onmessageerror = (event) => {
      reject(`Worker onmessageerror triggered ${event.data}`)
    }
  })
}
