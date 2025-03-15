#![allow(warnings)]
mod count_liberties_of_group;
mod player;
mod get_adjacent_points;
mod point_state;
mod board;
mod is_self_capture;
mod get_legal_moves;
mod board_from_string;
mod violates_superko;
mod make_move;
mod score;
mod minimax_score;
mod pass_move;

use core::f64;
use std::collections::HashSet;
use std::ops::Not;
use std::process::exit;
use std::thread::current;
use minimax_score::minimax_score;
use wasm_bindgen::prelude::*;
use std::panic;

use crate::player::Player;
use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::board::{Board, BoardHistory};
use crate::is_self_capture::is_self_capture;
use crate::get_legal_moves::get_legal_moves;
use crate::board_from_string::board_from_string;
use crate::score::score;
use crate::make_move::make_move;

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
#[wasm_bindgen]
pub fn get_analysis(input_history: &js_sys::Array, komi: &js_sys::Number, turn: &js_sys::Number) -> js_sys::Float64Array {
  panic::set_hook(Box::new(|panic_info| {
    wasm_bindgen::throw_str(format!("{}", panic_info).as_str());
  }));

  let current_board: Box<[u8]> = js_sys::Uint8Array::new(&input_history.iter().last().unwrap()).to_vec().into_boxed_slice();
  let mut board_history: BoardHistory = HashSet::new();
  for board in input_history.iter() {
    board_history.insert(js_sys::Uint8Array::new(&board).to_vec().into_boxed_slice());
  }

  let current_board: Board = Board {
    size: current_board.len().isqrt(),
    board: current_board,
    player: Player::from(turn.value_of()),
    komi: komi.value_of(),
  };

  let mut result: Vec<f64> = Vec::new();
  let mut point: usize = 0;
  for legality in get_legal_moves(&current_board, &board_history) {
    if(legality) {
      let minimax_score: f64 = minimax_score(&make_move(point, &current_board), &board_history, 1);
      result.push(minimax_score);
    } else {
      result.push(f64::NEG_INFINITY);
    }
    point += 1;
  }

  // This represents passing.
  result.push(score(&current_board));

  return js_sys::Float64Array::from(result.as_slice());
}
