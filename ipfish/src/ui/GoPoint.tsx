import css from "./css/IpFish.module.css"

interface GoPointProps {
  className: string,
}

function GoPoint(props : GoPointProps) {

  return (
    <>
      <td className={`${css.point} ${props.className}`}/>
    </>
  )
}

export default GoPoint
