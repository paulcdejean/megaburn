use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::player::Player;
use crate::final_score::final_score;
use crate::pass_move::pass_move;

/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
/// This doesn't take a board history for now, because that would slow things down.
/// 
/// # Arguments
///
/// * `board` - The board state to evaluate.
fn score(board: &Board) -> f64 {
  return montecarlo_score(board, 20);

  // return final_score(&board);
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
/// * `alpha` - The highest score seen so far. Pass -infinity for non recursive calls.
/// * `beta` - The lower score seen so far. Pass +infinity for non recursive calls.
pub fn minimax_score(board: &Board, board_history: &BoardHistory, depth: usize, mut alpha: f64, mut beta: f64) -> f64 {
  // Terminating condition
  if depth < 1 {
    return score(&board);
  } else {
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());

    if board.player == Player::Black { // Maximizing
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board);

      let mut proposed_move: usize = 0;
      for legality in get_legal_moves(board, Some(board_history)) {
        if legality {
          let minimax_score: f64 = minimax_score(
            &make_move(proposed_move, board),
            &deeper_history,
            depth - 1,
            alpha,
            beta,
          );
          // Maximizing.
          best_score = best_score.max(minimax_score);
          alpha = alpha.max(best_score);
          if beta <= alpha {
            break;
          }
        }
        proposed_move += 1;
      }
      return best_score;
    } else { // Minimizing.
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board);

      let mut proposed_move: usize = 0;
      for legality in get_legal_moves(board, Some(board_history)) {
        if legality {
          let minimax_score: f64 = minimax_score(
            &make_move(proposed_move, board),
            &deeper_history,
            depth - 1,
            alpha,
            beta,
          );
          // Minimizing.
          best_score = best_score.min(minimax_score);
          beta = beta.min(best_score);
          if beta <= alpha {
            break;
          }
        }
        proposed_move += 1;
      }
      return best_score;
    }
  }
}


mod tests {
  use crate::board_from_string::board_from_string;
  use super::*;

  #[test]
  fn should_not_pass_here() {
    let board_string: &str = "
    #.XX.
    .XO.O
    XOOOO
    XXXXO
    X.X.O
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 5.5, // This is versus the Daedelus
      opponent_passed: false,
    };
    let board_history: BoardHistory = BoardHistory::new();

    let pass_minimax_score: f64 = minimax_score(
      &pass_move(&board),
      &board_history,
      3,
      f64::NEG_INFINITY,
      f64::INFINITY,
    );

    let d1_minimax_score: f64 = minimax_score(
      &make_move(3, &board),
      &board_history,
      3,
      f64::NEG_INFINITY,
      f64::INFINITY,
    );

    // d1 is a better move than passing!
    assert!(d1_minimax_score > pass_minimax_score);
  }
}
