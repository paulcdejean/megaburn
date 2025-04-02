#![allow(warnings)]
use rand::prelude::*;
use rustc_hash::FxBuildHasher;
use std::cell::Cell;
use std::collections::HashSet;

use ipfish::RNG;
use ipfish::board::{Board, BoardHistory};
use ipfish::montecarlo_score::montecarlo_score;
use ipfish::player::Player;

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

use hashbrown::HashMap;

fn working() {
    struct Example {
        a: Cell<f64>,
        b: Cell<f64>,
    }

    let mut hm: HashMap<u32, Example> = HashMap::new();
    hm.insert(
        7,
        Example {
            a: Cell::new(3.14),
            b: Cell::new(0.0),
        },
    );
    hm.insert(
        8,
        Example {
            a: Cell::new(2.71),
            b: Cell::new(0.0),
        },
    );

    let mut result: f64 = 0.0;
    let seven_ref = hm.get(&7).unwrap();
    let eight_ref = hm.get(&8).unwrap();
    result = blackbox(result, seven_ref.a.get());
    result = blackbox(result, eight_ref.a.get());
    eight_ref.b.set(result);
}

fn blackbox(x: f64, y: f64) -> f64 {
    return x + y;
}

fn working_unsafe() {
    struct Example {
        a: f64,
        b: f64,
    }
    let mut hm: HashMap<u32, Example> = HashMap::new();
    hm.insert(7, Example { a: 3.14, b: 0.0 });
    hm.insert(8, Example { a: 2.71, b: 0.0 });

    unsafe {
        let seven_ref: *const Example = hm.get(&7).unwrap();
        let eight_ref: *const Example = hm.get(&8).unwrap();
        let mut result: f64 = 0.0;
        result = blackbox(result, (*seven_ref).a);
        result = blackbox(result, (*eight_ref).a);

        let seven_ref: *mut Example = std::mem::transmute::<*const Example, *mut Example>(seven_ref);
        (*seven_ref).b = result;
    }
}
