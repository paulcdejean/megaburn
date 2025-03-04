import { expect, test, describe } from 'vitest'
import { getAnalysis } from '../getAnalysis'
import { type GameState } from '../Game'
import { CurrentTurn } from '../getCurrentTurn'
import { moveString } from '../moveString'
import { boardFromText } from './utils'

const selfCaptureLegalityBoard= `
.OX#.
OOXX.
XXXOO
...O.
#####
`
describe(`Self capture legality: ${selfCaptureLegalityBoard}`, async() => {
  const gameState : GameState = {
    board: boardFromText(selfCaptureLegalityBoard, 5),
    turn: CurrentTurn.Black,
    komi: 7.5,
  }

  // Starts at a1 so the bottom left
  const legality = [
    false, false, false, false, false,  // Bottom row is offline
    true, true, true,
    false, // White piece there
    false, // Would be self capture
    false, false, false, false, false, // Pieces in this row
    false, false, false, false, // More pieces
    true, // Best move, as it prevents white from making life
    true, // Legal move, it's not self capture because it captures the white group
    false, false, false, // Pieces there
    true,
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
