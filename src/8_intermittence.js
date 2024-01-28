export function calc_intermittence(GV, Sh, Hsp, i0) {
  const G = GV / (Sh * Hsp)
  const INT = i0 / (1 + 0.1 * (G - 1))
  return INT
}
