
import { expect, test, describe } from 'vitest'
import { getAnalysis } from '../getAnalysis'
import { CurrentTurn } from '../getCurrentTurn'
import { moveString } from '../moveString'
import { boardFromText } from './utils'

const basicCaptureBoard= `
.....
OXOX.
.OX..
....#
...#.
`
describe(`Basic capture: ${basicCaptureBoard}`, async() => {
  const komi = 0.5
  const board = boardFromText(basicCaptureBoard, 5)
  const turn = CurrentTurn.Black

  // Starts at a1 so the bottom left
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

  const analysis = await getAnalysis([board], komi, turn)

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
