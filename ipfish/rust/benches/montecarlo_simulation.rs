#![allow(warnings)]
use divan::{Bencher, black_box};

fn main() {
  // Run registered benchmarks.
  divan::main();
}

// Register a `fibonacci` function and benchmark it over multiple cases.
#[divan::bench]
fn bench_montecarlo_simulation(bencher: Bencher) {

}
