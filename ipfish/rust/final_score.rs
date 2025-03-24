use crate::bitset::BitSet;
use crate::board::Board;
use crate::get_adjacent_points::get_adjacent_points;
use crate::player::Player;
use crate::point_state::PointState;

/// Counts all the stones and territory, to determine the winner.
/// Positive value = win for black.
/// Negative value = win for white.
///
/// # Arguments
///
/// * `board` - The board state to score.
pub fn final_score(board: &Board) -> f64 {
    return score_from_stones(board) + score_from_territory(board) - board.komi;
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

#[derive(Clone, Copy, Eq, PartialEq)]
pub enum SeenStones {
    None,
    Black,
    White,
    Both,
}

fn score_from_territory(board: &Board) -> f64 {
    let mut counted_empty_points: BitSet = BitSet::new();
    let mut result: f64 = 0.0;

    for point in 0..board.board.len() {
        if board.board[point] == PointState::Empty as u8 && !counted_empty_points.contains(point) {
            let mut group: BitSet = BitSet::new();
            let group_territory =
                score_group_territory(point, board, &mut group, &mut SeenStones::None);
            result += group_territory;
            counted_empty_points |= group;
        }
    }
    return result;
}

pub fn score_group_territory(
    point: usize,
    board: &Board,
    group: &mut BitSet,
    seen_stones: &mut SeenStones,
) -> f64 {
    group.insert(point);
    for adjacent_point in get_adjacent_points(point, board) {
        if board.board[adjacent_point] == PointState::Empty as u8 && !group.contains(adjacent_point)
        {
            score_group_territory(adjacent_point, board, group, seen_stones);
        }
        // If the adjacent point is a stone, factor it as the color surrounding the group.
        else if board.board[adjacent_point] == PointState::Black as u8
            && *seen_stones == SeenStones::None
        {
            *seen_stones = SeenStones::Black;
        } else if board.board[adjacent_point] == PointState::Black as u8
            && *seen_stones == SeenStones::White
        {
            *seen_stones = SeenStones::Both;
        } else if board.board[adjacent_point] == PointState::White as u8
            && *seen_stones == SeenStones::None
        {
            *seen_stones = SeenStones::White;
        } else if board.board[adjacent_point] == PointState::White as u8
            && *seen_stones == SeenStones::Black
        {
            *seen_stones = SeenStones::Both;
        }
    }

    match *seen_stones {
        SeenStones::None => 0.0,
        SeenStones::Both => 0.0,
        SeenStones::Black => group.len() as f64,
        SeenStones::White => group.len() as f64 * -1.0,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board_from_string::board_from_string;

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
    #[test]
    fn glitch_with_offline_eyes() {
        let board: Box<[u8]> = board_from_string(
            "
    ..X#.
    XX.X#
    XXXX.
    .X..X
    ",
            5,
        );
        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 5.5, // This is versus the illuminati, komi is critical for this test!
            opponent_passed: false,
        };

        // With the game concluded black is winning by 2.5 points, using ipvgo's scoring system.
        let result: f64 = final_score(&board);
        assert_eq!(result, 11.5);
    }

    #[test]
    fn lost_by_a_little() {
        let board: Box<[u8]> = board_from_string(
            "
    #X.X.
    .XXX.
    OOXXX
    .OOO.
    #####
    ",
            5,
        );
        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 5.5, // This is versus the illuminati, komi is critical for this test!
            opponent_passed: false,
        };

        // With the game concluded black is winning by 2.5 points, using ipvgo's scoring system.
        let result: f64 = final_score(&board);
        assert_eq!(result, -0.5);
    }
}
