#![allow(warnings)]

use rand::prelude::*;
use rand_pcg::Pcg64Mcg;
use std::collections::HashSet;
use rustc_hash::FxBuildHasher;

use ipfish::montecarlo_score::montecarlo_score;
use ipfish::board::{Board, BoardHistory};
use ipfish::player::Player;
use ipfish::RNG;

fn main() {
  let mut rng = RNG::from_rng(&mut rand::rng());

  let empty_fivebyfive_board: Box<[u8]> = vec![1; 25].into_boxed_slice();
  let mut board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
  board_history.insert(empty_fivebyfive_board.clone());

  let board: Board = Board {
    board: empty_fivebyfive_board,
    komi: 5.5,
    size: 5,
    player: Player::Black,
    opponent_passed: false,
  };


  let chance_of_winning = montecarlo_score(&board, &board_history, 3000, &mut rng);

  println!("The chance of winning is {}", chance_of_winning);
}
