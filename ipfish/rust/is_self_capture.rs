use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::newplayer::Player;
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

#[cfg(test)]
mod tests {
  use crate::board_from_string::board_from_string;
  use super::*;

  #[test]
  fn self_capture_in_opponent_group() {
    let board_string: &str = "
    ..XO.
    X.XOO
    #XXOO
    X.XOO
    .XXX.
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5,
    };

    // Count the liberties for 24 aka e5
    let result: bool = is_self_capture(24, &board);
    assert_eq!(result, true);
  }

  #[test]
  fn not_self_capture_captures_opponent() {
    let board_string: &str = "
    ..XO.
    X.XOO
    #XXOO
    X.XOO
    .XXXX
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5,
    };

    // Count the liberties for 24 aka e5
    let result: bool = is_self_capture(24, &board);
    assert_eq!(result, false);
  }
}
