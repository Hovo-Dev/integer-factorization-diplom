import { useState, useRef } from 'react';
import { BlockMath } from 'react-katex';
import { modPow } from "../utils/mod-pow.ts";
import { lcm } from "../utils/lcm.ts";
import { gcd } from "../utils/gcd.ts";
import { isPrime } from "../utils/prime.ts";

function PollardP1() {
    const [input, setInput] = useState('');
    const [visibleSteps, setVisibleSteps] = useState<string[]>([]);
    const [animating, setAnimating] = useState(false);
    const [factors, setFactors] = useState<number[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    const startAnimation = (steps: string[]) => {
        let i = 0;
        setVisibleSteps([]);
        setAnimating(true);

        const interval = setInterval(() => {
            setVisibleSteps(prev => [...prev, steps[i - 1]]);
            scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
            i++;
            if (i >= steps.length) {
                clearInterval(interval);
                setAnimating(false);
            }
        }, 800);
    };

    const trialDivide = (n: number, stepLog: string[], collected: number[]) => {
        let d = 2;
        while (d * d <= n) {
            while (n % d === 0) {
                stepLog.push(`\\color{red} { \\text{Fallback trial division: } ${n} \\div ${d} = ${n / d}} `);
                collected.push(d);
                n = n / d;
            }
            d++;
        }
        if (n > 1) {
            stepLog.push(`\\color{white} { \\text{Remaining prime factor: } ${n} }`);
            collected.push(n);
        }
    };

    const pollardStep = (n: number): [number | null, number | null, string[]] => {
        let a = 2;
        const steps: string[] = [];

        while (a < n) {
            let B = 10;
            while (B <= 50) {
                const lcmNumbers = Array.from({ length: B }, (_, i) => i + 1).join(',');
                steps.push(`\\color{white} { \\text{Attempting factorization of } n = ${n} }`);
                steps.push(`\\color{white} { \\text{Base } a = ${a},\\ B = ${B} }`);

                let k = 1;
                for (let i = 2; i <= B; i++) {
                    k = lcm(k, i);
                }

                steps.push(`\\color{white} { \\text{ Compute } k = \\mathrm{lcm}(${lcmNumbers}) \\Rightarrow k = ${k} }`);
                const ak = modPow(a, k, n);
                steps.push(`\\color{white} { \\text{Step 2: } a^k \\mod n = ${a}^{${k}} \\mod ${n} = ${ak} }`);

                const d = gcd(ak - 1, n);
                steps.push(`\\color{white} { \\text{Step 3: } \\gcd(${ak} - 1, ${n}) = ${d} }`);

                if (d > 1 && d < n) {
                    steps.push(`\\color{white} { \\text{\\color{green}{Found non-trivial factor: }} d = ${d} }`);
                    const cofactor = n / d;
                    return [d, cofactor, steps];
                } else {
                    steps.push(`\\color{white} { \\text{\\color{orange}{Failed with a = ${a}, B = ${B}}} }`);
                    B += 5;
                }
            }
            a++;
        }

        steps.push(`\\color{red} { \\text{ ❌ Exhausted all a and B without finding a factor } }`);
        return [null, null, steps];
    };

    const fullFactor = (n: number, stepLog: string[] = [], collected: number[] = []): void => {
        if (isPrime(n)) {
            stepLog.push(`\\color{white} { \\text{${n} is prime → added to list} }`);
            collected.push(n);
            return;
        }

        // Use trial division directly for small numbers
        if (n < 100) {
            stepLog.push(`\\color{white} { \\text{Switching to trial division for small number } ${n} }`);
            trialDivide(n, stepLog, collected);
            return;
        }

        const [factor, cofactor, steps] = pollardStep(n);
        stepLog.push(...steps);

        if (!factor) {
            stepLog.push(`\\color{red} { \\text{ ❌ Pollard's p-1 failed on } ${n}, \\text{ switching to trial division} }`);
            trialDivide(n, stepLog, collected);
            return;
        }

        fullFactor(factor, stepLog, collected);
        if (cofactor && cofactor !== factor) {
            fullFactor(cofactor, stepLog, collected);
        }
    };

    const handleFactor = (n: number) => {
        const steps: string[] = [];
        const collected: number[] = [];
        fullFactor(n, steps, collected);
        setFactors(collected);
        startAnimation(steps);
    };

    const formatFactorProduct = (factors: number[]): string => {
        const counts = new Map<number, number>();
        const descSortedFactors = factors.sort((a, b) => b - a);

        for (const num of descSortedFactors) {
            counts.set(num, (counts.get(num) || 0) + 1);
        }
        const terms: string[] = [];
        counts.forEach((count, prime) => {
            terms.push(count === 1 ? `\\color{white} { ${prime} }` : `\\color{white} { ${prime}^{${count}} }`);
        });
        return terms.join(' \\times ');
    };

    return (
        <div className="pt-[10px] text-gray-800 font-mono">
            <div className="flex flex-col items-center max-w-2xl mx-auto bg-white shadow-xl rounded-lg">
                <h1 className="text-[28px] font-bold mb-[5px] text-center" style={{color: 'white'}}>
                    Pollard's p-1
                </h1>

                <form className="flex w-[400px] gap-[8px] mb-[10px]">
                    <input
                        type="number"
                        className="outline-none border border-gray-300 rounded px-[12px] py-[8px] w-full sm:w-auto"
                        placeholder="Enter a number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        onClick={() => handleFactor(Number(input))}
                        disabled={animating}
                        className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-[20px] py-[8px] rounded transition"
                    >
                        {animating ? 'Running...' : 'Factorize'}
                    </button>
                </form>

                {/* 🔁 Step-by-step LaTeX */}
                <div
                    ref={scrollRef}
                    className="bg-slate-50 overflow-y-auto scroll-auto max-h-[72vh] space-y-[5px] text-[14px]"
                >
                    {visibleSteps.map((latex, idx) => (
                        <BlockMath key={idx}>{latex}</BlockMath>
                    ))}
                </div>

                {/* 🧮 Final Factor Result */}
                {factors.length > 0 && !animating && (
                    <div className="text-center">
                        <p className="text-[18px]" style={{color: 'white'}}>✅ Prime Factors Found:</p>
                        <BlockMath>{formatFactorProduct(factors)}</BlockMath>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PollardP1;
