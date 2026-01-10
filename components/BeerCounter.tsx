'use client';

import { useState } from "react";

interface BeerSizeButtonProps {
    size: string;
    liters: number;
    onClick: (liters: number) => void;
}

function BeerSizeButton({ size, liters, onClick }: BeerSizeButtonProps) {
    return (
        <div className="rounded-full shadow-[0px_-2px_3px_rgba(0,0,0,0.25)] active:shadow-[0px_-2px_1px_rgba(0,0,0,0.25)]">
            <button
                className="font-bold size-18 text-[16px] rounded-full shadow-[0px_2px_5px_rgba(0,0,0,0.25)] active:shadow-[0px_2px_1px_rgba(0,0,0,0.25)] active:text-[15px] transition"
                onClick={() => onClick(liters)}
            >
                <span>{size}</span>
            </button>
        </div>
    );
}

export default function BeerCounter() {
    const [totalLiters, setTotalLiters] = useState(0);
    const [history, setHistory] = useState<number[]>([]);

    const addBeers = (liters: number) => {
        setHistory([...history, liters]);
        setTotalLiters(totalLiters + liters);
    };

    const undoLastAction = () => {
        if (history.length > 0) {
            const lastAction = history[history.length - 1];
            setTotalLiters(totalLiters - lastAction);
            setHistory(history.slice(0, -1));
        }
    };

    const formatLiters = (liters: number): string => {
        // Fix floating point precision issues
        const rounded = Math.round(liters * 100) / 100;

        // If it's effectively zero or very close to zero, return "0"
        if (Math.abs(rounded) < 0.01) {
            return "0";
        }

        // If it's a whole number, don't show decimals
        if (rounded % 1 === 0) {
            return rounded.toString();
        }

        // Otherwise, show up to 2 decimals, removing trailing zeros
        return rounded.toFixed(2).replace(/\.?0+$/, '');
    };

    const formatCanas = (canas: number): string => {
        // Fix floating point precision issues
        const rounded = Math.round(canas * 10) / 10;

        // If it's effectively zero or very close to zero, return "0"
        if (Math.abs(rounded) < 0.1) {
            return "0";
        }

        // If it's a whole number, don't show decimals
        if (rounded % 1 === 0) {
            return rounded.toString();
        }

        // Otherwise, show 1 decimal place
        return rounded.toFixed(1);
    };

    const canasCount = totalLiters / 0.33;

    return (
        <div className="h-screen w-screen text-yellow-300 bg-zinc-800 fixed inset-0 overflow-hidden">
            <div className="h-1/3 flex flex-col items-center text-center justify-center">
                <h1 className="font-bold text-6xl">
                    {formatLiters(totalLiters)}L
                </h1>
                <h2 className="font-bold text-xl italic mx-2">
                    {totalLiters === 0
                        ? "¡Sal a beber! Ese hígado no va a engordar solo"
                        : `Llevas ${formatCanas(canasCount)} cañas ¡Sigue así!`
                    }
                </h2>
            </div>

            <div className="h-2/3 flex flex-col gap-4 justify-end p-8">
                <div className="flex flex-row gap-4 justify-center flex-wrap">
                    <BeerSizeButton size="20cl" liters={0.20} onClick={addBeers} />
                    <BeerSizeButton size="25cl" liters={0.25} onClick={addBeers} />
                    <BeerSizeButton size="33cl" liters={0.33} onClick={addBeers} />
                    <BeerSizeButton size="50cl" liters={0.50} onClick={addBeers} />
                    <BeerSizeButton size="1L" liters={1.0} onClick={addBeers} />
                </div>


                <div className="w-full rounded-full shadow-[0px_-2px_3px_rgba(0,0,0,0.25)] active:shadow-[0px_-2px_1px_rgba(0,0,0,0.25)]">
                    <button
                        className="font-bold w-full size-18 text-[16px] rounded-full shadow-[0px_2px_5px_rgba(0,0,0,0.25)] active:shadow-[0px_2px_1px_rgba(0,0,0,0.25)] active:text-[15px] transition"
                        disabled={history.length === 0}
                        onClick={undoLastAction}>
                        <span className="">Me sobró esa última</span>
                    </button>
                </div>

            </div>
        </div>
    );
}