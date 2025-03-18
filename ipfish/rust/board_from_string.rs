use std::vec;

use crate::point_state::PointState;

/// Builds an internal board representation from a string.
/// For the string, . is an empty space, X is a black stone, O is a white stone and # is an offline stone. Other character such as whitespace, are ignored.
/// Panics if the number of returned points isn't equal to the square of the board size.
///
/// # Arguments
///
/// * `board_string` - The string representation of the board state.
/// * `board_size` - The size of the board, which is the square root of the number of points on the board.
#[allow(dead_code)] // Only used in tests
pub fn board_from_string(board_str: &str, board_size: usize) -> Box<[u8]> {
  let number_of_points: usize = board_size * board_size;
  let mut result: Vec<u8> = vec![0; number_of_points];

  let mut n: usize = 0;

  for letter in String::from(board_str).chars() {
    if n >= number_of_points {
      break;
    }

    let column: usize = n % board_size;
    let row: usize = (number_of_points - n - 1) / board_size;
    let location: usize = row * board_size + column;

    if letter == '.' {
      result[location] = PointState::Empty as u8;
      n += 1;
    } else if letter == 'X' {
      result[location] = PointState::Black as u8;
      n += 1;
    } else if letter == 'O' {
      result[location] = PointState::White as u8;
      n += 1;
    } else if letter == '#' {
      result[location] = PointState::Offline as u8;
      n += 1;
    }
  }

  return result.into_boxed_slice();
}

