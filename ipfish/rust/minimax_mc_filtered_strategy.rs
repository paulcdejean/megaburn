use core::f64;

use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::player::Player;
use crate::pass_move::pass_move;
use crate::RNG;

/// This uses minimax, with montecarlo as the scoring function.
/// However it will only check the top moves at further depths.
/// Returns a vec evaluating the strength of different moves, and suitable to be returned to the js.
pub fn minimax_mc_filtered_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng:&mut RNG) -> Vec<f64> {
  let minimax_depth: usize = 2;
  let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];


  for point in get_legal_moves(board, Some(board_history)) {
    result[point] = minimax(&make_move(point, board), board_history, minimax_depth, rng);
  }

  // Pass move.
  if opponent_passed {
    result[board.board.len()] = minimax(&pass_move(board), board_history, minimax_depth, rng);
  }
  return result;
}


/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
fn score(board: &Board, board_history: &BoardHistory, rng: &mut RNG) -> f64 {
  return montecarlo_score(board, board_history, 100, rng);
}

/// Returns the evaluation of a board position using minimax algorithm to a specified depth.
/// This is called recursively an exponential number of times.
/// With high enough depth it can solve the game but your computer will explode.
///
/// # Arguments
///
/// * `board` - The board state to evaluate.
/// * `board_history` - The board history of the current state.
/// * `depth` - The maximum, or remaining, depth to search. 0 means to just score the current board.
fn minimax(board: &Board, board_history: &BoardHistory, depth: usize, rng: &mut RNG) -> f64 {
  // Terminating condition
  if depth < 1 {
    return score(board, board_history, rng);
  } else {
    let current_board_score = score(board, board_history, rng);
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());

    if board.player == Player::Black { // Maximizing
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = current_board_score;
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score: f64 = minimax(
          &make_move(point, board),
          &deeper_history,
          depth - 1,
          rng,
        );
        // Maximizing.
        best_score = best_score.max(minimax_score);
      }
      return best_score;
    } else { // Minimizing.
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = current_board_score;
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score: f64 = minimax(
          &make_move(point, board),
          &deeper_history,
          depth - 1,
          rng,
        );
        // Minimizing.
        best_score = best_score.min(minimax_score);
      }
      return best_score;
    }
  }
}
