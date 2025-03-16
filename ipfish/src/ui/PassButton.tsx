import { BoardState, Game, Analysis } from "@/Game"
import css from "./css/IpFish.module.css"

interface PassButtonProps {
  gameClass : Game
  evaluation : number
  bestMove : boolean
  updateBoardState : (boardState: BoardState) => void,
  updateAnalysisState : (analysisState: Analysis) => void
}

function getEvaluationClass(evaluation : number, bestMove : boolean) : string {
  if (bestMove) {
    return css.passBest
  } else if (evaluation > 0) {
    return css.passPositive
  } else {
    return css.passNegative
  }
}
 
function PassButton(props : PassButtonProps) {
  return (
    <>
      <button className={getEvaluationClass(props.evaluation, props.bestMove)} type="button" onClick={() => void props.gameClass.passTurn(props.updateBoardState, props.updateAnalysisState)}>
        Pass
        <br />
        {props.evaluation === Number.NEGATIVE_INFINITY ? "-inf" : props.evaluation.toFixed(2)}
      </button>
    </>
  )
}

export default PassButton
