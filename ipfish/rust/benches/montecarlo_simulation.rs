use std::collections::HashSet;
use ipfish::montecarlo_score::montecarlo_simulation;
use divan::{Bencher, black_box};
use rand::SeedableRng;
use rand_pcg::Pcg64Mcg;
use ipfish::board::Board;
use ipfish::player::Player;

fn main() {
  // Run registered benchmarks.
  divan::main();
}

#[divan::bench]
fn bench_montecarlo_score(bencher: Bencher) {
  let empty_fivebyfive_board: Box<[u8]> = vec![1; 25].into_boxed_slice();
  let mut board_history: HashSet<Box<[u8]>> = HashSet::new();
  board_history.insert(empty_fivebyfive_board.clone());
  let mut rng: rand_pcg::Mcg128Xsl64 = Pcg64Mcg::seed_from_u64(black_box(42));

  let board: Board = Board {
    board: black_box(empty_fivebyfive_board),
    komi: black_box(5.5),
    size: black_box(5),
    player: black_box(Player::Black),
    opponent_passed: black_box(false),
  };

  bencher.bench_local( || {
    montecarlo_simulation(board.clone(), board_history.clone(), &mut rng);
  });
}
