use crate::board::Board;
use crate::final_score;
use crate::get_adjacent_points;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::pass_move::pass_move;
use crate::point_state::PointState;
use rand::seq::SliceRandom;
use rand::seq::IndexedRandom;
use rand::SeedableRng;
use rand_pcg::Pcg64Mcg;

#[repr(i32)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd, Debug)]
pub enum Winner {
  WhiteWin = 0,
  BlackWin = 1,
}

type RNG = Pcg64Mcg;

/// Returns the percentage (f64 between 0 and 1) of monte carlo simulations that resulted in a black win.
/// Doesn't play moves that would be self sacrifice for the oppoent to play during simulation.
/// More simulations costs more compute time.
///
/// # Arguments
///
/// * `board` - The board state to evaluate.
/// * `simulation_count` - The number of montecarlo simulations to run.
pub fn montecarlo_score(board: &Board, simulation_count: i32) -> f64 {
  let mut rng: RNG = RNG::seed_from_u64(js_sys::Math::random().to_bits());

  let mut black_wins: i32 = 0;

  for _ in 0..simulation_count {
    black_wins = black_wins + montecarlo_simulation(board.clone(), &mut rng) as i32;
  }

  return f64::from(black_wins) / f64::from(simulation_count);
}

fn play_random_move(board: &Board, rng: &mut RNG) -> Option<Board> {
  let legal_for_me: Box<[bool]> = get_legal_moves(&board, None);
  let legal_for_opponent: Box<[bool]> = get_legal_moves(&pass_move(board), None);
  let mut possible_moves: Vec<usize> = Vec::new();

  for n in 0..legal_for_me.len() {
    if legal_for_me[n] {
      // Only play in spaces surrounded by friendlies/walls if they're legal for the opponent.
      let mut true_eye: bool = true;
      for adjacent_point in get_adjacent_points(n, &board) {
        // It's not a true eye, if there's an adjacent empty square or enemy piece
        if board.board[adjacent_point] == !board.player as u8 || board.board[adjacent_point] == PointState::Empty as u8 {
          true_eye = false;
          break;
        }
      }
      if !true_eye || legal_for_opponent[n] {
        possible_moves.push(n);
      }
    }
  }

  let chosen_move: Option<&usize> = possible_moves.choose(rng);
  match chosen_move {
    None => {
      if !board.opponent_passed {
        println!("Passed");
        return Some(pass_move(board));
      } else {
        return None;
      }
    },
    Some(s) => {
      println!("Played {}", s);
      return Some(make_move(*s, board));
    },
  }
}

fn montecarlo_simulation(mut board: Board, rng: &mut RNG) -> Winner {
  for _ in 0..board.board.len() {
    match play_random_move(&board, rng) {
      Some(s) => {board = s;},
      None => break,
    }
  }
  let result: f64 = final_score(&board);

  if result > 0.0 {
    return Winner::BlackWin
  } else {
    return Winner::WhiteWin
  }
}
