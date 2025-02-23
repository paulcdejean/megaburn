import { Game } from "@/game"
import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"

interface IpfishProps {
  game : Game
}

function IpFish(props : IpfishProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gameState, playMove] = React.useState(props.game.getGameState());

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard gameState={gameState}/>
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
