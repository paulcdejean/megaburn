#![allow(warnings)]
mod count_liberties_of_group;
mod player;
mod get_adjacent_points;
mod point_state;
mod board;

use core::f64;
use std::{collections::HashSet, ops::Not};
use wasm_bindgen::prelude::*;
use crate::player::Player;
use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::board::Board;

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
#[wasm_bindgen]
pub fn get_analysis(board_history: &js_sys::Array) -> js_sys::Float64Array {
  let current_board: Box<[u8]> = js_sys::Uint8Array::new(&board_history.iter().last().unwrap()).to_vec().into_boxed_slice();
  let mut history: HashSet<Box<[u8]>> = HashSet::new();
  for board in board_history.iter() {
    history.insert(js_sys::Uint8Array::new(&board).to_vec().into_boxed_slice());
  }

  let current_board: Board = Board {
    size: current_board.len().isqrt(),
    board: current_board,
    player: Player::Black,
  };

  let mut result: Vec<f64> = Vec::new();
  for go_move in get_legal_moves(Player::Black, &current_board, &history) {
    if(go_move) {
      result.push(3.5);
    } else {
      result.push(f64::NEG_INFINITY);
    }
  }

  return js_sys::Float64Array::from(result.as_slice());
}

/// Returns a Vec<bool> where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko.
fn get_legal_moves(active_player: Player, board: &Board, board_history: &HashSet<Box<[u8]>>) -> Box<[bool]> {
  let mut result: Vec<bool> = Vec::new();

  for point in 0..board.board.len() {
    // The move is illegal if there is already a piece there.
    if board.board[point] != PointState::Empty as u8 {
      result.push(false);
    }
    // The move is illegal if it would lead to a self capture.
    else if is_self_capture(active_player, point, board) {
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

fn is_self_capture(active_player: Player, point: usize, board: &Board) -> bool {
  for point in get_adjacent_points(point, board) {
    // If there's an adjacent empty point, it is not self capture
    if board.board[point] == PointState::Empty as u8 {
      return false;
    }
    // If there's an adjacent friendly group with more than 1 liberty, it's not self capture
    else if board.board[point] == active_player as u8 {
      if count_liberties_of_group(point, board) > 1 {
        return false;
      }
    }
    // If there's an adjacent enemy group with only 1 liberty, then this move captures it so it's not self capture
    else if board.board[point] == !active_player as u8 {
      if count_liberties_of_group(point, board) <= 1 {
        return false;
      }
    }
  }
  return true;
}

fn violates_superko(point: usize, board: &Board, board_history: &HashSet<Box<[u8]>>) -> bool {
  return false;
}



// #[cfg(test)]
// mod tests {
//   use super::*;

//   #[test]
//   fn liberties_counted_correctly() {
//       // .....
//       // .OO..
//       // #.XX.
//       // .OXOX
//       // ..XO.

//       let board: Box<[u8]> = Box::from([
//         1, 1, 2, 3, 1,
//         1, 3, 2, 3, 2,
//         4, 1, 2, 2, 1,
//         1, 3, 3, 1, 1,
//         1, 1, 1, 1, 1,
//       ]);

//       // Count the liberties for 11 aka b3
//       let result = count_liberties_of_group(12, &board);
//       assert_eq!(result, 4);
//   }
// }
