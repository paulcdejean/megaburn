use core::f64;

use crate::board::{Board, BoardHistory};
use crate::final_score::final_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::player::Player;
use crate::pass_move::pass_move;

/// This tries to maximize score assuming that the opponent is passing every turn.
/// It also knows to pass if there's no way to increase your score.
/// Every time the opponent passes their score increases by a tiny amount. This incentivizes it finding the fastest win.
pub fn helpless_minimax_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool, helpless_player: Player) -> Vec<f64> {
  let minimax_depth: usize = 5;

  let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];

  for point in get_legal_moves(board, Some(board_history)) {
    result[point] = minimax_helpless(&make_move(point, board),
                                     board_history,
                                     minimax_depth,
                                     helpless_player,
                                     0.0
                                    );
  }

  match opponent_passed {
    false => result[board.board.len()] = minimax_helpless(
                                                   &pass_move(board),
                                                   board_history,
                                                   minimax_depth,
                                                   helpless_player,
                                                   0.0
                                                  ),
    true => {
      let pass_result: f64 = final_score(board);
      if pass_result > 0.0 {
        result[board.board.len()] = pass_result;
      }
    }
  }
  return result;
}

/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
fn score(board: &Board, speed_penalty: f64, helpless_player: Player) -> f64 {
  let result_score: f64 = final_score(board);

  // Speed penalty is a bonus to the helpless player.
  match helpless_player {
    Player::Black => result_score + speed_penalty,
    Player::White => result_score - speed_penalty
  }
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
fn minimax_helpless(board: &Board, board_history: &BoardHistory, depth: usize, helpless_player: Player, speed_penalty: f64) -> f64 {
  // Terminating condition
  if depth < 1 {
    return score(board, speed_penalty, helpless_player);
  } else {
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());

    
    if board.player == helpless_player {
      // Helpless player always passes.
      return minimax_helpless(&pass_move(board),
                              &deeper_history,
                              depth - 1,
                              helpless_player,
                              speed_penalty + 0.01
                             );
    } else if board.player == Player::Black {
      let mut best_score = f64::NEG_INFINITY;
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score = minimax_helpless(&make_move(point, board),
                                                  &deeper_history,
                                                  depth - 1,
                                                  helpless_player,
                                                  speed_penalty + 0.01
                                                 );
        // Maximizing.
        best_score = best_score.max(minimax_score);
      }
      return best_score;
    } else {
      let mut best_score = f64::INFINITY;
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score = minimax_helpless(&make_move(point, board),
                                                  &deeper_history,
                                                  depth - 1,
                                                  helpless_player,
                                                  speed_penalty + 0.01
                                                 );
        // Minimizing.
        best_score = best_score.min(minimax_score);
      }
      return best_score;
    }
  }
}
