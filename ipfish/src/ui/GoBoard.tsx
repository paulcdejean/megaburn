import { BoardState, Game, Analysis } from "@/Game"
import css from "./css/IpFish.module.css"
import GoPoint from "./GoPoint"
import PassButton from "./PassButton"

interface GoBoardProps {
  gameClass : Game
  boardState : BoardState
  updateBoardState : (boardState: BoardState) => void
  boardSize : 5 | 7 | 9 | 13 | 19
  analysisState : Analysis
  updateAnalysisState : (analysisState: Analysis) => void
}

// The go alphabet skips the letter I for some reason
const goAlphabet = [...'abcdefghjklmnopqrstuvwxyz'];

function GoBoard(props : GoBoardProps) {
  return (
    <>
      <div className={css.boardBackground} >
        <table className={css.board}>
          {[...Array(props.boardSize).keys()].map((row) => {
            return <tr key={row}>
              <td className={css.numericLabel}>{props.boardSize - row}</td>
              {[...Array(props.boardSize).keys()].map((column) => {
                return <GoPoint
                          key={column}
                          pointState={props.gameClass.getPoint(props.boardSize - row - 1, column)}
                          evaluation={props.analysisState.analysis[(props.boardSize - row - 1) * props.boardSize + column]}
                          bestMove={(props.boardSize - row - 1) * props.boardSize + column === props.analysisState.bestMove}
                          updateBoardState={props.updateBoardState}
                          updateAnalysisState={props.updateAnalysisState}
                          gameClass={props.gameClass}
                          row={props.boardSize - row - 1}
                          column={column}
                        />
              })}
            </tr>
          })}
          <tr>
            <td>
              <PassButton
                evaluation={props.analysisState.analysis[props.boardSize**2]}
                bestMove={props.boardSize**2 === props.analysisState.bestMove}
                gameClass={props.gameClass}
                updateBoardState={props.updateBoardState}
                updateAnalysisState={props.updateAnalysisState}
              />
            </td>
            {[...Array(props.boardSize).keys()].map((row) => {
              return <td className={css.alphabeticLabel}>{goAlphabet[row]}</td>
            })}
          </tr>
        </table>
      </div>
    </>
  )
}

export default GoBoard
