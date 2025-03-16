use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves;
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
pub fn evaluate_moves(board: &Board, board_history: &BoardHistory, opponent_passed: bool) -> Vec<f64> {
  let mut result: Vec<f64> = Vec::new();

  let minimax_depth: usize = 5;

  // If opponent passes force using minimax.
  if opponent_passed {
    let legal_moves: Box<[bool]> = get_legal_moves(board, Some(board_history));
    let point: usize = 0;
    for legality in legal_moves {
      if legality {
        result.push(minimax_score(board, board_history, minimax_depth));
      } else {
        result.push(f64::NEG_INFINITY);
      }
    }
  } else {
    let legal_moves: Box<[bool]> = get_legal_moves(board, Some(board_history));
    let point: usize = 0;
    for legality in legal_moves {
      if legality {
        result.push(minimax_score(board, board_history, minimax_depth));
      } else {
        result.push(f64::NEG_INFINITY);
      }
    }
  }
  return result;
}
