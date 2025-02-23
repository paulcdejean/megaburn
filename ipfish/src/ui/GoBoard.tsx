import { GameState } from "@/game"
import css from "./css/IpFish.module.css"
import GoPoint from "./GoPoint"

interface GoBoardProps {
  gameState : GameState
}
 
 
function GoBoard(props : GoBoardProps) {

  return (
    <>
      <div className={css.boardBackground} >
        <table className={css.board}>
          <tr>
            <td className={css.numericLabel}>5</td>
            <GoPoint className={`${css.topleft}`} state={props.gameState.board[20]} evaluation={0} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.gameState.board[21]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.gameState.board[22]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.gameState.board[23]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.topright}`} state={props.gameState.board[24]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>4</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.gameState.board[15]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[16]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[17]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[18]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.rightmiddle}`} state={props.gameState.board[19]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>3</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.gameState.board[10]} evaluation={1.5} bestMove={false}/>
            <GoPoint className={``} state={props.gameState.board[11]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[12]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[13]} evaluation={4.5} bestMove={true} />
            <GoPoint className={`${css.rightmiddle}`} state={props.gameState.board[14]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>2</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.gameState.board[5]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[6]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[7]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.gameState.board[8]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.rightmiddle}`} state={props.gameState.board[9]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>1</td>
            <GoPoint className={`${css.bottomright}`} state={props.gameState.board[0]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.gameState.board[1]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.gameState.board[2]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.gameState.board[3]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.bottomleft}`} state={props.gameState.board[4]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td></td>
            <td className={css.alphabeticLabel}>a</td>
            <td className={css.alphabeticLabel}>b</td>
            <td className={css.alphabeticLabel}>c</td>
            <td className={css.alphabeticLabel}>d</td>
            <td className={css.alphabeticLabel}>e</td>
          </tr>
        </table>
      </div>
    </>
  )
}

export default GoBoard
