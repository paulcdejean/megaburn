use std::collections::HashSet;
use crate::board::{Board, BoardHistory};
use crate::make_move::make_move;

pub fn violates_superko(point: usize, board: &Board, board_history: &BoardHistory) -> bool {
  let new_position: Box<[u8]> = make_move(point, board).board;

  if board_history.contains(&new_position) {
    return true;
  } else {
    return false;
  }
}
