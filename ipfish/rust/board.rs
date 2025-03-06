use crate::player::Player;

pub struct Board {
  pub board: Box<[u8]>,
  pub size: usize,
  pub player: Player,
}
