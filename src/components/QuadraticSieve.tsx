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

        steps.push(`\\color{white}{\\textbf{Քայլ 1.} \\text{ Ընտրում ենք B-smooth՝ B = ${B} }}`);
        steps.push(`\\color{white}{\\text{Օգտագործվող պարզ թվերն են՝ } ${factorBase.join(', ')}}`);

        const xVals = Array.from({ length: 10_000 }, (_, i) => i + 1);
        const relations: { x: number; q: number; exponents: number[] }[] = [];

        const mod2 = (vec: number[]) => vec.map(x => x % 2);

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
                const newRelation = { x, q, exponents: exp };
                relations.push(newRelation);
                steps.push(`\\color{white}{Q(${x}) = ${q} \\quad \\text{→ B-հարթ}}`);

                for (let i = 0; i < relations.length - 1; i++) {
                    const candidate = relations[i];
                    const combinedMod2 = mod2(candidate.exponents.map((e, k) => e + exp[k]));

                    if (combinedMod2.every(val => val === 0)) {
                        const r1 = candidate;
                        const r2 = newRelation;

                        // Step 2: Show exponent vectors and mod 2 result
                        steps.push(`\\color{white}{\\textbf{Քայլ 2.} \\text{ Գտանք համապատասխան վեկտորներ }}`);
                        steps.push(`\\color{white}{(${r1.exponents.join(', ')}) + (${r2.exponents.join(', ')}) \\mod 2 = (${combinedMod2.join(', ')})}`);

                        // Step 3: Compute x and y
                        steps.push(`\\color{white}{\\textbf{Քայլ 3.} \\text{ Հաշվում ենք x և y արժեքները }}`);
                        const xVal = r1.x * r2.x;
                        const ySquared = r1.q * r2.q;
                        const sqrtY = Math.sqrt(ySquared);

                        if (!Number.isInteger(sqrtY)) {
                            steps.push(`\\color{red}{\\text{❌ Q₁ × Q₂ = ${ySquared} չի հանդիսանում կատարյալ քառակուսի}}`);
                            return [null, null];
                        }

                        const y = sqrtY;
                        steps.push(`\\color{white}{x = ${r1.x} × ${r2.x} = ${xVal}}`);
                        steps.push(`\\color{white}{y = \\sqrt{${r1.q} × ${r2.q}} = ${y}}`);

                        // Step 4: Compute GCDs
                        steps.push(`\\color{white}{\\textbf{Քայլ 4.} \\text{ Հաշվում ենք ամենամեծ ընդհանուր բաժանարարը }}`);
                        const d1 = gcd(xVal - y, n);
                        const d2 = gcd(xVal + y, n);
                        steps.push(`\\color{white}{\\gcd(x - y, n) = \\gcd(${xVal - y}, ${n}) = ${d1}}`);
                        steps.push(`\\color{white}{\\gcd(x + y, n) = \\gcd(${xVal + y}, ${n}) = ${d2}}`);

                        if (d1 !== 1 && d1 !== n) {
                            steps.push(`\\color{white}{\\text{Գտանք բաժանարար: } ${d1}}`);
                            return [d1, n / d1];
                        }
                        if (d2 !== 1 && d2 !== n) {
                            steps.push(`\\color{white}{\\text{Գտանք բաժանարար: } ${d2}}`);
                            return [d2, n / d2];
                        }

                        steps.push(`\\color{red}{\\text{❌ GCD-ն տրիվիալ է, ֆակտոր չի գտնվել}}`);
                        return [null, null];
                    }
                }
            }
        }

        // If no match found after trying all x values
        steps.push(`\\color{red}{\\text{❌ Չհաջողվեց գտնել մոդ 2 զույգ հարաբերություն}}`);
        return [null, null];
    };

    const fullFactor = (n: number, steps: string[] = [], collected: number[] = []) => {
        if (isPrime(n)) {
            steps.push(`\\color{white} {\\text{${n} պարզ թիվ է → ավելացնում ենք ցուցակին}}`);
            collected.push(n);
            return;
        }

        if (n < 100) {
            steps.push(`\\color{white} {\\text{Using trial division for small number } ${n}}`);
            trialDivide(n, steps, collected);
            return;
        }

        steps.push(`\\color{white}{\\text{ Փորձում ենք գտնել ${n}-ի բաժանարարները օգտագործելով Quadratic Sieve}}`);
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
                <h1 className="text-[28px] font-bold mb-[15px] text-center" style={{color: 'white'}}>
                    Quadratic Sieve
                </h1>

                <form className="flex w-[400px] h-[35px] gap-[8px] mb-[10px]">
                    <input
                        type="number"
                        className="outline-none border border-gray-300 rounded px-[12px] py-[8px] text-[20px] w-full sm:w-auto"
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

export default QuadraticSieve;
