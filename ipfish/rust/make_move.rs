use crate::board::Board;
use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;


/// Takes a board state and a point, and returns a board state that is the state after the move has been made.
/// Note this does not check legality, as its redundant, so its possible to place pieces over others and such.
/// # Arguments
///
/// * `point` - The point to make the move on.
/// * `board` - The state of the board.
pub fn make_move(point: usize, board: &Board) -> Board {
  let mut new_board: Board = Board {
    board: board.board.clone(),
    size: board.size,
    player: !board.player,
  };
  new_board.board[point] = board.player as u8;

  // Remove captured enemy stones
  for ajacent_point in get_adjacent_points(point, board) {
    if new_board.board[ajacent_point] == !board.player as u8 {
      if count_liberties_of_group(ajacent_point, &new_board) == 0 {
        // TODO: capture stones
      }
    }
  }

  return new_board;
}
