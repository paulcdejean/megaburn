use crate::board::Board;
use crate::player::Player;


/// Returns the evaluation of a position, without any foresight.
/// Doesn't consider the history at all. Just a snapshot in time.
/// Think of it like a player glancing at the board and thinking "hmm looks like white is winning."
/// Positive = better for black. Negitive = better for white.
///
/// # Arguments
///
/// * `board` - The board state to evaluate.
pub fn score(board: &Board) -> f64 {
  let mut base_score: f64 = 0.0;
  for point in 0..board.board.len() {
    if board.board[point] == Player::Black as u8 {
      base_score += 1.0;
    } else if board.board[point] == Player::White as u8 {
      base_score -= 1.0;
    }
  }

  return base_score - board.komi;
}
