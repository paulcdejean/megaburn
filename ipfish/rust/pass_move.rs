use crate::board::Board;

pub fn pass_move(board: &Board) -> Board {
  return Board {
    board: board.board.clone(),
    size: board.size,
    player: !board.player,
    komi: board.komi,
  };
}
