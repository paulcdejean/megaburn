import cssInline from "./css/IpFish.module.css?inline"
import css from "./css/IpFish.module.css"
import GoBoard from "./GoBoard"

function IpFish() {

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard className={css.board} />
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
