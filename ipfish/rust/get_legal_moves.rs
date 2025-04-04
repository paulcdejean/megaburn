use crate::bitset::BitSet;
use crate::get_adjacent_points::get_adjacent_points;
use crate::is_in_atari::is_in_atari;
use crate::make_move::make_move;
use crate::point_state::PointState;

use crate::board::{Board, BoardHistory};
/// Returns a bitset where the 1 bits are legal moves. This version checks for superko even for non captures.
/// This stricter version should be used for checking the first move. While the less strict version is good enough for montecarlo.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko. If this none then superko isn't calculated.
pub fn get_legal_moves_strict(board: &Board, board_history: &BoardHistory) -> BitSet {
    let mut result: BitSet = BitSet::new();
    for point in 0..board.board.len() {
        // The move is always illegal if there is already a piece there.
        if board.board[point] != PointState::Empty as u8 {
            // Illegal.
        } else if violates_superko(point, board, board_history) {
            // Illegal.
        }
        // Captures are always legal, even if they're otherwise self captures. Unless they violate superko.
        else if captures_enemy_group(point, board) {
            // Legal! Even if it's "self capture"
            result.insert(point);
        }
        // Self captures that are not enemy captures are illegal.
        else if is_self_capture(point, board) {
            // Illegal.
        }
        // Other moves are legal.
        else {
            // Legal!
            result.insert(point);
        }
    }
    return result;
}

/// Returns a bitset where the 1 bits are legal moves.
///
/// # Arguments
///
/// * `board` - The state of the board we're getting the legal moves for.
/// * `board_history` - All states the board has historically been in, important for determining superko. If this none then superko isn't calculated.
pub fn get_legal_moves(board: &Board, board_history: &BoardHistory) -> BitSet {
    let mut result: BitSet = BitSet::new();
    for point in 0..board.board.len() {
        // The move is always illegal if there is already a piece there.
        if board.board[point] != PointState::Empty as u8 {
        }
        // Captures are always legal, even if they're otherwise self captures. Unless they violate superko.
        else if captures_enemy_group(point, board) && !violates_superko(point, board, board_history) {
            result.insert(point);
        }
        // Self captures that are not enemy captures are illegal.
        else if is_self_capture(point, board) {
        }
        // Other moves are legal.
        else {
            result.insert(point);
        }
    }
    return result;
}

fn is_self_capture(point: usize, board: &Board) -> bool {
    for adjacent_point in get_adjacent_points(point, board) {
        // If there's an adjacent empty point, it is not self capture
        if board.board[adjacent_point] == PointState::Empty as u8 {
            return false;
        }
        // If there's an adjacent friendly group that is not in atari, then it's not self capture.
        else if board.board[adjacent_point] == board.player as u8 {
            if !is_in_atari(adjacent_point, board, point, &mut BitSet::new()) {
                return false;
            }
        }
        // If there's an adjacent enemy group that is in atari, then it's not self capture.
        // However we already check for this in another place so we don't check that here.
    }
    return true;
}

pub fn captures_enemy_group(point: usize, board: &Board) -> bool {
    for adjacent_point in get_adjacent_points(point, board) {
        // If there's an adjacent enemy group that is in atari, then it captures an enemy group.
        if board.board[adjacent_point] == !board.player as u8 {
            if is_in_atari(adjacent_point, board, point, &mut BitSet::new()) {
                return true;
            }
        }
    }
    return false;
}

fn violates_superko(point: usize, board: &Board, board_history: &BoardHistory) -> bool {
    let new_position: Box<[u8]> = make_move(point, board).board;

    if board_history.contains(&new_position) {
        return true;
    } else {
        return false;
    }
}

#[cfg(test)]
mod tests {
    use rustc_hash::FxBuildHasher;
    use std::collections::HashSet;

    use super::*;
    use crate::board_from_string::board_from_string;
    use crate::player::Player;

    #[test]
    fn basic_capture() {
        let board: Box<[u8]> = board_from_string(
            "
    .....
    OXOX.
    .OX..
    ....#
    ...#.
    ",
            5,
        );
        let legality: [bool; 25] = [
            true, true, true, false, // Node is offline
            false, // Surrounded by offline nodes
            true, true, true, true, false, // Node is offline
            true, false, // White piece there
            false, // Black piece there
            true, true, false, false, false, false, // Pieces there
            true, true, true, true, true, true,
        ];

        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };

        let board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
        let legal_moves: BitSet = get_legal_moves(&board, &board_history);
        for n in 0..25 as usize {
            if legal_moves.contains(n) {
                assert_eq!(legality[n], true, "Move {} marked as legal when it should be illegal", n);
            } else {
                assert_eq!(false, legality[n], "Move {} marked as illegal when it should be legal", n);
            }
        }
    }
    #[test]
    fn self_capture_legality() {
        let board: Box<[u8]> = board_from_string(
            "
    .OX#.
    OOXX.
    XXXOO
    ...O.
    #####
    ",
            5,
        );
        let legality: [bool; 25] = [
            false, false, false, false, false, // Bottom row is offline
            true, true, true, false, // White piece there
            false, // Would be self capture
            false, false, false, false, false, // Pieces in this row
            false, false, false, false, // More pieces
            true,  // Best move, as it prevents white from making life
            true,  // Legal move, it's not self capture because it captures the white group
            false, false, false, // Pieces there
            true,
        ];
        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };
        let board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
        let legal_moves: BitSet = get_legal_moves(&board, &board_history);
        for n in 0..25 as usize {
            if legal_moves.contains(n) {
                assert_eq!(legality[n], true, "Move {} marked as legal when it should be illegal", n);
            } else {
                assert_eq!(false, legality[n], "Move {} marked as illegal when it should be legal", n);
            }
        }
    }

    #[test]
    fn more_self_capture_legality() {
        let board: Box<[u8]> = board_from_string(
            "
    .....
    .OO..
    #.XX.
    .OXOX
    ..XO.
    ",
            5,
        );
        let legality: [bool; 25] = [
            true, true, false, false, true, true, false, false, false, false, false, true, false, false, true, true, false, false, true, true, true, true,
            true, true, true,
        ];

        let board: Board = Board {
            board: board,
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };
        let board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
        let legal_moves: BitSet = get_legal_moves(&board, &board_history);
        for n in 0..25 as usize {
            if legal_moves.contains(n) {
                assert_eq!(legality[n], true, "Move {} marked as legal when it should be illegal", n);
            } else {
                assert_eq!(false, legality[n], "Move {} marked as illegal when it should be legal", n);
            }
        }
    }

    #[test]
    fn first_ko() {
        let previous_board: Box<[u8]> = board_from_string(
            "
    ...X.
    XOOOX
    XXXOO
    .XOOO
    X.#..
    ",
            5,
        );
        let current_board: Box<[u8]> = board_from_string(
            "
    ...XO
    XOOO.
    XXXOO
    .XOOO
    X.#..
    ",
            5,
        );
        let legality: [bool; 25] = [
            false, true, false, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, // Ko!
            true, true, true, false, false,
        ];

        let board: Board = Board {
            board: current_board.clone(),
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };
        let mut board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
        board_history.insert(previous_board);
        board_history.insert(current_board);

        let legal_moves: BitSet = get_legal_moves(&board, &board_history);
        for n in 0..25 as usize {
            if legal_moves.contains(n) {
                assert_eq!(legality[n], true, "Move {} marked as legal when it should be illegal", n);
            } else {
                assert_eq!(false, legality[n], "Move {} marked as illegal when it should be legal", n);
            }
        }
    }

    #[test]
    fn atari_refactor_test() {
        let current_board: Box<[u8]> = board_from_string(
            "
    .OO.#
    OOO..
    .OOOX
    OOOO.
    #O#.X
    ",
            5,
        );
        let legality: [bool; 25] = [
            false, false, false, true, false, false, false, false, false, true, false, // Self capture
            false, false, false, false, false, false, false, true, true, false, // Self capture
            false, false, true, false,
        ];

        let board: Board = Board {
            board: current_board.clone(),
            size: 5,
            player: Player::Black,
            komi: 7.5,
            opponent_passed: false,
        };

        let sadly_self_capture = is_self_capture(10, &board);
        assert_eq!(sadly_self_capture, true, "Sadly a3 is self capture");

        let board_history: BoardHistory = HashSet::with_hasher(FxBuildHasher::default());
        let legal_moves: BitSet = get_legal_moves(&board, &board_history);
        for n in 0..25 as usize {
            if legal_moves.contains(n) {
                assert_eq!(legality[n], true, "Move {} marked as legal when it should be illegal", n);
            } else {
                assert_eq!(false, legality[n], "Move {} marked as illegal when it should be legal", n);
            }
        }
    }
}
