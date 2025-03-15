import { BoardState, Game } from "@/Game"
import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"
import { CurrentTurn } from "@/getCurrentTurn"
import { AnalysisState } from "@/analysis"

interface IpfishProps {
  game : Game
  initalBoardState : BoardState
  komi : number
  initialTurn : CurrentTurn
  initalAnalysisState : AnalysisState
}

function IpFish(props : IpfishProps) {
   
  const [boardState, updateBoardState] = React.useState(props.initalBoardState);
   
  const [analysisState, updateAnalysisState] = React.useState(props.initalAnalysisState);

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard 
               boardState={boardState}
               updateBoardState={updateBoardState}
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
