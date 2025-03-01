export function moveString(moveNumber : number, boardSize : number) : string {
  const goAlphabet = [...'abcdefghjklmnopqrstuvwxyz'];

  const column = moveNumber % boardSize
  const row = Math.floor(moveNumber / boardSize)

  return `${goAlphabet[column]}${row + 1}`
}
