/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect, test, describe } from 'vitest'
import { getAnalysis } from './getAnalysis'
import { PointState, type BoardState, type Game, type GameState } from './Game'
import { CurrentTurn } from './getCurrentTurn'


function boardFromText(boardString : string) : BoardState {
  const output = new Uint8Array(boardString.length)

  let n = 0
  for (const letter of boardString) {
    if(letter === ".") {
      output[n] = PointState.Empty
    } else if(letter === "X") {
      output[n] = PointState.Black
    } else if(letter === "O") {
      output[n] = PointState.White
    } else if(letter === "#") {
      output[n] = PointState.Offline
    } else {
      throw new Error("Board string in test is invalid")
    }
    n++
  }
  return output
}

describe('Basic capture', async() => {
  test(`A === A`, async() => {
    expect('A').to.be('A')
  })
})


// test(`Basic capture`, async() => {
//   const board =
// `\
// .....
// OXOX.
// .OX..
// ....#
// ...#.`

//   const gameState : GameState = {
//     board: boardFromText(board),
//     turn: CurrentTurn.Black,
//     komi: 0.5,
//   }

//   const legality = [
//     true, true, true,
//     false, // Node is offline
//     false, // Surrounded by offline nodes
//     true, true, true, true,
//     false, // Node is offline
//     true,
//     false, // White piece there
//     false, // Black piece there
//     true, true,
//     false, false, false, false, // Pieces there
//     true,
//     true, true, true, true, true,
//   ]

//   const analysis = await getAnalysis(gameState)

//   const testingMatrix = []
//   for (let n = 0; n < legality.length; n++) {
//     testingMatrix.push([
//       [analysis[n], legality[n]]
//     ])
//   }

//   // test.for()
// })
