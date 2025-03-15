use crate::board::{Board, BoardHistory};
use crate::make_move;
use crate::player::Player;
use crate::score::score;


/// Returns the evaluation of a board position using minimax algorithm to a specified depth.
/// This is called recursively an exponential number of times.
/// With high enough depth it can solve the game but your computer will explode.
///
/// # Arguments
///
/// * `board` - The board state to evaluate.
/// * `board_history` - The board history of the current state.
/// * `passed` - Wheather the previous player passed the turn.
/// * `depth` - The maximum, or remaining, depth to search.
pub fn minimax_score(board: &Board, board_history: &BoardHistory, point: usize, depth: usize) -> f64 {
  // Terminating condition
  if depth <= 1 {
    return score(&make_move(point, &board));
  } else {
    // TODO
    return 30.5
  }
}
