use crate::board::Board;
use crate::player::Player;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;
use crate::bitset::BitSet;

/// This is an optimization of the previous count_liberties_of_group function we were using to check captures.
/// This function doesn't require a hashmap, which should be much faster.
/// Returns true if the group at `point` is in atari, and false otherwise.
/// It takes a known liberty of the group, which is required as it is known in all cases where we call this.
///
/// # Arguments
///
/// * `point` - A point of the group that we're checking if it's in atari.
/// * `board` - The board state. The 
/// * `known_liberty` - A point we know is a liberty of the group.
pub fn is_in_atari(point: usize, board: &Board, known_liberty: usize) -> bool {
  let mut unchecked_points: Vec<usize> = Vec::from(get_adjacent_points(point, board));
  let mut group: BitSet = BitSet::new();
  group.insert(point);

  let player: Player;
  if board.board[point] == Player::Black as u8 {
    player = Player::Black;
  } else if board.board[point] == Player::White as u8 {
    player = Player::White;
  } else {
    panic!("Can't get the group of an empty of offline point!");
  }

  while let Some(unchecked_point) = unchecked_points.pop() {
    // If it has a liberty that's not the known liberty, then it is not in atari.
    if board.board[unchecked_point] == PointState::Empty as u8 && unchecked_point != known_liberty {
      return false
    }
    // If the point is a friendly point and isn't in the group, then extend the group.
    else if board.board[unchecked_point] == player as u8 && !group.contains(unchecked_point) {
      unchecked_points.extend_from_slice(&get_adjacent_points(unchecked_point, board));
      group.insert(unchecked_point);
    }
    // Otherwise it's an enemy piece or an offline node, both which count as surrounding the group.
  }
  return true;
}
