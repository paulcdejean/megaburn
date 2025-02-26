#![allow(warnings)]
use core::f64;
use std::collections::HashSet;

use wasm_bindgen::prelude::*;

#[repr(u8)]
enum PointState {
  Empty = 1,
  White = 2,
  Black = 3,
  Offline = 4,
}


/// Squares a number, I just think the documentation is really cool
///
/// # Arguments
///
/// * `n` - The number to square.
// #[wasm_bindgen]
// pub fn wasmsquare(n: js_sys::Number) -> js_sys::Number {
//   return n.clone() * n;
// }

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
#[wasm_bindgen]
pub fn get_analysis(board_history: &js_sys::Array) -> js_sys::Float64Array {
  let current_board: Vec<u8> = js_sys::Uint8Array::new(&board_history.iter().last().unwrap()).to_vec();
  let mut history: HashSet<Vec<u8>> = HashSet::new();
  for board in board_history.iter() {
    history.insert(js_sys::Uint8Array::new(&board).to_vec());
  }

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

/// Returns a Vec<bool> where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko.
fn get_legal_moves(board: &Vec<u8>, board_history: &HashSet<Vec<u8>>) -> Vec<bool> {
  let mut result: Vec<bool> = Vec::new();

  for point in 0..board.len() {
    // The move is illegal if there is already a piece there.
    if board[point] != PointState::Empty as u8 {
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
  return result;
}

fn is_self_capture(point: usize, board: &Vec<u8>) -> bool {
  return false
}

fn violates_superko(point: usize, board: &Vec<u8>, board_history: &HashSet<Vec<u8>>) -> bool {
  return false
}
