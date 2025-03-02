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
fn get_legal_moves(board: &Box<[u8]>, board_history: &HashSet<Box<[u8]>>) -> Box<[bool]> {
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
  return result.into_boxed_slice();
}

fn is_self_capture(point: usize, board: &Box<[u8]>) -> bool {
  // TODO
  return false
}

fn violates_superko(point: usize, board: &Box<[u8]>, board_history: &HashSet<Box<[u8]>>) -> bool {
  return false
}
