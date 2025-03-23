use crate::minimax_ab_strategy::minimax_ab_strategy;
use crate::minimax_mc_filtered_strategy::minimax_mc_filtered_strategy;
use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::RNG;

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
/// Do some other heuristics too.
pub fn pick_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng:&mut RNG) -> Vec<f64> {
  // Play tengen first move on boards that only have 1 or two offline nodes.
  if board_history.len() <= 1 && get_legal_moves(board, Some(board_history)).len() > 22 {
    let tengen = board.board.len() / 2;
    let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];
    result[tengen] = f64::INFINITY;
    return result;
  }

  // Switch to alphabeta if we're in a winning position.
  let winning_position: f64 = 0.35;
  let position_evaluation: f64 = montecarlo_score(board, board_history, 100, rng);
  let result: Vec<f64>;
  if position_evaluation > winning_position {
    result = minimax_ab_strategy(board, board_history, opponent_passed);
  } else {
    result = minimax_mc_filtered_strategy(board, board_history, opponent_passed, rng);
  }

  return result;
}
