use crate::get_adjacent_points::get_adjacent_points;
use crate::is_in_atari::is_in_atari;
use crate::make_move::make_move;
use crate::point_state::PointState;

use crate::board::{Board, BoardHistory};

/// Returns a sequence of bool where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko. If this none then superko isn't calculated.
pub fn get_legal_moves(board: &Board, board_history: Option<&BoardHistory>) -> Box<[bool]> {
  let mut result: Vec<bool> = Vec::with_capacity(board.board.len());

  for point in 0..board.board.len() {
    // The move is illegal if there is already a piece there.
    if board.board[point] != PointState::Empty as u8 {
      result.push(false);
    }
    // The move is illegal if it captures an enemy group and it violates superko.
    if captures_enemy_group(point, board) {
      result.push(!violates_superko(point, board, board_history))
    }
    // The move is illegal if it would lead to a self capture.
    else if is_self_capture(point, board) {
      result.push(false);
    }
    // Otherwise it is legal.
    else {
     result.push(true);
    }
  }
  return result.into_boxed_slice();
}

fn is_self_capture(point: usize, board: &Board) -> bool {
  for adjacent_point in get_adjacent_points(point, board) {
    // If there's an adjacent empty point, it is not self capture
    if board.board[adjacent_point] == PointState::Empty as u8 {
      return false;
    }
    // If there's an adjacent friendly group that is not in atari, then it's not self capture.
    else if board.board[adjacent_point] == board.player as u8 {
      if !is_in_atari(adjacent_point, board, point) {
        return false;
      }
    }
    // If there's an adjacent enemy group that is in atari, then it's not self capture.
    // However we already check for this in another place so we don't check that here.
  }
  return true;
}

fn captures_enemy_group(point: usize, board: &Board) -> bool {
  for adjacent_point in get_adjacent_points(point, board) {
    // If there's an adjacent enemy group that is in atari, then it captures an enemy group.
    if board.board[adjacent_point] == !board.player as u8 {
      if is_in_atari(adjacent_point, board, point) {
        return true;
      }
    }
  }
  return false;
}

fn violates_superko(point: usize, board: &Board, board_history: Option<&BoardHistory>) -> bool {
  match board_history {
    None => return false,
    Some(s) => {
      let new_position: Box<[u8]> = make_move(point, board).board;

      if s.contains(&new_position) {
        return true;
      } else {
        return false;
      }
    }
  }
}


#[cfg(test)]
mod tests {
  use std::collections::HashSet;
  use rustc_hash::FxBuildHasher;

use crate::player::Player;
  use crate::board_from_string::board_from_string;
  use super::*;

  #[test]
  fn basic_capture() {
    let board:Box<[u8]> = board_from_string("
    .....
    OXOX.
    .OX..
    ....#
    ...#.
    ", 5);
    let legality: [bool; 25] = [
      true, true, true,
      false, // Node is offline
      false, // Surrounded by offline nodes
      true, true, true, true,
      false, // Node is offline
      true,
      false, // White piece there
      false, // Black piece there
      true, true,
      false, false, false, false, // Pieces there
      true,
      true, true, true, true, true,
    ];

    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5,
      opponent_passed: false,
    };
    let result: Box<[bool]> = get_legal_moves(&board, None);
    assert_eq!(*result, legality);
  }
  #[test]
  fn self_capture_legality() {
    let board:Box<[u8]>  = board_from_string("
    .OX#.
    OOXX.
    XXXOO
    ...O.
    #####
    ", 5);
    let legality: [bool; 25] = [
      false, false, false, false, false,  // Bottom row is offline
      true, true, true,
      false, // White piece there
      false, // Would be self capture
      false, false, false, false, false, // Pieces in this row
      false, false, false, false, // More pieces
      true, // Best move, as it prevents white from making life
      true, // Legal move, it's not self capture because it captures the white group
      false, false, false, // Pieces there
      true,
    ];
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5,
      opponent_passed: false,
    };

    let result: Box<[bool]> = get_legal_moves(&board, None);
    assert_eq!(*result, legality);
  }

  #[test]
  fn more_self_capture_legality() {
    let board: Box<[u8]> = board_from_string("
    .....
    .OO..
    #.XX.
    .OXOX
    ..XO.
    ", 5);
    let legality: [bool; 25] = [
      true, true, false, false, true,
      true, false, false, false, false,
      false, true, false, false, true,
      true, false, false, true, true,
      true, true, true, true, true,
    ];

    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5,
      opponent_passed: false,
    };

    let result: Box<[bool]> = get_legal_moves(&board, None);
    assert_eq!(*result, legality);
  }

  #[test]
  fn first_ko() {
    let previous_board: Box<[u8]>  = board_from_string("
    ...X.
    XOOOX
    XXXOO
    .XOOO
    X.#..
    ", 5);
    let current_board: Box<[u8]>  = board_from_string("
    ...XO
    XOOO.
    XXXOO
    .XOOO
    X.#..
    ", 5);
    let legality: [bool; 25] = [
      false, true, false, true, true,
      true, false, false, false, false,
      false, false, false, false, false,
      false, false, false, false,
      false, // Ko!
      true, true, true, false, false,
    ];

    let board: Board = Board {
      board: current_board.clone(),
      size: 5,
      player: Player::Black,
      komi: 7.5,
      opponent_passed: false,
    };
    let mut board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
    board_history.insert(previous_board);
    board_history.insert(current_board);
    

    let result: Box<[bool]> = get_legal_moves(&board, Some(&board_history));
    // Test the ko before testing the whole thing.
    assert_eq!(legality[20], result[20]);
    assert_eq!(legality, *result);
  }
}
