use crate::board::Board;
use crate::player::Player;
use crate::point_state::PointState;
use crate::get_adjacent_points::get_adjacent_points;
use crate::bitset::BitSet;

/// Counts all the stones and territory, to determine the winner.
/// Positive value = win for black.
/// Negative value = win for white.
///
/// # Arguments
///
/// * `board` - The board state to score.
pub fn final_score(board: &Board) -> f64 {
  return 0.0 + score_from_stones(board) + score_from_territory(board) - board.komi;
}

fn score_from_stones(board: &Board) -> f64 {
  let mut stone_score: f64 = 0.0;
  for point in 0..board.board.len() {
    if board.board[point] == Player::Black as u8 {
      stone_score += 1.0;
    } else if board.board[point] == Player::White as u8 {
      stone_score -= 1.0;
    }
  }
  return stone_score;
}

fn score_from_territory(board: &Board) -> f64 {
  let mut counted_empty_points:BitSet = BitSet::new();
  let mut territory_score: f64 = 0.0;

  for point in 0..board.board.len() {
    if board.board[point] == PointState::Empty as u8 && !counted_empty_points.contains(point) {
      territory_score += score_point_territory(point, &board, &mut counted_empty_points);
    }
  }

  return territory_score;
}

fn score_point_territory(point: usize, board: &Board, counted_empty_points: &mut BitSet) -> f64 {
  let mut points_in_territory: BitSet = BitSet::new();
  points_in_territory.insert(point);
  let mut unchecked_points: Vec<usize> = Vec::from([point]);
  let mut active_player : Option<Player> = None;

  while let Some(unchecked_point) = unchecked_points.pop() {
    for adjacent_point in get_adjacent_points(unchecked_point, &board) {
      if board.board[adjacent_point] == PointState::Empty as u8 && !points_in_territory.contains(adjacent_point) {
        unchecked_points.push(adjacent_point);
        points_in_territory.insert(adjacent_point);
        counted_empty_points.insert(adjacent_point);
      } else if board.board[adjacent_point] == PointState::White as u8 {
        if *active_player.get_or_insert(Player::White) == Player::Black {
          return 0.0
        }
      } else if board.board[adjacent_point] == PointState::Black as u8 {
        if *active_player.get_or_insert(Player::Black) == Player::White {
          return 0.0
        }
      }
    }
  }

  match active_player {
    None => f64::NEG_INFINITY,
    Some(Player::White) => points_in_territory.len() as f64 * -1.0,
    Some(Player::Black) => points_in_territory.len() as f64,
  }
}

#[cfg(test)]
mod tests {
  use crate::board_from_string::board_from_string;
  use super::*;

  #[test]
  fn correct_final_score() {
    let board_string: &str = "
    O.#.X
    OX...
    OOX..
    OXXX.
    O.X.X
    ";
    let board: Box<[u8]> = board_from_string(board_string, 5);
    let board: Board = Board {
      board: board,
      size: 5,
      player: Player::Black,
      komi: 7.5, // This is versus the illuminati, komi is critical for this test!
      opponent_passed: false,
    };

    // With the game concluded black is winning by 2.5 points, using ipvgo's scoring system.
    let result: f64 = final_score(&board);
    assert_eq!(result, 2.5);
  }
}
