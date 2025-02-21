import { Game } from "@/game"
import css from "./css/IpFish.module.css"
import GoPoint from "./GoPoint"

interface GoBoardProps {
  game : Game
}
 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function GoBoard(props : GoBoardProps) {

  return (
    <>
      <div className={css.boardBackground} >
        <table className={css.board}>
          <tr>
            <GoPoint className={`${css.topleft}`} />
            <GoPoint className={`${css.topmiddle}`} />
            <GoPoint className={`${css.topmiddle}`} />
            <GoPoint className={`${css.topmiddle}`} />
            <GoPoint className={`${css.topright}`} />
          </tr>
          <tr>
            <GoPoint className={`${css.leftmiddle}`} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={`${css.rightmiddle}`} />
          </tr>
          <tr>
            <GoPoint className={`${css.leftmiddle}`} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={`${css.rightmiddle}`} />
          </tr>
          <tr>
            <GoPoint className={`${css.leftmiddle}`} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={``} />
            <GoPoint className={`${css.rightmiddle}`} />
          </tr>
          <tr>
            <GoPoint className={`${css.bottomright}`} />
            <GoPoint className={`${css.bottommiddle}`} />
            <GoPoint className={`${css.bottommiddle}`} />
            <GoPoint className={`${css.bottommiddle}`} />
            <GoPoint className={`${css.bottomleft}`} />
          </tr>
        </table>
      </div>
    </>
  )
}

export default GoBoard
