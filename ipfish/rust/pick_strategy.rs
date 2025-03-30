use crate::RNG;
use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves_strict;
use crate::montecarlo_score::montecarlo_score;

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
/// Do some other heuristics too.
pub fn pick_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng: &mut RNG) -> Vec<f64> {

    let result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];

    return result;
}
