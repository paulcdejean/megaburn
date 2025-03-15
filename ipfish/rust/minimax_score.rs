use crate::board::{Board, BoardHistory};
use crate::{get_legal_moves, make_move};
use crate::player::Player;
use crate::score::score;
use crate::pass_move::pass_move;

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
      for legality in get_legal_moves(board, board_history) {
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
      for legality in get_legal_moves(board, board_history) {
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
