use crate::board::Board;
use crate::get_adjacent_points::get_adjacent_points;
use crate::is_in_atari::is_in_atari;
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

  // Is there are adjacent enemy groups in atari, remove them.
  // new_board.player is the enemy player.
  for adjacent_point in get_adjacent_points(point, board) {
    if new_board.board[adjacent_point] == new_board.player as u8 && is_in_atari(adjacent_point, &new_board, point) {
        remove_group(adjacent_point, &mut new_board);
    }
  }
  // Place the stone.
  new_board.board[point] = board.player as u8;

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
