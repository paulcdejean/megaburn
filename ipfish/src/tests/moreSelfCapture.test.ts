import { expect, test, describe } from 'vitest'
import { getAnalysis } from '../getAnalysis'
import { CurrentTurn } from '../getCurrentTurn'
import { moveString } from '../moveString'
import { boardFromText } from './utils'

const moreSelfCaptureLegalityBoard= `
.....
.OO..
#.XX.
.OXOX
..XO.
`
describe(`Self capture legality: ${moreSelfCaptureLegalityBoard}`, async() => {
  const board = boardFromText(moreSelfCaptureLegalityBoard, 5)
  const komi = 7.5
  const turn = CurrentTurn.Black

  // Starts at a1 so the bottom left
  const legality = [
    true, true, false, false, true,
    true, false, false, false, false,
    false, true, false, false, true,
    true, false, false, true, true,
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
