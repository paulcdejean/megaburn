use crate::board::Board;

pub fn get_adjacent_points(point: usize, board: &Board) -> Box<[usize]> {
  let mut result : Vec<usize> = Vec::with_capacity(4);

  // Down
  if point >= board.size {
    result.push(point - board.size);
  }
  // Up
  if point < board.board.len() - board.size {
    result.push(point + board.size)
  }
  // Left
  if point % board.size > 0 {
    result.push(point - 1);
  }
  // Right
  if point % board.size < board.size - 1 {
    result.push(point + 1);
  }
  return result.into_boxed_slice();
}
