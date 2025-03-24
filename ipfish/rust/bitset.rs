use std::ops::{BitAnd, BitAndAssign, BitOr, BitOrAssign, Not};

#[derive(Clone, Copy, Eq, PartialEq)]
pub struct BitSet {
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
        return BitSet { bits: 0 };
    }
    pub fn len(&self) -> usize {
        return self.bits.count_ones() as usize;
    }
}

impl BitOr for BitSet {
    type Output = Self;
    fn bitor(self, rhs: Self) -> Self::Output {
        return BitSet {
            bits: self.bits | rhs.bits,
        };
    }
}
impl BitOrAssign for BitSet {
    fn bitor_assign(&mut self, rhs: Self) {
        self.bits = self.bits | rhs.bits;
    }
}
impl BitAnd for BitSet {
    type Output = Self;
    fn bitand(self, rhs: Self) -> Self::Output {
        return BitSet {
            bits: self.bits & rhs.bits,
        };
    }
}
impl BitAndAssign for BitSet {
    fn bitand_assign(&mut self, rhs: Self) {
        self.bits = self.bits & rhs.bits;
    }
}
impl Not for BitSet {
    type Output = Self;

    fn not(self) -> Self::Output {
        return BitSet { bits: !self.bits };
    }
}

impl Iterator for BitSet {
    type Item = usize;
    fn next(&mut self) -> Option<Self::Item> {
        if self.bits == 0 {
            return None;
        } else {
            let trailing_zeros: usize = self.bits.trailing_zeros() as usize;
            self.bits &= self.bits - 1;
            return Some(trailing_zeros);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

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

        my_bitset.insert(0);
        assert_eq!(my_bitset.contains(0), true);

        assert_eq!(my_bitset.len(), 3);

        let mut hashset: HashSet<usize> = HashSet::new();

        for n in my_bitset {
            hashset.insert(n);
        }
        assert_eq!(hashset.contains(&7), true);
        assert_eq!(hashset.contains(&12), true);
        assert_eq!(hashset.contains(&0), true);
        assert_eq!(hashset.contains(&3), false);
        assert_eq!(hashset.contains(&14), false);
    }
}
