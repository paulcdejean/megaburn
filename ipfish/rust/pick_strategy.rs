use crate::minimax_ab_strategy::minimax_ab_strategy;
use crate::minimax_mc_filtered_strategy::minimax_mc_filtered_strategy;
use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::RNG;

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
/// Do some other heuristics too.
pub fn pick_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng:&mut RNG) -> Vec<f64> {
  
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
