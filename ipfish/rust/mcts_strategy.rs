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
use hashbrown::hash_map::EntryRef;
use hashbrown::HashMap;
use rand::seq;

use crate::board::{Board, BoardHistory};
use crate::montecarlo_score::montecarlo_score;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::bitset::BitSet;
use crate::RNG;

const UCT_CONST: f64 = 42.0;

pub struct Node {
  pub board: Board,
  pub blackwins: f64,
  pub whitewins: f64,
  pub uct: f64,
  pub favored_child: Option<usize>,
  pub children: Option<BitSet>,
}

// The tree is represented by a hashmap, where the key is the move sequence of the position, and the value is the Node.
pub type MCTree = HashMap<Vec<usize>, Node>;

/// Initalizes the root of a Monte Carlo Search Tree.
/// Note this takes ownership of the board.
/// # Arguments
///
/// * `board` - The board state to have at the head of the search tree. Takes ownership of it.
fn initialize_tree(board: Board) -> MCTree {
  let mut result: MCTree = HashMap::new();

  let root: Node = Node {
   children: None,
   blackwins: 0.0,
   whitewins: 0.0,
   uct: f64::INFINITY,
   favored_child: None,
   board: board,
  };

  result.insert(Vec::new(), root);
  return result;
}

/// Does a playout on the Monte Carlo Search Tree, updating the tree with the results.
/// # Arguments
///
/// * `tree` - The tree to do the playout on.
/// * `board_history` - The historical board states, used for superko.
/// * `playout_count` - The number of MC playouts to do on leaf nodes. We do actual MC playouts because no neural network.
fn mcts_playout(tree: &mut MCTree, board_history: &BoardHistory, simulation_count: u32, rng: &mut RNG) {
  let mut sequence:Vec<usize> = get_favorite_sequence(tree);
  let leaf: &mut Node = tree.get_mut(&sequence).unwrap();

  leaf.blackwins = montecarlo_score(&leaf.board, board_history, simulation_count, rng);
  leaf.whitewins = simulation_count as f64 - leaf.blackwins;
  leaf.children.insert(get_legal_moves(&leaf.board, board_history));

}

fn get_favorite_sequence(tree: &mut HashMap<Vec<usize>, Node>) -> Vec<usize> {
  let mut sequence: Vec<usize> = Vec::new();
  while let Some(node) = tree.get(&sequence) {
    match node.favored_child {
      Some(s) => sequence.push(s),
      None => return sequence,
    }
  }
  panic!("This shouldn't be reached. Did you pass a MCTree with no root?");
}
