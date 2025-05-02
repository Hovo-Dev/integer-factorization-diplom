import { useRef, useState } from 'react';
import { BlockMath } from 'react-katex';
import {isPrime} from "../utils/prime.ts";
import {gcd} from "../utils/gcd.ts";

function QuadraticSieve() {
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
            setVisibleSteps((prev) => [...prev, steps[i-1]]);
            scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
            i++;
            if (i >= steps.length) {
                clearInterval(interval);
                setAnimating(false);
            }
        }, 800);
    };

    const trialDivide = (n: number, steps: string[], collected: number[]) => {
        let d = 2;
        while (d * d <= n) {
            while (n % d === 0) {
                steps.push(`\\color{white} {\\text{Trial division: } ${n} \\div ${d} = ${n / d}}`);
                collected.push(d);
                n /= d;
            }
            d++;
        }
        if (n > 1) {
            steps.push(`\\color{white} {\\text{Remaining prime factor: } ${n}}`);
            collected.push(n);
        }
    };

    const simpleQuadraticSieve = (n: number, steps: string[]): [number | null, number | null] => {
        let x = Math.floor(Math.sqrt(n)) + 1;
        let y = x * x - n;
        steps.push(`\\color{white}{\\text{Starting QS with } x = ${x},\\ x^2 - n = ${y}}`);

        while (true) {
            if (Number.isInteger(Math.sqrt(y))) {
                steps.push(`\\text{\\color{green}{Found perfect square: }} \\color{white}{x = ${x},\\ x^2 - n = ${y}}`);
                const rootY = Math.floor(Math.sqrt(y));
                const factor1 = gcd(x - rootY, n);
                const factor2 = gcd(x + rootY, n);

                steps.push(`\\color{white}{\\text{Computing } \\gcd(x - \\sqrt{y}, n) = ${factor1}}`);
                steps.push(`\\color{white}{\\text{Computing } \\gcd(x + \\sqrt{y}, n) = ${factor2}}`);

                if (factor1 !== 1 && factor1 !== n) return [factor1, n / factor1];
                if (factor2 !== 1 && factor2 !== n) return [factor2, n / factor2];

                steps.push(`\\color{red}{\\text{❌ Both GCDs are trivial, retrying with next x}}`);
            }
            x++;
            y = x * x - n;

            if (x - Math.sqrt(n) > 100) {
                steps.push(`\\color{red}{\\text{❌ QS failed: couldn't find a useful congruence}}`);
                return [null, null];
            }
        }
    };

    const fullFactor = (n: number, steps: string[] = [], collected: number[] = []) => {
        if (isPrime(n)) {
            steps.push(`\\color{white} {\\text{✔️ ${n} is prime → added to list}}`);
            collected.push(n);
            return;
        }

        if (n < 100) {
            steps.push(`\\color{white} {\\text{Switching to trial division for small number } ${n}}`);
            trialDivide(n, steps, collected);
            return;
        }

        const [factor, cofactor] = simpleQuadraticSieve(n, steps);

        if (!factor) {
            steps.push(`\\color{red} {\\text{❌ QS failed on ${n}}}, \\color{white}{\\text{Switching to trial division}}`);
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
                terms.push(count === 1 ? `\\color{white}{${prime}}` : `\\color{white}{${prime}^{${count}}}`);
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
        <div className="bg-black p-[24px] text-gray-800 font-mono">
            <div className="flex flex-col items-center max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-[24px]">
                <h1 className="text-[28px] font-bold mb-[16px] text-center" style={{ color: 'white' }}>Quadratic Sieve</h1>

                <form className="flex w-[400px] gap-[8px] mb-[20px]">
                    <input
                        type="number"
                        className="outline-none border border-gray-300 rounded px-[12px] py-[8px] w-full sm:w-auto"
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
                    className="bg-slate-50 p-[16px] overflow-y-auto max-h-[350px] space-y-[10px]"
                >
                    {visibleSteps.map((latex, idx) => (
                            <BlockMath key={idx}>{latex}</BlockMath>
                    ))}
                </div>

                {/* 🧮 Final Factor Result */}
                {factors.length > 0 && !animating && (
                    <div className="text-center mt-[16px]">
                        <p className="text-[18px] mb-[4px]" style={{ color: 'white' }}>✅ Prime Factors Found:</p>
                        <BlockMath>{formatFactorProduct(factors)}</BlockMath>
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuadraticSieve;
