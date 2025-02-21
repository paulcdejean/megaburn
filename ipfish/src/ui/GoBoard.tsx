import css from "./css/IpFish.module.css"
 
function GoBoard() {

  return (
    <>
      <div className={css.boardBackground} >
        <table className={css.board}>
          <tr>
            <td className={`${css.intersection} ${css.topleft}`} />
            <td className={`${css.intersection} ${css.topmiddle}`} />
            <td className={`${css.intersection} ${css.topmiddle}`} />
            <td className={`${css.intersection} ${css.topmiddle}`} />
            <td className={`${css.intersection} ${css.topright}`} />
          </tr>
          <tr>
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
          </tr>
          <tr>
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
          </tr>
          <tr>
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
          </tr>
          <tr>
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
            <td className={css.intersection} />
          </tr>
        </table>
      </div>
    </>
  )
}

export default GoBoard
