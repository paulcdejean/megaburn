use crate::board::{Board, BoardHistory};
use crate::final_score::final_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::pass_move::pass_move;
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
  let minimax_depth: usize = 1;
  let mc_pass_nerf: f64 = 0.2;
  let endgame_number: usize = 10;
  let simulation_count: i32 = 120;

  let mut result: Vec<f64> = Vec::new();
  let mut point: usize = 0;
  
  // If opponent passes force using minimax.
  if true {
    let legal_moves: Box<[bool]> = get_legal_moves(board, Some(board_history));
    
    for legality in legal_moves {
      if legality {
        result.push(minimax_score(&make_move(point, board), board_history, minimax_depth));
      } else {
        result.push(f64::NEG_INFINITY);
      }
      point += 1;
    }
    // result.push(final_score(&pass_move(board)));
    result.push(minimax_score(&pass_move(board), board_history, minimax_depth));
  } else {
    let legal_moves: Box<[bool]> = get_legal_moves(board, Some(board_history));
    let mut legal_moves_count: usize = 0;
    for legality in legal_moves.iter() {
      if *legality {
        legal_moves_count += 1;
      }
    }

    let mut point: usize = 0;
    if legal_moves_count < endgame_number {
      for legality in legal_moves {
        if legality {
          result.push(minimax_score(&make_move(point, board), board_history, minimax_depth));
        } else {
          result.push(f64::NEG_INFINITY);
        }
        point += 1;
      }
      result.push(minimax_score(&pass_move(board), board_history, minimax_depth));
    } else {
      for legality in legal_moves {
        if legality {
          result.push(montecarlo_score(&make_move(point, board), board_history, simulation_count));
        } else {
          result.push(f64::NEG_INFINITY);
        }
        point += 1;
      }
      result.push(montecarlo_score(&pass_move(board), board_history, 100) - mc_pass_nerf);
    }
  }
  return result;
}
