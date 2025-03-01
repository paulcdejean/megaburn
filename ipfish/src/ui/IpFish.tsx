import { AnalysisState, Game, GameState } from "@/Game"
import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"

interface IpfishProps {
  game : Game
  initalGameState : GameState
  initalAnalysisState : AnalysisState
}

function IpFish(props : IpfishProps) {
   
  const [gameState, updateGameState] = React.useState(props.initalGameState);
   
  const [analysisState, updateAnalysisState] = React.useState(props.initalAnalysisState);

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard gameState={gameState}
               updateGameState={updateGameState}
               analysisState={analysisState}
               updateAnalysisState={updateAnalysisState}
               gameClass={props.game}
               boardSize={props.game.boardSize}
      />
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
