use crate::board::Board;
use crate::player::Player;

pub fn score(board: Board) -> f64 {
  let base_score: f64 = 0.0;
  if board.player == Player::White {
    return base_score + board.komi;
  } else {
    return base_score - board.komi;
  }
}
