import { PointState } from "@/types"
import css from "./css/IpFish.module.css"

interface GoPointProps {
  className: string,
  state: PointState,
}

function GoPoint(props : GoPointProps) {

  return (
    <>
      <td className={`${css.point} ${props.className}`}>
        {props.state}
      </td>
    </>
  )
}

export default GoPoint
