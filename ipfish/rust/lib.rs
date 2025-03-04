#![allow(warnings)]
use core::f64;
use std::{collections::HashSet, ops::Not};
use wasm_bindgen::prelude::*;

// Needs to match what's in the javascript
#[repr(u8)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd)]
enum PointState {
  Empty = 1,
  Black = 2,
  White = 3,
  Offline = 4,
}

#[repr(u8)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd)]
enum Player {
  Black = 2,
  White = 3,
}

impl From<Player> for PointState {
  fn from(player: Player) -> PointState {
    match player {
      Player::Black => Self::Black,
      Player::White => Self::White,
    }
  }
}

impl Not for Player {
  type Output = Self;

  fn not(self) -> Player {
      match self {
        Player::Black => Self::White,
        Player::White => Self::Black,
      }
  }
}

/// Performs an analysis on a a ipvgo board. Higher number = better move.
///
/// # Arguments
///
/// * `board_history` - All states the board has historically been in. The last element of the array is the current board position.
#[wasm_bindgen]
pub fn get_analysis(board_history: &js_sys::Array) -> js_sys::Float64Array {
  let current_board: Box<[u8]> = js_sys::Uint8Array::new(&board_history.iter().last().unwrap()).to_vec().into_boxed_slice();
  let mut history: HashSet<Box<[u8]>> = HashSet::new();
  for board in board_history.iter() {
    history.insert(js_sys::Uint8Array::new(&board).to_vec().into_boxed_slice());
  }

  let mut result: Vec<f64> = Vec::new();
  for go_move in get_legal_moves(Player::Black, &current_board, &history) {
    if(go_move) {
      result.push(3.5);
    } else {
      result.push(f64::NEG_INFINITY);
    }
  }

  return js_sys::Float64Array::from(result.as_slice());
}

/// Returns a Vec<bool> where true is a legal move and false is an illegal move.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko.
fn get_legal_moves(active_player: Player, board: &Box<[u8]>, board_history: &HashSet<Box<[u8]>>) -> Box<[bool]> {
  let mut result: Vec<bool> = Vec::new();

  for point in 0..board.len() {
    // The move is illegal if there is already a piece there.
    if board[point] != PointState::Empty as u8 {
      result.push(false);
    }
    // The move is illegal if it would lead to a self capture.
    else if is_self_capture(active_player, point, board) {
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

fn is_self_capture(active_player: Player, point: usize, board: &Box<[u8]>) -> bool {
  for point in get_adjacent_points(point, board) {
    // If there's an adjacent empty point, it is not self capture
    if board[point] == PointState::Empty as u8 {
      return false;
    }
    // If there's an adjacent friendly group with more than 1 liberty, it's not self capture
    else if board[point] == active_player as u8 {
      if count_liberties_of_group(point, board) > 1 {
        return false;
      }
    }
    // If there's an adjacent enemy group with only 1 liberty, then this move captures it so it's not self capture
    else if board[point] == !active_player as u8 {
      if count_liberties_of_group(point, board) <= 1 {
        return false;
      }
    }
  }
  return true;
}

fn violates_superko(point: usize, board: &Box<[u8]>, board_history: &HashSet<Box<[u8]>>) -> bool {
  return false;
}

fn get_adjacent_points(point: usize, board: &Box<[u8]>) -> Box<[usize]> {
  let board_size: usize = board.len().isqrt();
  let mut result : Vec<usize> = Vec::new();

  // Down
  if point >= board_size {
    result.push(point - board_size);
  }
  // Up
  if point < board.len() - board_size {
    result.push(point + board_size)
  }
  // Left
  if point % board_size > 0 {
    result.push(point - 1);
  }
  // Right
  if point % board_size < board_size - 1 {
    result.push(point + 1);
  }
  return result.into_boxed_slice();
}

fn count_liberties_of_group(point: usize, board: &Box<[u8]>) -> usize {
  let mut group: HashSet<usize> = HashSet::from([point]);
  
  let player: Player;
  if board[point] == Player::Black as u8 {
    player = Player::Black;
  } else if board[point] == Player::White as u8 {
    player = Player::White;
  } else {
    panic!("Can't get the group of an empty of offline point!");
  }

  let mut unchecked_points: Vec<usize> = Vec::from(get_adjacent_points(point, board));

  let mut liberties: HashSet<usize> = HashSet::new();

  while unchecked_points.len() > 0 {
    let point_to_check: usize = unchecked_points.pop().unwrap();
    if board[point_to_check] == player as u8 {
      if !group.contains(&point_to_check) {
        unchecked_points.extend_from_slice(&get_adjacent_points(point, board));
      }
      group.insert(point_to_check);
    } else if board[point_to_check] == PointState::Empty as u8 {
      liberties.insert(point_to_check);
    }
  }

  return liberties.len();
}
