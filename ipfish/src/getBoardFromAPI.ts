import { NS } from "@ns"
import { BoardState } from "./Game"


export function getBoardFromAPI(ns : NS) : BoardState {
  const stringState = ns.go.getBoardState()
  const boardSize = stringState.length
  const board = new Uint8Array(boardSize**2)
  
  let row = 0
  let column = 0
  for (const str of stringState) {
    column = 0
    for (const point of str) {
      const pointNumber = (column * boardSize) + row
      if (point === ".") board[pointNumber] = PointState.Empty
      else if (point === "X") board[pointNumber] = PointState.Black
      else if (point === "O") board[pointNumber] = PointState.White
      else if (point === "#") board[pointNumber] = PointState.Offline
      else throw new Error(`Invalid point data ${point} at position ${pointNumber}`)
      column++
    }
    row++
  }
  return board
}
