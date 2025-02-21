import { NS } from "@ns";
import { PointState, GameState } from "./types.d";

export class Game {
  public readonly state : GameState

  constructor(ns : NS) {
    const stringState = ns.go.getBoardState()
    const boardSize = stringState.length
    this.state = new Uint8Array(boardSize**2)
    let positionNumber = 0
    for (const row of stringState) {
      for (const point of row) {
        if (point === ".") this.state[positionNumber] = PointState.Empty
        else if (point === "X") this.state[positionNumber] = PointState.Black
        else if (point === "O") this.state[positionNumber] = PointState.White
        else if (point === "#") this.state[positionNumber] = PointState.Offline
        else throw new Error(`Invalid ponit data ${point} at position ${positionNumber}`)

        positionNumber++
      }
    }
  }
}
