use std::collections::HashSet;

use crate::count_liberties_of_group::count_liberties_of_group;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::player::Player;
use crate::board::Board;
use crate::is_self_capture::is_self_capture;

/// Returns a sequence of bool where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko.
pub fn get_legal_moves(board: &Board, board_history: &HashSet<Box<[u8]>>) -> Box<[bool]> {
  let mut result: Vec<bool> = Vec::new();

  for point in 0..board.board.len() {
    // The move is illegal if there is already a piece there.
    if board.board[point] != PointState::Empty as u8 {
      result.push(false);
    }
    // The move is illegal if it would lead to a self capture.
    else if is_self_capture(point, board) {
      result.push(false);
    }
    // The move is illegal if it would repeat a previous board state.
    else if violates_superko(point, board, board_history) {
      result.push(false);
    }
    // Otherwise the move is legal.
    else {
      result.push(true);
    }
  }
  return result.into_boxed_slice();
}

fn violates_superko(point: usize, board: &Board, board_history: &HashSet<Box<[u8]>>) -> bool {
  return false;
}
