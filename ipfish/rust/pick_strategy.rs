use crate::RNG;
use crate::board::{Board, BoardHistory};
use crate::get_legal_moves::get_legal_moves_strict;
use crate::mcts_strategy::{MCTree, Node, mcts_strategy};
use crate::montecarlo_score::montecarlo_score;
use crate::minimax_ab_strategy::minimax_ab_strategy;

/// Heuristically pick a strategy based on the in game situation and give the evaluation of that strategy.
/// Do some other heuristics too.
pub fn pick_strategy(board: Board, board_history: BoardHistory, opponent_passed: bool, rng: &mut RNG) -> Vec<f64> {
    let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];
    let legal_moves: crate::bitset::BitSet = get_legal_moves_strict(&board, &board_history);
    let pass_result: usize = result.len() - 1;

    // Play tengen first move on boards that only have 1 or two offline nodes.
    if board_history.len() <= 1 {
        let tengen = board.board.len() / 2;
        if legal_moves.len() > 22 && legal_moves.contains(tengen) {
            let mut result: Vec<f64> = vec![f64::NEG_INFINITY; board.board.len() + 1];
            result[tengen] = f64::INFINITY;
            return result;
        }
    }

    let guesstimate: u32 = montecarlo_score(&board, &board_history, 100, rng);

    // Winning position!
    if guesstimate > 95 {
        return minimax_ab_strategy(&board, &board_history, opponent_passed);
    }
    // Lossing position, just pass...
    else if guesstimate < 5 {
        result[pass_result] = 0.0;
        return result;
    }
    // Monte Carlo Tree Search!
    else {
        return mcts_strategy(board, board_history, rng);
    }
}
