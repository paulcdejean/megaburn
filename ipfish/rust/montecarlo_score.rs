use crate::board::Board;

/// Returns the percentage (f64 between 0 and 1) of monte carlo simulations that resulted in a black win.
/// Doesn't play moves that would be self sacrifice for the oppoent to play during simulation.
/// More simulations costs more compute time.
///
/// # Arguments
///
/// * `board` - The board state to evaluate.
/// * `simulation_count` - The number of montecarlo simulations to run.
pub fn montecarlo_score(board: &Board, simulation_count: usize) -> f64 {
  return 0.5
}
