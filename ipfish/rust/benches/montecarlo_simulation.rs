use divan::{Bencher, black_box};
use ipfish::RNG;
use ipfish::board::{Board, BoardHistory};
use ipfish::montecarlo_score::montecarlo_simulation;
use ipfish::player::Player;
use rand::SeedableRng;
use rustc_hash::FxBuildHasher;
use std::collections::HashSet;

fn main() {
    // Run registered benchmarks.
    divan::main();
}

/// Depth 2 minimax with MC scoring of 100 simulations per is 62500 simulations per evaluation.
/// So if this takes 1ms then it will take a minute to evaluate the board.
#[divan::bench]
fn bench_montecarlo_score(bencher: Bencher) {
    let empty_fivebyfive_board: Box<[u8]> = vec![1; 25].into_boxed_slice();
    let mut board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
    board_history.insert(empty_fivebyfive_board.clone());
    let mut rng: RNG = RNG::seed_from_u64(black_box(42));

    let board: Board = Board {
        board: empty_fivebyfive_board,
        komi: 5.5,
        size: 5,
        player: Player::Black,
        opponent_passed: false,
    };

    bencher.bench_local(|| {
        montecarlo_simulation(
            board.clone(),
            black_box(board_history.clone()),
            black_box(&mut rng),
        );
    });
}
