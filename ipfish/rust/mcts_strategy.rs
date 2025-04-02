use core::f64;
use std::cell::Cell;
use std::collections::HashMap;

use crate::player::Player;
use crate::RNG;
use crate::bitset::BitSet;
use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::montecarlo_score::montecarlo_score;

const UCT_CONST: f64 = 42.0;

#[derive(Clone, Debug)]
pub struct Node {
    pub blackwins: Cell<f64>,
    pub whitewins: Cell<f64>,
    pub favored_child: Cell<Option<usize>>,
    pub board: Board,
    pub children: BitSet,
}

// The tree is represented by a hashmap, where the key is the move sequence of the position, and the value is the Node.
pub type MCTree = HashMap<Vec<usize>, Node>;

/// Generates a Monte Carlo Search Tree. Returns the tree itself.
/// # Arguments
///
/// * `board` - The board state to have at the head of the search tree. Takes ownership of it.
/// * `board_history` - The board history used for superko.
/// * `rng` - RNG used for MC playouts.
pub fn mcts_strategy(board: Board, board_history: BoardHistory, rng: &mut RNG) -> MCTree {
    // The number of playouts to do at a time when doing evaluations.
    let simulation_batch_size: u32 = 100;

    // The number of playouts to do in total.
    let playout_count: u32 = 3000;

    // The number of playout batches to run.
    let playout_batches: u32 = playout_count / simulation_batch_size;

    let mut tree: MCTree = initialize_tree(board);
    for _ in 0..playout_batches {
        mcts_playout(&mut tree, &board_history, simulation_batch_size, rng);
    }

    return tree;
}

/// Initalizes the root of a Monte Carlo Search Tree.
/// Note this takes ownership of the board.
/// # Arguments
///
/// * `board` - The board state to have at the head of the search tree. Takes ownership of it.
fn initialize_tree(board: Board) -> MCTree {
    let mut result: MCTree = HashMap::new();

    let root: Node = Node {
        blackwins: Cell::new(0.0),
        whitewins: Cell::new(0.0),
        favored_child: Cell::new(None),
        children: BitSet::new(),
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
    leaf.blackwins.set(mc_wins);
    leaf.whitewins.set(simulation_count as f64 - leaf.blackwins.get());

    // Populate children.
    let child_moves: BitSet = get_legal_moves(&leaf.board, board_history);
    leaf.favored_child.set(Some(child_moves.first()));
    leaf.children = child_moves;
    // We need to clone here, because the board could move around in memory once we start inserting into the HashMap.
    let leaf_board: Board = leaf.board.clone();
    for child in child_moves {
        let child_node: Node = Node {
            blackwins: Cell::new(0.0),
            whitewins: Cell::new(0.0),
            favored_child: Cell::new(None),
            board: make_move(child, &leaf_board),
            children: BitSet::new(),
        };
        sequence.push(child);
        tree.insert(sequence.clone(), child_node);
        sequence.pop();
    }

    // Backpropegation of winrates and UCT scores.
    while sequence.pop().is_some() {
        let parent_node: &Node = tree.get(&sequence).expect("Parent node not found during mcts playout backpropegation!");

        // Update wins.
        parent_node.blackwins.set(parent_node.blackwins.get()  + mc_wins);
        parent_node.whitewins.set(parent_node.whitewins.get()  + mc_wins);

        // Pick a new favored child based on UCT score.
        let mut best_uct_score: f64 = f64::NEG_INFINITY;
        for child in parent_node.children {
            let mut child_sequence: Vec<usize> = sequence.clone();
            child_sequence.push(child);
            let child_node: &Node = tree.get(&child_sequence).expect("Child node not found during mcts playing backpropegation!");
            let uct_score = uct_score(
              child_node.board.player,
              parent_node.blackwins.get(),
              parent_node.whitewins.get(),
              child_node.blackwins.get(),
              child_node.whitewins.get(),
              UCT_CONST,
            );

            if uct_score > best_uct_score {
                best_uct_score = uct_score;
                parent_node.favored_child.set(Some(child));
            }
        }
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
    assert!(tree.len() > 0);
    let mut sequence: Vec<usize> = Vec::new();
    loop {
        let node = match tree.get(&sequence) {
            Some(s) => s,
            None => panic!("No tree element {:?}. Tree dump: {:?}", sequence, tree),
        };
        match node.favored_child.get() {
            Some(s) => sequence.push(s),
            None => return sequence,
        }
    }
}
