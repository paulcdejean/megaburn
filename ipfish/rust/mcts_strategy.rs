use core::f64;
use std::cell::Cell;
use std::collections::HashMap;

use rand::seq;

use crate::RNG;
use crate::bitset::BitSet;
use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::{get_legal_moves, get_legal_moves_strict};
use crate::make_move::make_move;
use crate::montecarlo_score::montecarlo_score;
use crate::player::Player;

const UCT_CONST: f64 = 42.0;

#[derive(Clone, Debug)]
pub struct Node {
    pub blackwins: Cell<f64>,
    pub whitewins: Cell<f64>,
    pub favored_child: Cell<usize>,
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
    let playout_count: u32 = 250000;

    // The number of playout batches to run.
    let playout_batches: u32 = playout_count / simulation_batch_size;

    let mut tree: MCTree = initialize_tree(board, &board_history);
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
fn initialize_tree(board: Board, board_history: &BoardHistory) -> MCTree {
    let mut result: MCTree = HashMap::new();

    let legal_moves: BitSet = get_legal_moves_strict(&board, board_history);

    let root: Node = Node {
        blackwins: Cell::new(0.0),
        whitewins: Cell::new(0.0),
        favored_child: Cell::new(legal_moves.first()),
        children: legal_moves,
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
    // This returns a sequences to a not yet existing leaf.
    let mut sequence: Vec<usize> = get_favorite_sequence(tree);
    let favored_move: usize = sequence.pop().expect("Somehow the favored sequence was empty?");
    let parent_node: &Node = tree.get(&sequence).expect("Somehow the favored sequence doesn't have a parent?");
    let new_board: Board = make_move(favored_move, &parent_node.board);
    let leaf_blackwins: f64 = montecarlo_score(&new_board, board_history, simulation_count, rng) as f64;
    let leaf_whitewins: f64 = simulation_count as f64 - leaf_blackwins;
    let leaf_children: BitSet = get_legal_moves(&new_board, &board_history);
    let leaf: Node = Node {
        blackwins: Cell::new(leaf_blackwins),
        whitewins: Cell::new(leaf_whitewins),
        favored_child: Cell::new(leaf_children.first()),
        board: new_board,
        children: leaf_children,
    };
    sequence.push(favored_move);
    tree.insert(sequence.clone(), leaf);

    // Backpropegation of winrates and UCT scores.
    while sequence.pop().is_some() {
        let parent_node: &Node = tree.get(&sequence).expect("Parent node not found during mcts playout backpropegation!");

        // Update wins.
        parent_node.blackwins.set(parent_node.blackwins.get() + leaf_blackwins);
        parent_node.whitewins.set(parent_node.whitewins.get() + leaf_whitewins);

        // Pick a new favored child based on UCT score.
        let mut best_uct_score: f64 = f64::NEG_INFINITY;
        for child in parent_node.children {
            let mut child_sequence: Vec<usize> = sequence.clone();
            child_sequence.push(child);
            match tree.get(&child_sequence) {
                // Unexplored children get top priority.
                None => {
                    parent_node.favored_child.set(child);
                    break;
                }
                Some(s) => {
                    let uct_score: f64 = uct_score(
                        s.board.player,
                        parent_node.blackwins.get(),
                        parent_node.whitewins.get(),
                        s.blackwins.get(),
                        s.whitewins.get(),
                        UCT_CONST,
                    );
                    if uct_score > best_uct_score {
                        best_uct_score = uct_score;
                        parent_node.favored_child.set(child);
                    }
                }
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
    let mut sequence: Vec<usize> = Vec::new();
    loop {
        match tree.get(&sequence) {
            Some(s) => sequence.push(s.favored_child.get()),
            None => return sequence,
        }
    }
}
