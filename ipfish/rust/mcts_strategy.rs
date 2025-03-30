use core::f64;
use std::collections::HashMap;

use crate::player::Player;
use crate::RNG;
use crate::bitset::BitSet;
use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::montecarlo_score::montecarlo_score;

const UCT_CONST: f64 = 42.0;

pub struct Node {
    pub board: Board,
    pub blackwins: f64,
    pub whitewins: f64,
    pub uct: f64,
    pub favored_child: Option<usize>,
    pub children: BitSet,
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
        children: BitSet::new(),
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
    let mc_wins: f64 = montecarlo_score(&leaf.board, board_history, simulation_count, rng) as f64;
    leaf.blackwins = mc_wins;
    leaf.whitewins = simulation_count as f64 - leaf.blackwins;

    // Populate children.
    let child_moves: BitSet = get_legal_moves(&leaf.board, board_history);
    leaf.favored_child.insert(child_moves.first());
    leaf.children = child_moves;
    // We need to clone here, because the board could move around in memory once we start inserting into the HashMap.
    let leaf_board: Board = leaf.board.clone();
    for child in child_moves {
        let child_node: Node = Node {
            board: make_move(child, &leaf_board),
            blackwins: 0.0,
            whitewins: 0.0,
            uct: f64::INFINITY,
            children: BitSet::new(),
            favored_child: None,
        };
        sequence.push(child);
        tree.insert(sequence.clone(), child_node);
        sequence.pop();
    }

    // Backpropegation of winrates and UCT scores.
    while sequence.pop().is_some() {
        let parent_node: &Node = tree.get(&sequence).expect("Parent node not found during mcts playout backpropegation!");

        // Update wins.
        let parent_blackwins: f64 = parent_node.blackwins + mc_wins;
        let parent_whitewins: f64 = parent_node.whitewins + simulation_count as f64 - mc_wins;

        // Pick a new favored child based on UCT score.
        let best_uct_score: f64 = f64::NEG_INFINITY;
        for child in parent_node.children {
            let mut child_sequence: Vec<usize> = sequence.clone();
            child_sequence.push(child);
            let child_node: &Node = tree.get(&child_sequence).expect("Child node not found during mcts playing backpropegation!");
            let uct_score = uct_score(
              child_node.board.player,
              parent_blackwins,
              parent_whitewins,
              child_node.blackwins,
              child_node.whitewins,
              UCT_CONST,
            );
        }

        // Parent needs to be updated down here because I keep fighting with the borrow checker...
        let parent_node: &mut Node = tree.get_mut(&sequence).expect("Parent node not found during mcts playout backpropegation!");
        parent_node.blackwins = parent_blackwins;
        parent_node.whitewins = parent_whitewins;
    }
}

/// https://www.chessprogramming.org/UCT
fn uct_score(player: Player, parent_blackwins: f64, parent_whitewins: f64, child_blackwins: f64, child_whitewins: f64, uct_constant: f64) -> f64 {
  let number_of_times_parent_has_been_visited: f64 = parent_blackwins + parent_whitewins;
  let number_of_times_child_has_been_visited: f64 = child_blackwins + child_whitewins;
  let win_ratio_of_child: f64 = match player {
    Player::Black => child_blackwins / number_of_times_child_has_been_visited,
    Player::White => child_whitewins / number_of_times_child_has_been_visited,
  };
  
  let part_under_sqrt: f64 = number_of_times_parent_has_been_visited.ln() / number_of_times_child_has_been_visited;
  return win_ratio_of_child + uct_constant * part_under_sqrt.sqrt();
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
