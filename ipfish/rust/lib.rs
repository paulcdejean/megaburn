#![allow(warnings)]
mod count_liberties_of_group;
mod player;
mod get_adjacent_points;
mod point_state;
mod board;
mod is_self_capture;
mod get_legal_moves;

use core::f64;
use std::{collections::HashSet, ops::Not};
use wasm_bindgen::prelude::*;

use crate::player::Player;
use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::board::Board;
use crate::is_self_capture::is_self_capture;
use crate::get_legal_moves::get_legal_moves;

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
  for go_move in get_legal_moves(&current_board, &history) {
    if(go_move) {
      result.push(3.5);
    } else {
      result.push(f64::NEG_INFINITY);
    }
  }

  return js_sys::Float64Array::from(result.as_slice());
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
