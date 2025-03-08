use std::collections::HashSet;
use crate::board::Board;
use crate::make_move::make_move;

pub fn violates_superko(point: usize, board: &Board, board_history: &HashSet<Box<[u8]>>) -> bool {
  let new_position: Box<[u8]> = make_move(point, board).board;

  if board_history.contains(&new_position) {
    return true;
  } else {
    return false;
  }
}
