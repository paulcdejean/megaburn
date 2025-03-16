use crate::board::Board;
use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;


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
    komi: board.komi,
    opponent_passed: false,
  };

  // Place the stone.
  new_board.board[point] = board.player as u8;

  // Remove captured enemy stones.
  for adjacent_point in get_adjacent_points(point, board) {
    if new_board.board[adjacent_point] == new_board.player as u8 {
      if count_liberties_of_group(adjacent_point, &new_board) == 0 {
        remove_group(adjacent_point, &mut new_board);
      }
    }
  }

  return new_board;
}

fn remove_group(point: usize, board: &mut Board) {
  board.board[point] = PointState::Empty as u8;

  for adjacent_point in get_adjacent_points(point, board) {
    if board.board[adjacent_point] == board.player as u8 {
      remove_group(adjacent_point, board);
    }
  }
}
