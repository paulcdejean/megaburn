use std::ops::Not;

#[repr(u8)]
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub enum Player {
  Black = 2,
  White = 3,
}

impl Not for Player {
  type Output = Self;
  fn not(self) -> Player {
      match self {
        Player::Black => Self::White,
        Player::White => Self::Black,
      }
  }
}
