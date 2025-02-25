use wasm_bindgen::prelude::*;

/// Squares a number, I just think the documentation is really cool
///
/// # Arguments
///
/// * `n` - The number to square.
#[wasm_bindgen]
pub fn wasmsquare(n: js_sys::Number) -> js_sys::Number {
  return n.clone() * n;
}
