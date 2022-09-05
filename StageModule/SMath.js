export { clamp, mirror, warp, step, correctRadii, pow, mat2DotVec2, vec2Scale, vec2Add, vec2Angle };
function clamp(value, max, min = 0.0) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
function mirror(value, mid) {
    value = value % (mid * 2);
    if (value <= mid)
        return value;
    else
        return 2 * mid - value;
}
function warp(value, wall) {
    return value % wall;
}
function step(value, des) {
    if (value >= des)
        return 1.0;
    else
        return 0.0;
}
function correctRadii(signedRx, signedRy, x1p, y1p) {
    const prx = Math.abs(signedRx);
    const pry = Math.abs(signedRy);
    const A = x1p ** 2 / prx ** 2 + y1p ** 2 / pry ** 2;
    const rx = A > 1 ? Math.sqrt(A) * prx : prx;
    const ry = A > 1 ? Math.sqrt(A) * pry : pry;
    return [rx, ry];
}
function pow(n) {
    return Math.pow(n, 2);
}
function mat2DotVec2([m00, m01, m10, m11], [vx, vy]) {
    return [m00 * vx + m01 * vy, m10 * vx + m11 * vy];
}
function vec2Scale([a0, a1], scalar) {
    return [a0 * scalar, a1 * scalar];
}
function vec2Dot([ux, uy], [vx, vy]) {
    return ux * vx + uy * vy;
}
function vec2Mag([ux, uy]) {
    return Math.sqrt(ux ** 2 + uy ** 2);
}
function vec2Add([ux, uy], [vx, vy]) {
    return [ux + vx, uy + vy];
}
function vec2Angle(u, v) {
    const [ux, uy] = u;
    const [vx, vy] = v;
    const sign = ux * vy - uy * vx >= 0 ? 1 : -1;
    return sign * Math.acos(vec2Dot(u, v) / (vec2Mag(u) * vec2Mag(v)));
}
