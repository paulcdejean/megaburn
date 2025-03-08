use std::collections::HashSet;

use crate::board::Board;
use crate::player::Player;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;

pub fn count_liberties_of_group(point: usize, board: &Board) -> usize {
  let mut group: HashSet<usize> = HashSet::from([point]);
  
  let player: Player;
  if board.board[point] == Player::Black as u8 {
    player = Player::Black;
  } else if board.board[point] == Player::White as u8 {
    player = Player::White;
  } else {
    panic!("Can't get the group of an empty of offline point!");
  }

  let mut unchecked_points: Vec<usize> = Vec::from(get_adjacent_points(point, board));

  let mut liberties: HashSet<usize> = HashSet::new();

  while unchecked_points.len() > 0 {
    let point_to_check: usize = unchecked_points.pop().unwrap();
    if board.board[point_to_check] == player as u8 {
      if !group.contains(&point_to_check) {
        unchecked_points.extend_from_slice(&get_adjacent_points(point_to_check, board));
      }
      group.insert(point_to_check);
    } else if board.board[point_to_check] == PointState::Empty as u8 {
      liberties.insert(point_to_check);
    }
  }

  return liberties.len();
}

#[cfg(test)]
mod tests {
  use crate::board_from_string::board_from_string;
  use super::*;

  #[test]
  fn liberties_counted_correctly() {
    let board_string: &str = "
    .....
    .OO..
    #.XX.
    .OXOX
    ..XO.
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
    };

    // Count the liberties for 12 aka c3
    let result: usize = count_liberties_of_group(12, &board);
    assert_eq!(result, 4);
  }
}
