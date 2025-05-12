import { useRef, useState } from 'react';
import { BlockMath } from 'react-katex';
import { isPrime } from "../utils/prime.ts";
import { gcd } from "../utils/gcd.ts";

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
                steps.push(`\\color{white}{\\text{Trial division: } ${n} \\div ${d} = ${n / d}}`);
                collected.push(d);
                n /= d;
            }
            d++;
        }
        if (n > 1) {
            steps.push(`\\color{white}{\\text{Remaining prime factor: } ${n}}`);
            collected.push(n);
        }
    };

    const qsPaperStyle = (n: number, steps: string[]): [number | null, number | null] => {
        const B = 40;
        const factorBase = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37];

        steps.push(`\\color{white}{\\textbf{Քայլ 1.} \\text{ Ընտրում ենք ֆակտորային բազա՝ B = ${B} }}`);
        steps.push(`\\color{white}{\\text{Օգտագործվող ֆակտոր բազան են՝ } ${factorBase.join(', ')}}`);

        const xVals = Array.from({ length: 10_000 }, (_, i) => i + 1);
        const relations: { x: number; q: number; exponents: number[] }[] = [];

        for (const x of xVals) {
            const q = x * x - n;
            let temp = q;
            const exp: number[] = [];

            for (const p of factorBase) {
                let count = 0;
                while (temp % p === 0) {
                    temp /= p;
                    count++;
                }
                exp.push(count);
            }

            if (temp === 1) {
                relations.push({ x, q, exponents: exp });
                steps.push(`\\color{white}{Q(${x}) = ${q} \\quad \\text{→ B-հարթ}}`);
            }
        }

        if (relations.length < 2) {
            steps.push(`\\color{red}{\\text{❌ Հանգուցալուծման համար բավարար քանակությամբ B-հարթ արժեքներ չկան}}`);
            return [null, null];
        }

        steps.push(`\\color{white}{\\textbf{Քայլ 2.} \\text{ Կառուցում ենք էքսպոնենտ վեկտորները }}`);
        relations.forEach(r => {
            steps.push(`\\color{white}{Q(${r.x}) = ${r.q} \\Rightarrow (${r.exponents.join(', ')})}`);
        });

        // Step 3: Find a valid pair of relations whose exponent vectors mod 2 cancel out
        steps.push(`\\color{white}{\\textbf{Քայլ 3.} \\text{ Գտնում ենք մոդ 2 վեկտորներ }}`);
        let pair: [typeof relations[0], typeof relations[0]] | null = null;

        for (let i = 0; i < relations.length; i++) {
            for (let j = i + 1; j < relations.length; j++) {
                const sum = relations[i].exponents.map(
                    (e, k) => (e + relations[j].exponents[k]) % 2
                );
                if (sum.every(val => val === 0)) {
                    pair = [relations[i], relations[j]];
                    break;
                }
            }
            if (pair) break;
        }

        if (!pair) {
            steps.push(`\\color{red}{\\text{❌ Չհաջողվեց գտնել մոդ 2 զույգ հարաբերություն}}`);
            return [null, null];
        }

        // Step 4: Calculate the vectors mod2
        const [r1, r2] = pair;
        const sumExp = r1.exponents.map((e, i) => (e + r2.exponents[i]) % 2);
        steps.push(`\\color{white}{(${r1.exponents.join(', ')}) + (${r2.exponents.join(', ')}) \\mod 2 = (${sumExp.join(', ')})}`);

        steps.push(`\\color{white}{\\textbf{Քայլ 4.} \\text{ Հաշվում ենք x և y արժեքները }}`);

        // Step 5: Calculate x and y values
        const x = r1.x * r2.x;
        const ySquared = r1.q * r2.q;
        const sqrtY = Math.sqrt(ySquared);

        if (!Number.isInteger(sqrtY)) {
            steps.push(`\\color{red}{\\text{❌ Q₁ × Q₂ = ${ySquared} չի հանդիսանում կատարյալ քառակուսի}}`);
            return [null, null];
        }

        const y = sqrtY;
        steps.push(`\\color{white}{x = ${r1.x} × ${r2.x} = ${x}}`);
        steps.push(`\\color{white}{y = \\sqrt{${r1.q} × ${r2.q}} = ${y}}`);

        steps.push(`\\color{white}{\\textbf{Քայլ 5.} \\text{ Հաշվում ենք GCD }}`);

        // Step 6: Calculate GCD using pre-computed values
        const d1 = gcd(x - y, n);
        const d2 = gcd(x + y, n);
        steps.push(`\\color{white}{\\gcd(x - y, n) = \\gcd(${x - y}, ${n}) = ${d1}}`);
        steps.push(`\\color{white}{\\gcd(x + y, n) = \\gcd(${x + y}, ${n}) = ${d2}}`);

        if (d1 !== 1 && d1 !== n) return [d1, n / d1];
        if (d2 !== 1 && d2 !== n) return [d2, n / d2];

        steps.push(`\\color{red}{\\text{❌ GCD-ն տրիվիալ է, ֆակտոր չի գտնվել}}`);
        return [null, null];
    };

    const fullFactor = (n: number, steps: string[] = [], collected: number[] = []) => {
        if (isPrime(n)) {
            steps.push(`\\color{white} {\\text{${n} is prime → added to list}}`);
            collected.push(n);
            return;
        }

        if (n < 100) {
            steps.push(`\\color{white} {\\text{Using trial division for small number } ${n}}`);
            trialDivide(n, steps, collected);
            return;
        }

        const [factor, cofactor] = qsPaperStyle(n, steps);

        if (!factor) {
            steps.push(`\\color{red}{\\text{❌ Quadratic Sieve failed, switching to trial division}}`);
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
        <div className="pt-[10px] text-gray-800 font-mono">
            <div className="flex flex-col items-center max-w-2xl mx-auto bg-white shadow-xl rounded-lg">
                <h1 className="text-[28px] font-bold mb-[5px] text-center" style={{color: 'white'}}>
                    Quadratic Sieve
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
                        type="button"
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

export default QuadraticSieve;
