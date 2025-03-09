use std::collections::HashSet;

use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::player::Player;
use crate::board::Board;
use crate::is_self_capture::is_self_capture;
use crate::violates_superko::violates_superko;

/// Returns a sequence of bool where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko.
pub fn get_legal_moves(board: &Board, board_history: &HashSet<Box<[u8]>>) -> Box<[bool]> {
  let mut result: Vec<bool> = Vec::new();

  for point in 0..board.board.len() {
    // The move is illegal if there is already a piece there.
    if board.board[point] != PointState::Empty as u8 {
      result.push(false);
    }
    // The move is illegal if it would lead to a self capture.
    else if is_self_capture(point, board) {
      result.push(false);
    }
    // The move is illegal if it would repeat a previous board state.
    else if violates_superko(point, board, board_history) {
      result.push(false);
    }
    // Otherwise the move is legal.
    else {
      result.push(true);
    }
  }
  return result.into_boxed_slice();
}

#[cfg(test)]
mod tests {
  use std::thread::current;

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
    };
    let board_history: HashSet<Box<[u8]>> = HashSet::new();
    let result: Box<[bool]> = get_legal_moves(&board, &board_history);
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
    };

    let board_history: HashSet<Box<[u8]>> = HashSet::new();

    let result: Box<[bool]> = get_legal_moves(&board, &board_history);
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
    };

    let board_history: HashSet<Box<[u8]>> = HashSet::new();
    let result: Box<[bool]> = get_legal_moves(&board, &board_history);
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
    };
    let mut board_history: HashSet<Box<[u8]>> = HashSet::new();
    board_history.insert(previous_board);
    board_history.insert(current_board);
    

    let result: Box<[bool]> = get_legal_moves(&board, &board_history);
    assert_eq!(legality, *result);
  }
}
