use crate::RNG;
use crate::board::{Board, BoardHistory};

pub struct MCLine {
    pub line: Vec<usize>,
    pub score: f64,
}

#[allow(unused)]
pub fn mc_lines(board: &Board, board_history: &BoardHistory, opponent_passed: bool, rng: &mut RNG) -> Vec<MCLine> {
    let result: Vec<MCLine> = Vec::new();
    return result;
}
