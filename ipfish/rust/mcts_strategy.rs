use core::f64;
use hashbrown::HashMap;

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
  let mut sequence: Vec<usize> = get_favorite_sequence(tree);
  // Rust discord gave me permission to use unwrap.
  let leaf: &mut Node = tree.get_mut(&sequence).unwrap();
  leaf.blackwins = montecarlo_score(&leaf.board, board_history, simulation_count, rng);
  leaf.whitewins = simulation_count as f64 - leaf.blackwins;

  // Populate children.
  let child_moves: BitSet = get_legal_moves(&leaf.board, board_history);
  leaf.favored_child.insert(child_moves.first());
  leaf.children.insert(child_moves);
  // We need to clone here, because the board could move around in memory once we start inserting into the HashMap.
  let leaf_board: Board = leaf.board.clone();
  for child in child_moves {
    let child_node: Node = Node {
      board: make_move(child, &leaf_board),
      blackwins: 0.0,
      whitewins: 0.0,
      uct: f64::INFINITY,
      children: None,
      favored_child: None,
    };
    sequence.push(child);
    tree.insert(sequence.clone(), child_node);
    sequence.pop(); 
  }

  // Backpropegation of winrates and UCT scores.
  // TODO
}

/// Get the move sequence that we want to explore next, as per the algorithm.
/// This will be a board position that we have not scored yet.
/// Also known as a leaf node.
/// # Arguments
///
/// * `tree` - The tree to get a leaf of.
fn get_favorite_sequence(tree: &mut MCTree) -> Vec<usize> {
  let mut sequence: Vec<usize> = Vec::new();
  while let Some(node) = tree.get(&sequence) {
    match node.favored_child {
      Some(s) => sequence.push(s),
      None => return sequence,
    }
  }
  panic!("This shouldn't be reached. Did you pass a MCTree with no root?");
}
