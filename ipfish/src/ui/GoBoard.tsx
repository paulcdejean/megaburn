interface GoBoardProps {
  className: string,
}


 
function GoBoard(props: GoBoardProps) {

  return (
    <>
      <table className={props.className} >
      </table>
    </>
  )
}

export default GoBoard
