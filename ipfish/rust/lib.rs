pub mod bitset;
pub mod board;
pub mod board_from_string;
pub mod final_score;
pub mod get_adjacent_points;
pub mod get_legal_moves;
pub mod is_in_atari;
pub mod make_move;
pub mod minimax_ab_strategy;
pub mod minimax_mc_filtered_strategy;
pub mod montecarlo_score;
pub mod pass_move;
pub mod pick_strategy;
pub mod player;
pub mod point_state;
pub mod mc_lines;

use core::f64;
use rand::SeedableRng;
use rand_pcg::Pcg64Mcg;
use rustc_hash::FxBuildHasher;
use std::collections::HashSet;
use std::panic;
use wasm_bindgen::prelude::*;
use mc_lines::{mc_lines, MCLine};

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

    let result: Vec<f64> = pick_strategy(&board, &board_history, opponent_passed.value_of(), &mut rng);

    return js_sys::Float64Array::from(result.as_slice());
}


#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"

export type MCLine = { "score": number, "line": number[], };

"#;

/// Gets an array of possible series of next moves, along with their "score."
/// Some lines might overlap if there's not many possible futures. That's fine though.
/// Even overlapping lines might have different scores due to the randomness associated with montecarlo.
/// It's up to the javascript to decide based on these lines what the best move is.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
/// * `komi` - The extra points white gets for the final score.
/// * `turn` - Whether it's black or white's turn to play. Currently only black has been tested. Trying to analyze for white may crash or lead to bad moves.
/// * `opponent_passed` - Whether the opponent passed last turn. This has important implications for analyzing the value of passing.
#[wasm_bindgen(unchecked_return_type = "MCLine[]")]
pub fn get_lines(input_history: &js_sys::Array, komi: &js_sys::Number, turn: &js_sys::Number, opponent_passed: &js_sys::Boolean) -> js_sys::Array {
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

    #[allow(unused)]
    let mc_lines: Vec<MCLine> = mc_lines(&board, &board_history, opponent_passed.value_of(), &mut rng);
    
    // TEMP
    let mut mc_lines: Vec<MCLine> = Vec::new();
    mc_lines.push(MCLine {
      score: 9.9,
      line: vec![1, 2 ,3]
    });
    // TEMP

    let result: js_sys::Array = js_sys::Array::new();
    for mc_line in mc_lines {
      let line_object: js_sys::Object = js_sys::Object::new();
      let line_array: js_sys::Array = js_sys::Array::new();
      let _ = js_sys::Reflect::set(&line_object, &js_sys::JsString::from("score"), &js_sys::Number::from(mc_line.score));
      let _ = js_sys::Reflect::set(&line_object, &js_sys::JsString::from("line"), &line_array);
      for line in mc_line.line {
        line_array.push(&js_sys::Number::from(line as i32));
      }
    }
    
    return result;
}
