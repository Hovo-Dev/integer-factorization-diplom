import { useState, useRef } from 'react';
import { BlockMath } from 'react-katex';
import { gcd } from "../utils/gcd.ts";
import { isPrime } from "../utils/prime.ts";

function PollardRho() {
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
            setVisibleSteps(prev => [...prev, steps[i-1]]);
            scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
            i++;
            if (i >= steps.length) {
                clearInterval(interval);
                setAnimating(false);
            }
        }, 400);
    };

    const trialDivide = (n: number, steps: string[], collected: number[]) => {
        let d = 2;
        while (d * d <= n) {
            while (n % d === 0) {
                steps.push(`\\color{white} { \\text{Trial division: } ${n} \\div ${d} = ${n / d} }`);
                collected.push(d);
                n /= d;
            }
            d++;
        }
        if (n > 1) {
            steps.push(`\\color{white} { \\text{Remaining prime factor: } ${n} }`);
            collected.push(n);
        }
    };

    const rhoStep = (n: number): [number | null, number | null, string[]] => {
        let steps: string[] = [];
        let x = 2;
        let y = 2;
        let c = 1;
        let d = 1;

        const f = (x: number) => (x * x + c) % n;

        steps.push(`\\color{white}{\\text{Starting Pollard's Rho with } x_0 = 2,\ c = 1,\ f(x) = x^2 + ${c} \mod ${n}}`);

        while (d === 1) {
            x = f(x);
            y = f(f(y));
            d = gcd(Math.abs(x - y), n);

            steps.push(`\\color{white}{ x = ${x},\ y = ${y},\ \gcd(\\lvert x - y \\rvert, ${n}) = ${d} }`);

            if (d === n) {
                steps.push(`\\color{white} { \\text{ Cycle detected with no factor found, try different } c} `);
                return [null, null, steps];
            }
        }

        steps.push(`\\text{\\color{green}{Found non-trivial factor: }} \\color{white} { d = ${d} }`);
        return [d, n / d, steps];
    };

    const fullFactor = (n: number, steps: string[] = [], collected: number[] = []) => {
        if (isPrime(n)) {
            steps.push(`\\color{white} { \\text{${n} is prime → added to list} }`);
            collected.push(n);
            return;
        }

        if (n < 100) {
            steps.push(`\\color{white} { \\text{ Switching to trial division for small number } ${n} }`);
            trialDivide(n, steps, collected);
            return;
        }

        const [factor, cofactor, s] = rhoStep(n);
        steps.push(...s);

        if (!factor) {
            steps.push(`\\color{red} { \\text{ ❌ Rho failed on ${n}} }, \\color{red} { \\text{ Switching to trial division } }`);
            trialDivide(n, steps, collected);
            return;
        }

        fullFactor(factor, steps, collected);
        if (cofactor && cofactor !== factor) {
            fullFactor(cofactor, steps, collected);
        }
    };

    const formatFactorProduct = (factors: number[]): string => {
        const counts = new Map<number, number>();
        for (const num of factors) {
            counts.set(num, (counts.get(num) || 0) + 1);
        }
        const terms: string[] = [];
        Array.from(counts.entries())
            .sort((a, b) => b[0] - a[0])
            .forEach(([prime, count]) => {
                terms.push(count === 1 ? `\\color{white} { ${prime} }` : `\\color{white} { ${prime}^{${count}} }`);
            });
        return terms.join(' \\times ');
    };

    const handleFactor = (n: number) => {
        const steps: string[] = [];
        const collected: number[] = [];
        fullFactor(n, steps, collected);
        setFactors(collected);
        startAnimation(steps);
    };

    return (
        <div className="pt-[10px] text-gray-800 font-mono">
            <div className="flex flex-col items-center max-w-2xl mx-auto bg-white shadow-xl rounded-lg">
                <h1 className="text-[28px] font-bold mb-[15px] text-center" style={{color: 'white'}}>
                    Pollard's Rho
                </h1>

                <form className="flex w-[400px] h-[45px] gap-[8px] mb-[10px]">
                    <input
                        type="number"
                        className="outline-none border border-gray-300 rounded px-[12px] py-[8px] text-[22px] w-full sm:w-auto"
                        placeholder="Enter a number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        disabled={animating}
                        onClick={() => handleFactor(Number(input))}
                        className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-[20px] py-[8px] rounded-xl shadow-lg transition-all"
                    >
                        {animating ? 'Running...' : 'Factorize'}
                    </button>
                </form>

                {/* 🔁 Step-by-step LaTeX */}
                <div
                    ref={scrollRef}
                    className="bg-slate-50 overflow-y-auto scroll-auto max-h-[72vh] space-y-[5px] text-[18px]"
                >
                    {visibleSteps.map((latex, idx) => (
                        <BlockMath key={idx}>{latex}</BlockMath>
                    ))}
                </div>

                {/* 🧮 Final Factor Result */}
                {factors.length > 0 && !animating && (
                    <div className="text-center">
                        <p className="text-[26px]" style={{color: 'white'}}>✅ Գտանք պարզ արտադրիչներ:</p>
                        <BlockMath>{formatFactorProduct(factors)}</BlockMath>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PollardRho;
