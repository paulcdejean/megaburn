use crate::board::{Board, BoardHistory};
use crate::minimax_score::minimax_score;
use crate::montecarlo_score::montecarlo_score;


/// This is the evaluation function used by the main analysis function called from js.
/// If you want to mess with how moves are evaluated, this is the place for it, rather than having to change lib.rs 
///
/// # Arguments
///
/// * `board` - The state of the board after making the move.
/// * `board_history` - All states the board has historically been in, important for determining superko.
/// * `point` - The move to evaluate.
pub fn evaluate_move(board: &Board, board_history: &BoardHistory) -> f64 {
  let depth: usize = 3;

  let result: f64 = minimax_score(
    board,
    board_history,
    depth,
    f64::NEG_INFINITY,
    f64::INFINITY,
  );

  // let result = montecarlo_score(board, 100);

  return result;
}
