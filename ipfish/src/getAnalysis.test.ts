
import { expect, test, describe } from 'vitest'
import { getAnalysis } from './getAnalysis'
import { PointState, type BoardState, type GameState } from './Game'
import { CurrentTurn } from './getCurrentTurn'
import { moveString } from './moveString'

function boardFromText(boardString : string, boardSize : number) : BoardState {
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


const basicCaptureBoard= `
.....
OXOX.
.OX..
....#
...#.
`
describe(`Basic capture: ${basicCaptureBoard}`, async() => {
  const gameState : GameState = {
    board: boardFromText(basicCaptureBoard, 5),
    turn: CurrentTurn.Black,
    komi: 0.5,
  }

  const legality = [
    true, true, true,
    false, // Node is offline
    false, // Surrounded by offline nodes
    true, true, true, true,
    false, // Node is offline
    true,
    false, // White piece there
    false, // Black piece there
    true, true,
    false, false, false, false, // Pieces there
    true,
    true, true, true, true, true,
  ]

  const analysis = await getAnalysis(gameState)

  const testingMatrix : (string | number | boolean)[][] = []
  for (let n = 0; n < legality.length; n++) {
    testingMatrix.push([
      moveString(n, 5), analysis.analysis[n], legality[n]
    ])
  }

    test.for(testingMatrix)("Point %s legality", ([, score, legal]) => {
    if (legal) {
      expect(score).to.not.equal(Number.NEGATIVE_INFINITY)
      
    } else {
      expect(score).to.equal(Number.NEGATIVE_INFINITY)
    }
  })
})
