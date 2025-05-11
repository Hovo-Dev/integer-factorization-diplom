import { gcd } from "./gcd.ts";

export const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};
