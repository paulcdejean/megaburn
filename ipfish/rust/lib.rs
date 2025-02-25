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

#[wasm_bindgen]
pub fn get_analysis(board_history: js_sys::Array) {
  let current_board : Vec<u8> = js_sys::Uint8Array::new(&board_history.into_iter().last().unwrap()).to_vec();
  
}
