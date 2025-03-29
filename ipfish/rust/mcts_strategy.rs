#![allow(warnings)]

/*

Node:

* Board state
* Player to play
* Opponent passed
* Child nodes


UCT:

win_ratio_of_the_child + constant * sqrt(ln(number_of_visits_parent / number_of_visits_child))


*/

use core::f64;
use std::collections::HashMap;

use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::bitset::BitSet;

const UCT_CONST: f64 = 42.0;

pub struct Node<'a> {
  pub board: Board,
  pub parent: Option<Box<&'a Node<'a>>>,
  pub blackwins: f64,
  pub whitewins: f64,
  pub uct: f64,
  pub favored_child: Option<usize>,
  pub children: Option<&'a mut HashMap<usize, Node<'a>>>
}

