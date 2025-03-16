use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::player::Player;
use crate::pass_move::pass_move;

/// This uses minimax, with montecarlo as the scoring function.
/// The minimax is a very low depth and doesn't have alpha beta optimization!
/// This seemed to have very practical results in my tests.
/// Returns a vec evaluating the strength of different moves, and suitable to be returned to the js.
pub fn minimax_mc_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool) -> Vec<f64> {
  let minimax_depth: usize = 1;

  let mut result: Vec<f64> = Vec::new();
  let mut point: usize = 0;
  for legality in get_legal_moves(board, Some(board_history)) {
    if legality {
      result.push(minimax(&make_move(point, board), board_history, minimax_depth));
    } else {
      result.push(f64::NEG_INFINITY);
    }
    point += 1;
  }
  result.push(minimax(&pass_move(board), board_history, minimax_depth));

  return result;
}


/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
fn score(board: &Board, board_history: &BoardHistory) -> f64 {
  return montecarlo_score(board, board_history, 100);
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
fn minimax(board: &Board, board_history: &BoardHistory, depth: usize) -> f64 {
  // Terminating condition
  if depth < 1 {
    return score(board, board_history);
  } else {
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());

    if board.player == Player::Black { // Maximizing
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board, board_history);

      let mut proposed_move: usize = 0;
      for legality in get_legal_moves(board, Some(board_history)) {
        if legality {
          let minimax_score: f64 = minimax(
            &make_move(proposed_move, board),
            &deeper_history,
            depth - 1,
          );
          // Maximizing.
          best_score = best_score.max(minimax_score);
        }
        proposed_move += 1;
      }
      return best_score;
    } else { // Minimizing.
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board, board_history);

      let mut proposed_move: usize = 0;
      for legality in get_legal_moves(board, Some(board_history)) {
        if legality {
          let minimax_score: f64 = minimax(
            &make_move(proposed_move, board),
            &deeper_history,
            depth - 1,
          );
          // Minimizing.
          best_score = best_score.min(minimax_score);
        }
        proposed_move += 1;
      }
      return best_score;
    }
  }
}
