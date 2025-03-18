#![allow(warnings)]

use rand::prelude::*;
use rand_pcg::Pcg64Mcg;
use std::collections::HashSet;

use ipfish::montecarlo_score::montecarlo_score;
use ipfish::board::Board;
use ipfish::player::Player;

fn main() {
  let mut rng = Pcg64Mcg::from_rng(&mut rand::rng());

  let empty_fivebyfive_board: Box<[u8]> = vec![1; 25].into_boxed_slice();
  let mut board_history: HashSet<Box<[u8]>> = HashSet::new();
  board_history.insert(empty_fivebyfive_board.clone());

  let board: Board = Board {
    board: empty_fivebyfive_board,
    komi: 5.5,
    size: 5,
    player: Player::Black,
    opponent_passed: false,
  };


  let chance_of_winning = montecarlo_score(&board, &board_history, 100000, &mut rng);

  println!("The chance of winning is {}", chance_of_winning);
}
