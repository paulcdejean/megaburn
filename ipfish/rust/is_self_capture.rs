use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::player::Player;
use crate::board::Board;

pub fn is_self_capture(point: usize, board: &Board) -> bool {
  for point in get_adjacent_points(point, board) {
    // If there's an adjacent empty point, it is not self capture
    if board.board[point] == PointState::Empty as u8 {
      return false;
    }
    // If there's an adjacent friendly group with more than 1 liberty, it's not self capture
    else if board.board[point] == board.player as u8 {
      if count_liberties_of_group(point, board) > 1 {
        return false;
      }
    }
    // If there's an adjacent enemy group with only 1 liberty, then this move captures it so it's not self capture
    else if board.board[point] == !board.player as u8 {
      if count_liberties_of_group(point, board) <= 1 {
        return false;
      }
    }
  }
  return true;
}
