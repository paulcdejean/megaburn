import { PointState } from "../types.d"
import css from "./css/IpFish.module.css"
import blackPiece from "./svg/Go_b.svg"
import whitePiece from "./svg/Go_w.svg"
import offlinePoint from "./svg/bricks.svg"

interface GoPointProps {
  className: string,
  state: PointState,
  evaluation: number,
}

function formatEvaluation(evaluation : number) : string {
  if(evaluation === 0) {
    return "x"
  } else if (evaluation > 0) {
    return "+".concat(evaluation.toString())
  } else {
    return evaluation.toString()
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getEvaluationClass(evaluation : number) : string {
  if(evaluation === 0) {
    return css.evalillegal
  } else if (evaluation > 0) {
    return css.evalpositive
  } else {
    return css.evalnegative
  }
}

function GoPoint(props : GoPointProps) {

  return (
    <>
      <td className={`${css.point} ${props.className}`}>
        <img src={blackPiece} className={css.gopiece} style={{ display: props.state === PointState.Black ? "block" : "none"}} />
        <img src={whitePiece} className={css.gopiece} style={{ display: props.state === PointState.White ? "block" : "none"}} />
        <img src={offlinePoint} className={css.gopiece} style={{ display: props.state === PointState.Offline ? "block" : "none"}} />
        <span style={{ display: props.state === PointState.Empty ? "block" : "none"}} >
          {formatEvaluation(props.evaluation)}
        </span>
      </td>
    </>
  )
}

export default GoPoint
