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

impl From<f64> for Player {
  fn from(n: f64) -> Self {
      if n as u8 == Player::Black as u8 {
        return Player::Black;
      } else if n as u8 == Player::White as u8 {
        return Player::White;
      } else {
        panic!("Can not convert {:?} into a Player", n);
      }
  }
}
