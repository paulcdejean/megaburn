import cssInline from "./css/IpFish.module.css?inline"
import GoBoard from "./GoBoard"

function IpFish() {

  return (
    <>
      <style>{cssInline}</style>
      <p>
        Top text
      </p>
      <GoBoard />
      <p>
        Bottom text
      </p>
    </>
  )
}

export default IpFish
