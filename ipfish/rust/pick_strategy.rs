use crate::minimax_ab_strategy::minimax_ab_strategy;
use crate::minimax_mc_strategy::minimax_mc_strategy;
use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::pass_move::pass_move;

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
/// Do some other heuristics too.
pub fn pick_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool) -> Vec<f64> {
  
  // Switch to alphabeta if we're in a winning position.
  let winning_position: f64 = 0.1;
  let position_evaluation: f64 = montecarlo_score(&pass_move(board), board_history, 100);
  let mut result: Vec<f64>;
  if position_evaluation > winning_position {
    result = minimax_ab_strategy(board, board_history, opponent_passed);
  } else {
    result = minimax_mc_strategy(board, board_history, opponent_passed);
  }

  // For the first move, artifically boost the center point.
  let center_point: usize = board.board.len() / 2;
  result[center_point] = result[center_point] + 0.2;
  return result;  
}
