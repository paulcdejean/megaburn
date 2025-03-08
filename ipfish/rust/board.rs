use crate::player::Player;

pub struct Board {
  // The current pieces of the board
  pub board: Box<[u8]>,
  // The size of the board (the square root of the number of points on it)
  pub size: usize,
  // Who's turn it currently is to play
  pub player: Player,
}
