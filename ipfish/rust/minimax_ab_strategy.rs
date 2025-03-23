use core::f64;

use crate::bitset::BitSet;
use crate::board::{Board, BoardHistory};
use crate::final_score::{final_score, score_group_territory, SeenStones};
use crate::get_legal_moves::{get_legal_moves, captures_enemy_group};
use crate::make_move::make_move;
use crate::player::Player;
use crate::pass_move::pass_move;
use crate::point_state::PointState;

/// This uses minimax with alpha beta pruning. For the scoring function it just uses the game result.
/// This is good as a "finisher" and terrible at opening the game.
/// It will try and maximize the result score.
pub fn minimax_ab_strategy(board: &Board, board_history: &BoardHistory, opponent_passed: bool) -> Vec<f64> {
  let minimax_depth: usize = 7;
  let alpha: f64 = f64::NEG_INFINITY;
  let beta: f64 = f64::INFINITY;

  let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];

  for point in get_legal_moves(board, Some(board_history)) {
    result[point] = minimax_alphabeta(&make_move(point, board), board_history, minimax_depth, alpha, beta);
  }

  let result_score: f64 = final_score(board);
  match opponent_passed {
    false => {
      if result_score > 0.0 {
        result[board.board.len()] = minimax_alphabeta(&pass_move(board), board_history, minimax_depth, alpha, beta)
      } 
    },
    true => {
      if result_score > 0.0 {
        result[board.board.len()] = result_score;
      }
    }
  }
  return result;
}

/// Private function! This is the score according to the minimax algorithm.
/// This is the value it's trying to minimize and maximize.
/// Changing the scoring algorithm will significantly alter the behavior of the minimax algorithm.
fn score(board: &Board) -> f64 {
  return final_score(board);
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
fn minimax_alphabeta(board: &Board, board_history: &BoardHistory, depth: usize, mut alpha: f64, mut beta: f64) -> f64 {
  // Terminating condition
  if depth < 1 {
    return score(board);
  } else {
    let mut deeper_history: BoardHistory = board_history.clone();
    deeper_history.insert(board.board.clone());

    if board.player == Player::Black { // Maximizing
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board);
      for point in get_legal_moves(board, Some(board_history)) {
        let minimax_score: f64 = minimax_alphabeta(
          &make_move(point, board),
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
      return best_score;
    } else { // Minimizing.
      // We start out with the current state of the board, as if we were to pass, and we want to find a move that improves that.
      let mut best_score: f64 = score(board);

      // <BEGIN HACK>, for white exclude points in black's territory. Unless they capture an enemy group.
      let mut legal_moves: BitSet = get_legal_moves(board, Some(board_history));
      let mut capture_moves: BitSet = BitSet::new();
      for legal_move in legal_moves {
        if captures_enemy_group(legal_move, board) {
          capture_moves.insert(legal_move);
        }
      }
      let points_not_in_black_territory = !get_points_in_territory(board, Player::Black);
      legal_moves &= points_not_in_black_territory;
      legal_moves |= capture_moves;
      // <END HACK>

      for point in legal_moves {
        let minimax_score: f64 = minimax_alphabeta(
          &make_move(point, board),
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
      return best_score;
    }
  }
}

fn get_points_in_territory(board: &Board, player: Player) -> BitSet {
  let mut territory: BitSet = BitSet::new();

  let mut seen_stones: SeenStones;
  match player {
    Player::Black => seen_stones = SeenStones::Black,
    Player::White => seen_stones = SeenStones::White,
  }

  for point in 0..board.board.len() {
    if board.board[point] == PointState::Empty as u8 && !territory.contains(point) {
      let mut group: BitSet = BitSet::new();
      score_group_territory(point, board, &mut group, &mut seen_stones);
      territory |= group;
    }
  }

  return territory;
}
