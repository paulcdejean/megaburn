import { Game } from "@/game"
import css from "./css/IpFish.module.css"
import GoPoint from "./GoPoint"

interface GoBoardProps {
  game : Game
}
 
 
function GoBoard(props : GoBoardProps) {

  return (
    <>
      <div className={css.boardBackground} >
        <table className={css.board}>
          <tr>
            <td className={css.numericLabel}>5</td>
            <GoPoint className={`${css.topleft}`} state={props.game.state[20]} evaluation={0} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.game.state[21]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.game.state[22]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.topmiddle}`} state={props.game.state[23]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.topright}`} state={props.game.state[24]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>4</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.game.state[15]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[16]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[17]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[18]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.rightmiddle}`} state={props.game.state[19]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>3</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.game.state[10]} evaluation={1.5} bestMove={false}/>
            <GoPoint className={``} state={props.game.state[11]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[12]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[13]} evaluation={4.5} bestMove={true} />
            <GoPoint className={`${css.rightmiddle}`} state={props.game.state[14]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>2</td>
            <GoPoint className={`${css.leftmiddle}`} state={props.game.state[5]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[6]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[7]} evaluation={1.5} bestMove={false} />
            <GoPoint className={``} state={props.game.state[8]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.rightmiddle}`} state={props.game.state[9]} evaluation={1.5} bestMove={false} />
          </tr>
          <tr>
            <td className={css.numericLabel}>1</td>
            <GoPoint className={`${css.bottomright}`} state={props.game.state[0]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.game.state[1]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.game.state[2]} evaluation={1.5} bestMove={false} />
            <GoPoint className={`${css.bottommiddle}`} state={props.game.state[3]} evaluation={-3.5} bestMove={false} />
            <GoPoint className={`${css.bottomleft}`} state={props.game.state[4]} evaluation={1.5} bestMove={false} />
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
