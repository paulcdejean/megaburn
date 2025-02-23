import { AnalysisState, Game, GameState, PointState } from "@/game"
import css from "./css/IpFish.module.css"
import blackPiece from "./svg/Go_b.svg"
import whitePiece from "./svg/Go_w.svg"
import offlinePoint from "./svg/bricks.svg"

interface GoPointProps {
  pointState: PointState,
  evaluation: number,
  bestMove: boolean,
  updateGameState : (gameState: GameState) => void,
  gameClass : Game
  row : number
  column : number
  updateAnalysisState : (analysisState: AnalysisState) => void
}

function formatEvaluation(evaluation : number) : string {
  if(evaluation === Number.NEGATIVE_INFINITY) {
    return "x"
  } else if (evaluation > 0) {
    return "+".concat(evaluation.toString())
  } else {
    return evaluation.toString()
  }
}

function getEvaluationClass(evaluation : number, bestMove : boolean) : string {
  if (bestMove) {
    return css.evalBest
  }
  else if(evaluation === Number.NEGATIVE_INFINITY) {
    return css.evalIllegal
  } else if (evaluation > 0) {
    return css.evalPositive
  } else {
    return css.evalNegative
  }
}
function GoPoint(props : GoPointProps) {
  return (
    <>
      <td className={`${css.point}`} onClick={() => void props.gameClass.makeMove(props.row, props.column, props.updateGameState, props.updateAnalysisState)} > 
        <img src={blackPiece} className={css.goPiece} style={{ display: props.pointState === PointState.Black ? "block" : "none"}} />
        <img src={whitePiece} className={css.goPiece} style={{ display: props.pointState === PointState.White ? "block" : "none"}} />
        <img src={offlinePoint} className={css.goPiece} style={{ display: props.pointState === PointState.Offline ? "block" : "none"}} />
        <div className={getEvaluationClass(props.evaluation, props.bestMove)} style={{ display: props.pointState === PointState.Empty ? "block" : "none"}} >
          <div className={css.evaluationText}>{formatEvaluation(props.evaluation)}</div>
        </div>
      </td>
    </>
  )
}

export default GoPoint
