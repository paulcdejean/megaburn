import { Game } from "@/game"
import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"

interface IpfishProps {
  game : Game
}

function IpFish(props : IpfishProps) {

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard game={props.game}/>
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
