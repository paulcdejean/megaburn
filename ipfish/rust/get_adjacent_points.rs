use crate::board::Board;

pub fn get_adjacent_points(point: usize, board: &Board) -> impl Iterator<Item = usize> + use<> {
  let size = board.size;
  let len = board.board.len();
  [
    (point >= size).then(|| point - size),
    (point < len - size).then(|| point + size),
    (point % size > 0).then(|| point - 1),
    (point % size < size - 1).then(|| point + 1),
  ]
  .into_iter()
  .flatten()
}
