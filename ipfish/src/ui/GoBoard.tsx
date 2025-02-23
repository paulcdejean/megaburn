 
import { EvaluationState as AnalysisState, Game, GameState } from "@/game"
import css from "./css/IpFish.module.css"
import GoPoint from "./GoPoint"

interface GoBoardProps {
  gameClass : Game
  gameState : GameState
  updateGameState : (gameState: GameState) => void
  boardSize : 5 | 7 | 9 | 13 | 19
  analysisState : AnalysisState
  updateAnalysisState : (analysisState: AnalysisState) => void
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
                          evaluation={props.analysisState[(props.boardSize - row - 1) * row + column]}
                          bestMove={false}
                          updateGameState={props.updateGameState}
                          gameClass={props.gameClass}
                          row={props.boardSize - row - 1}
                          column={column}
                        />
              })}
            </tr>
          })}
          <tr>
            <td></td>{/* Botttom left blank corner space. TODO put a pass turn button here maybe? */}
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
