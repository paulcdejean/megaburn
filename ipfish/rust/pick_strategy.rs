use crate::minimax_ab_strategy::minimax_ab_strategy;
use crate::minimax_mc_strategy::minimax_mc_strategy;
use crate::board::{Board, BoardHistory};

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
pub fn pick_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool) -> Vec<f64> {
  let late_game: usize = 20;

  // Switch to alphabeta in the late game.
  if board_history.len() > late_game {
    return minimax_ab_strategy(board, board_history, opponent_passed);
  } else {
    return minimax_mc_strategy(board, board_history, opponent_passed);
  }
}
