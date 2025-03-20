struct BitSet {
  bits: usize,
}

impl BitSet {
  pub fn insert(&mut self, n: usize) {
    assert!(n < usize::BITS as usize);
    self.bits |= 1 << n;
  }
  pub fn contains(&self, n: usize) -> bool {
    assert!(n < usize::BITS as usize);
    return self.bits & (1 << n) > 0;
  }
  pub fn new() -> BitSet {
    return BitSet {
      bits: 0
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn basic_bitset() {
    let mut my_bitset: BitSet = BitSet::new();

    my_bitset.insert(7);
    my_bitset.insert(12);

    assert_eq!(my_bitset.contains(7), true);
    assert_eq!(my_bitset.contains(12), true);
    assert_eq!(my_bitset.contains(1), false);
    assert_eq!(my_bitset.contains(0), false);
    assert_eq!(my_bitset.contains(24), false);
  }
}
