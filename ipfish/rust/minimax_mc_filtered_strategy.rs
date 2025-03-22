#![allow(warnings)]
use core::f64;
use std::collections::BTreeSet;

use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::player::Player;
use crate::pass_move::pass_move;
use crate::final_score::final_score;
use crate::RNG;
use std::cmp::Ordering;

struct MCResult {
  point: usize,
  score: f64,
}
impl Ord for MCResult {
  fn cmp(&self, other: &Self) -> Ordering {
    self.score.total_cmp(&other.score)
  }
}
impl PartialOrd for MCResult {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
      Some(self.score.total_cmp(&other.score))
  }
}
impl PartialEq for MCResult {
  fn eq(&self, other: &Self) -> bool {
      self.score == other.score
  }
}
impl Eq for MCResult {}

/// This uses minimax, with montecarlo as the scoring function.
/// However it will only check the top moves at further depths.
/// Returns a vec evaluating the strength of different moves, and suitable to be returned to the js.
pub fn minimax_mc_filtered_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng:&mut RNG) -> Vec<f64> {
  let minimax_depth: usize = 2;
  let top_move_number: usize = 3;
  let simulation_count: i32 = 100;
  let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];
  let mut mc_results: BTreeSet<MCResult> = BTreeSet::new();

  for point in get_legal_moves(board, Some(board_history)) {
    let mc_score: f64 = montecarlo_score(&make_move(point, board), board_history, simulation_count, rng);
    mc_results.insert(MCResult {
      point: point,
      score: mc_score,
    });
  }

  let mut n: usize = 0;
  while let Some(mc_result) = mc_results.pop_last() {
    if n < top_move_number {
      result[mc_result.point] = mc_result.score;
    } else {
      result[mc_result.point] = mc_result.score - 1.0;
    }
    n += 1;
  }

  // Pass move.
  if opponent_passed {
    let result_score: f64 = final_score(board);
    if result_score > 0.0 {
      result[board.board.len()] = montecarlo_score(&pass_move(board), board_history, 50, rng);
    }
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
