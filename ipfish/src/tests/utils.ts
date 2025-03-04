import { PointState, type BoardState } from '../Game'

export function boardFromText(boardString : string, boardSize : number) : BoardState {
  const output = new Uint8Array(boardSize**2)

  let n = 0
  for (const letter of boardString) {
    
    const column = n % boardSize
    const row = Math.floor((boardSize**2 - n - 1) / boardSize)
    const location = row * boardSize + column

    if(letter === "\n") {
      continue
    } else if(letter === ".") {
      output[location] = PointState.Empty
    } else if(letter === "X") {
      output[location] = PointState.Black
    } else if(letter === "O") {
      output[location] = PointState.White
    } else if(letter === "#") {
      output[location] = PointState.Offline
    } else {
      throw new Error("Board string in test is invalid")
    }
    n++
  }
  return output
}
