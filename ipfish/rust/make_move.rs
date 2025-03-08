use crate::board::Board;

pub fn make_move(point: usize, board: &Board) -> Board {
  let new_board: Board = Board {
    board: board.board.clone(),
    size: board.size,
    player: !board.player,
  };

  return new_board;
}
