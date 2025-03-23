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
    if self.score < other.score {
      Ordering::Less
    } else {
      Ordering::Greater
    }
  }
}
impl PartialOrd for MCResult {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
      Some(self.cmp(other))
  }
}
impl PartialEq for MCResult {
  fn eq(&self, other: &Self) -> bool {
      self.point == other.point &&  self.score == other.score
  }
}
impl Eq for MCResult {}

/*
Top level gives alpha and beta values.
Alpha is black's best chance to win
Beta is white's best chance to win
Top level is 2500 simulations




 */

/// This uses minimax, with montecarlo as the scoring function.
/// However it will only check the top moves at further depths.
/// Returns a vec evaluating the strength of different moves, and suitable to be returned to the js.
pub fn minimax_mc_filtered_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng:&mut RNG) -> Vec<f64> {
  let minimax_depth: usize = 1;
  let simulation_count: i32 = 100;

  let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];

  let mut mc_results: BTreeSet<MCResult> = BTreeSet::new();
  let legal_moves: crate::bitset::BitSet = get_legal_moves(board, Some(board_history));
  for point in legal_moves {
    let mc_score: f64 = montecarlo_score(&make_move(point, board), board_history, simulation_count, rng);
    mc_results.insert(MCResult { point: point, score: mc_score });
  }

  let median_score: f64 = match mc_results.iter().nth(mc_results.len() / 2) {
    None => f64::NEG_INFINITY,
    Some(s) => s.score,
  };

  for mc_result in mc_results {
    if mc_result.score > median_score {
      result[mc_result.point] = minimax(&make_move(mc_result.point, board), board_history, minimax_depth, rng, simulation_count);
    }
  }

  // Pass move.
  if opponent_passed {
    let result_score: f64 = final_score(board);
    if result_score > 0.0 {
      result[board.board.len()] = montecarlo_score(&pass_move(board), board_history, simulation_count, rng);
    }
  }
  return result;
}


/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
fn score(board: &Board, board_history: &BoardHistory, rng: &mut RNG, simulation_count: i32) -> f64 {
  return montecarlo_score(board, board_history, simulation_count, rng);
}

fn minimax(board: &Board, board_history: &BoardHistory, depth: usize, rng: &mut RNG, simulation_count: i32) -> f64 {
  // Depth zero doesn't make much sense, but lets include it anyway.
  if depth < 1 {
    return score(board, board_history, rng, simulation_count);
  }

  // We can't prune here...
  else if depth == 1 {
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());
    // Try and improve on passing...
    let mut best_score: f64 = montecarlo_score(&pass_move(board), &deeper_history, simulation_count, rng);

    if board.player == Player::White {
      for point in get_legal_moves(board, Some(board_history)) {
        let mc_score: f64 = montecarlo_score(
          &make_move(point, board),
          &deeper_history,
          simulation_count,
          rng,
        );
        // Minimizing!
        best_score = best_score.min(mc_score);
      }
    } else {
      for point in get_legal_moves(board, Some(board_history)) {
        let mc_score: f64 = montecarlo_score(
          &make_move(point, board),
          &deeper_history,
          simulation_count,
          rng,
        );
        // Maximizing!
        best_score = best_score.max(mc_score);
      }
    }
    return best_score;
  }
  // The recursive part, but we try and prune here if
  else {
    panic!("Too deep!!!")
  }
}
