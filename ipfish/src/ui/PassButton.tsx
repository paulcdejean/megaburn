import { AnalysisState, BoardState, Game } from "@/Game"

interface PassButtonProps {
  gameClass : Game
  evaluation : number
  bestMove : boolean
  updateBoardState : (boardState: BoardState) => void,
  updateAnalysisState : (analysisState: AnalysisState) => void
}

 
function PassButton(props : PassButtonProps) {
  return (
    <>
      <button type="button" onClick={() => void props.gameClass.passTurn()}>Pass</button>
    </>
  )
}

export default PassButton
