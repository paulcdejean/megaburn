import { Game } from "@/game"
import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"

interface IpfishProps {
  game : Game
}

function IpFish(props : IpfishProps) {
   
  const [gameState, updateGameState] = React.useState(props.game.getGameState());

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard gameState={gameState} updateGameState={updateGameState} gameClass={props.game} boardSize={props.game.boardSize} />
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
