export const gcd = (a: number, b: number): number => {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return Math.abs(a);
};
