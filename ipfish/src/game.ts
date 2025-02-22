import { NS } from "@ns";
import { PointState, GameState } from "./types.d"

export class Game {
  public readonly state : GameState

  constructor(ns : NS) {
    const stringState = ns.go.getBoardState() // For some reason this does columns then rows smdh
    const boardSize = stringState.length
    if (boardSize !== 5) throw new Error('Only 5x5 boards are currently supported')
    this.state = new Uint8Array(boardSize**2)
    let row = 1
    let column = 0
    for (const str of stringState) {
      column = 0
      for (const point of str) {
        const pointNumber = (column * 5) + row - 1
        if (point === ".") this.state[pointNumber] = PointState.Empty
        else if (point === "X") this.state[pointNumber] = PointState.Black
        else if (point === "O") this.state[pointNumber] = PointState.White
        else if (point === "#") this.state[pointNumber] = PointState.Offline
        else throw new Error(`Invalid point data ${point} at position ${row*column-1}`)
        column++
      }
      row++
    }
  }
}
