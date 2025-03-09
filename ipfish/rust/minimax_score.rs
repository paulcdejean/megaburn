use crate::board::Board;
use crate::player::Player;


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
pub fn minimax_score() -> f64 {
  return 42.0;
}
