use crate::board::Board;
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
/// * `group` - For non recursive calls, pass a new bitset.
pub fn is_in_atari(point: usize, board: &Board, known_liberty: usize, group: &mut BitSet) -> bool {
  group.insert(point);
  for adjacent_point in get_adjacent_points(point, board) {
    // It's not in atari if there's an adjacent empty point that's not the known liberty.
    if board.board[adjacent_point] == PointState::Empty as u8 && adjacent_point != known_liberty {
      return false;
    // If it's a friendly stone that's not in the group, add it to the group and recur.
    } else if board.board[adjacent_point] == board.board[point] && !group.contains(adjacent_point) {
      return is_in_atari(adjacent_point, board, known_liberty, group);
    }
  }
  return true;
}
