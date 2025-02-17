import RouletteCell from "./RouletteCell"

import cssInline from "./css/RouletteTable.module.css?inline"
import css from "./css/RouletteTable.module.css"

function RouletteHelper() {

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Click on the table one time to indicate your bet.
        Click a second time to indicate the roulette result.
        Only numerical bets are supported.
        The green square, when it appears, has a 90% chance of winning.
      </p>
      <p>
        Recent gambles: DERP
      </p>
      <p>
        Recent results: DERP
      </p>
      <table className={css.table}>
        <tr>
          <td className={`${css.cell} ${css.blank}`} />
          <RouletteCell num={3} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={6} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={9} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={12} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={15} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={18} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={21} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={24} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={27} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={30} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={33} className={`${css.cell} ${css.topmost}`} />
          <RouletteCell num={36} className={`${css.cell} ${css.topmost}`} />
        </tr>
        <tr>
          <RouletteCell num={0} className={`${css.cell} ${css.leftmost}`} />
          <RouletteCell num={2} className={css.cell} />
          <RouletteCell num={5} className={css.cell} />
          <RouletteCell num={8} className={css.cell} />
          <RouletteCell num={11} className={css.cell} />
          <RouletteCell num={14} className={css.cell} />
          <RouletteCell num={17} className={css.cell} />
          <RouletteCell num={20} className={css.cell} />
          <RouletteCell num={23} className={css.cell} />
          <RouletteCell num={26} className={css.cell} />
          <RouletteCell num={29} className={css.cell} />
          <RouletteCell num={32} className={css.cell} />
          <RouletteCell num={35} className={css.cell} />
        </tr>
        <tr>
          <td className={`${css.cell} ${css.blankbottom} ${css.blank}`} />
          <RouletteCell num={1} className={css.cell} />
          <RouletteCell num={4} className={css.cell} />
          <RouletteCell num={7} className={css.cell} />
          <RouletteCell num={10} className={css.cell} />
          <RouletteCell num={13} className={css.cell} />
          <RouletteCell num={16} className={css.cell} />
          <RouletteCell num={19} className={css.cell} />
          <RouletteCell num={22} className={css.cell} />
          <RouletteCell num={25} className={css.cell} />
          <RouletteCell num={28} className={css.cell} />
          <RouletteCell num={31} className={css.cell} />
          <RouletteCell num={34} className={css.cell} />
        </tr>
      </table>
    </>
  )
}

export default RouletteHelper
