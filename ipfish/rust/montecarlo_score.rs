use crate::board::Board;
use crate::final_score;
use crate::get_adjacent_points;
use crate::get_legal_moves::get_legal_moves;
use crate::make_move::make_move;
use crate::pass_move::pass_move;
use crate::point_state::PointState;
use rand::thread_rng;
use rand::seq::SliceRandom;
use rand::seq::IndexedRandom;

#[repr(usize)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd, Debug)]
pub enum Winner {
  WhiteWin = 0,
  BlackWin = 1,
}

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

fn play_random_move(board: &Board) -> Option<Board> {
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

  let chosen_move: Option<&usize> = possible_moves.choose(&mut rand::thread_rng());
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
      return Some(make_move(*s, board));
    },
  }
}

fn montecarlo_simulation(mut board: Board) -> Winner {
  loop {
    match play_random_move(&board) {
      Some(s) => {board = s;},
      None => break,
    }
  }
  let result = final_score(&board);

  if result > 0.0 {
    return Winner::BlackWin
  } else {
    return Winner::WhiteWin
  }
}

mod tests {
  use crate::board_from_string::board_from_string;
  use crate::player::Player;
  use super::*;

  #[test]
  fn does_not_poke_out_eyes() {
    let board_string: &str = "
    ..X..
    XXX..
    OOXXX
    O.OOO
    .O.O#
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let mut board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 5.5, // Should lead to a score of white 16.5 black 13.
      opponent_passed: false,
    };
    let winner: Winner = montecarlo_simulation(board);
    assert_eq!(winner, Winner::WhiteWin);

    let board: Box<[u8]> = board_from_string(board_string, 5);
    let mut board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 1.5, // Should lead to a score of white 12.5 black 13.
      opponent_passed: false,
    };
    let winner: Winner = montecarlo_simulation(board);
    assert_eq!(winner, Winner::BlackWin);
  }
  #[test]
  fn should_play_b5() {
    let board_string: &str = "
    O.X.X
    XXXXX
    OOXXX
    O.OOO
    .O.O#
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let mut board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 5.5, // Should lead to a score of white 16.5 black 13.
      opponent_passed: false,
    };
    let after_move_board: Board = play_random_move(&board).unwrap();
    
    assert_eq!(after_move_board.opponent_passed, false);
    assert_eq!(after_move_board.board[21], Player::Black as u8)
  }
}
