use rustc_hash::FxBuildHasher;

use crate::player::Player;
use std::collections::HashSet;

#[derive(Clone, Debug)]
pub struct Board {
    // The current pieces of the board.
    pub board: Box<[u8]>,
    // The size of the board (the square root of the number of points on it).
    pub size: usize,
    // Who's turn it currently is to play.
    pub player: Player,
    // The bonus points that white gets to their score.
    pub komi: f64,
    // True if the opponent passed last turn, false otherwise.
    pub opponent_passed: bool,
}

pub type BoardHistory = HashSet<Box<[u8]>, FxBuildHasher>;
