use crate::bitset::BitSet;
use crate::board::Board;
use crate::get_adjacent_points::get_adjacent_points;
use crate::point_state::PointState;

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
        if board.board[adjacent_point] == PointState::Empty as u8 && adjacent_point != known_liberty
        {
            return false;
        // If it's a friendly stone that's not in the group, add it to the group and recur.
        } else if board.board[adjacent_point] == board.board[point]
            && !group.contains(adjacent_point)
        {
            if !is_in_atari(adjacent_point, board, known_liberty, group) {
                return false;
            }
        }
    }
    return true;
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board_from_string::board_from_string;
    use crate::player::Player;
    #[test]
    fn test_atari_hallucination() {
        let board: Box<[u8]> = board_from_string(
            "
    .OO.#
    OOO..
    .OOOX
    OOOO.
    #O#.X
    ",
            5,
        );

        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };

        let not_in_atari: bool = is_in_atari(11, &board, 10, &mut BitSet::new());
        assert_eq!(
            not_in_atari, false,
            "This white group is definitely not in atari"
        );
    }
}
