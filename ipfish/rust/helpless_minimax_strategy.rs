use core::f64;

use crate::bitset::BitSet;
use crate::board::{Board, BoardHistory};
use crate::final_score::final_score;
use crate::get_legal_moves::get_legal_moves;
use crate::is_in_atari::is_in_atari;
use crate::make_move::make_move;
use crate::get_adjacent_points::get_adjacent_points;
use crate::player::Player;
use crate::pass_move::pass_move;
use crate::point_state::PointState;

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
                                                  speed_penalty + 0.01 + atari_penalty(point, board)
                                                 );
        // Maximizing.
        best_score = best_score.max(minimax_score);
      }
      let pass_score: f64 = score(board, speed_penalty, helpless_player);
      return best_score.max(pass_score);
    } else {
      let mut best_score = f64::INFINITY;
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score = minimax_helpless(&make_move(point, board),
                                                  &deeper_history,
                                                  depth - 1,
                                                  helpless_player,
                                                  speed_penalty + 0.01 + atari_penalty(point, board)
                                                 );
        // Minimizing.
        best_score = best_score.min(minimax_score);
      }
      let pass_score: f64 = score(board, speed_penalty, helpless_player);
      return best_score.min(pass_score);
    }
  }
}


/// Applies a small penalty to stones that would be immediately captured.
fn atari_penalty(point: usize, board: &Board) -> f64 {
  let mut known_liberty: Option<usize> = None;

  for adjacent_point in get_adjacent_points(point, board) {
    if board.board[adjacent_point] == PointState::Empty as u8 {
      known_liberty = Some(adjacent_point);
      break;
    }
  }

  match known_liberty {
    None => 1000.0, // Don't poke out your own eye!
    Some(s) => {
      if is_in_atari(point, &make_move(point, board), s, &mut BitSet::new()) {
        return 20.0;
      } else {
        return 0.0;
      }
    }
  }
}
