#![allow(warnings)]
pub mod bitset;
pub mod board;
pub mod board_from_string;
pub mod final_score;
pub mod get_adjacent_points;
pub mod get_legal_moves;
pub mod is_in_atari;
pub mod make_move;
pub mod mcts_strategy;
pub mod montecarlo_score;
pub mod pass_move;
pub mod pick_strategy;
pub mod player;
pub mod point_state;

use core::f64;
use rand::SeedableRng;
use rand_pcg::Pcg64Mcg;
use rustc_hash::FxBuildHasher;
use std::collections::HashSet;
use std::panic;
use wasm_bindgen::prelude::*;

use crate::board::{Board, BoardHistory};
use crate::pick_strategy::pick_strategy;
use crate::player::Player;

pub type RNG = Pcg64Mcg;

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
/// * `komi` - The extra points white gets for the final score.
/// * `turn` - Whether it's black or white's turn to play. Currently only black has been tested. Trying to analyze for white may crash or lead to bad moves.
/// * `opponent_passed` - Whether the opponent passed last turn. This has important implications for analyzing the value of passing.
#[wasm_bindgen]
pub fn get_analysis(input_history: &js_sys::Array, komi: &js_sys::Number, turn: &js_sys::Number, opponent_passed: &js_sys::Boolean) -> js_sys::Float64Array {
    panic::set_hook(Box::new(|panic_info| {
        wasm_bindgen::throw_str(format!("{}", panic_info).as_str());
    }));

    let current_board: Box<[u8]> = js_sys::Uint8Array::new(&input_history.iter().last().unwrap()).to_vec().into_boxed_slice();
    let mut board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
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

    let mut rng: RNG = RNG::seed_from_u64(js_sys::Math::random().to_bits());

    let result: Vec<f64> = pick_strategy(board, board_history, opponent_passed.value_of(), &mut rng);

    return js_sys::Float64Array::from(result.as_slice());
}
