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
mod final_score;
mod pass_move;
mod montecarlo_score;
mod minimax_mc_strategy;
mod minimax_ab_strategy;
mod pick_strategy;

use core::f64;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;
use std::panic;

use crate::player::Player;
use crate::board::{Board, BoardHistory};
use crate::pick_strategy::pick_strategy;

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
#[wasm_bindgen]
pub fn get_analysis(input_history: &js_sys::Array,
                    komi: &js_sys::Number,
                    turn: &js_sys::Number,
                    opponent_passed: &js_sys::Boolean) -> js_sys::Float64Array {
  panic::set_hook(Box::new(|panic_info| {
    wasm_bindgen::throw_str(format!("{}", panic_info).as_str());
  }));

  let current_board: Box<[u8]> = js_sys::Uint8Array::new(&input_history.iter().last().unwrap()).to_vec().into_boxed_slice();
  let mut board_history: BoardHistory = HashSet::new();
  for board in input_history.iter() {
    board_history.insert(js_sys::Uint8Array::new(&board).to_vec().into_boxed_slice());
  }

  let board: Board = Board {
    size: current_board.len().isqrt(),
    board: current_board,
    player: Player::from(turn.value_of()),
    komi: komi.value_of(),
    opponent_passed: false,
  };

  let result: Vec<f64> = pick_strategy(&board, &board_history, opponent_passed.value_of());

  return js_sys::Float64Array::from(result.as_slice());
}
