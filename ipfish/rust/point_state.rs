use crate::player::Player;

// Needs to match what's in the javascript
#[repr(u8)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub enum PointState {
    Empty = 1,
    Black = 2,
    White = 3,
    Offline = 4,
}

impl From<Player> for PointState {
    fn from(player: Player) -> PointState {
        match player {
            Player::Black => Self::Black,
            Player::White => Self::White,
        }
    }
}
