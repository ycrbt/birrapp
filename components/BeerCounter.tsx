'use client';

import { useState, useEffect } from "react";
import { recordBeer, removeBeer, getBeerTotal } from "@/lib/persistence/beer-count"

interface BeerSizeButtonProps {
    size: string;
    liters: number;
    onClick: (liters: number) => void;
    disabled?: boolean;
}

function BeerSizeButton({ size, liters, onClick, disabled = false }: BeerSizeButtonProps) {
    return (
        <div className={`rounded-full shadow-[0px_-2px_3px_rgba(0,0,0,0.25)] ${disabled ? 'opacity-50' : 'active:shadow-[0px_-2px_1px_rgba(0,0,0,0.25)]'}`}>
            <button
                className={`font-bold size-18 text-[16px] rounded-full shadow-[0px_2px_5px_rgba(0,0,0,0.25)] transition ${disabled
                    ? 'cursor-not-allowed'
                    : 'active:shadow-[0px_2px_1px_rgba(0,0,0,0.25)] active:text-[15px]'
                    }`}
                onClick={() => !disabled && onClick(liters)}
                disabled={disabled}
            >
                <span>{size}</span>
            </button>
        </div>
    );
}

export default function BeerCounter() {
    const [totalLiters, setTotalLiters] = useState(0);
    const [history, setHistory] = useState<{ liters: number; futureBeerId: Promise<number> }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch total liters when component loads
    useEffect(() => {
        const fetchTotalLiters = async () => {
            try {
                const total = await getBeerTotal();
                console.log("fetch");
                // Ensure it's a number to prevent NaN issues
                setTotalLiters(Number(total) || 0);
            } catch (error) {
                console.error('Failed to fetch beer total:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTotalLiters();
    }, []);

    const addBeers = async (liters: number) => {
        setTotalLiters(totalLiters + liters);
        const futureBeerId = recordBeer(liters);
        setHistory([...history, { liters, futureBeerId }]);
    };

    const undoLastAction = async () => {
        if (history.length > 0) {
            const lastAction = history[history.length - 1];
            setTotalLiters(totalLiters - lastAction.liters);
            setHistory(history.slice(0, -1));
            removeBeer(await lastAction.futureBeerId);
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
        <div className="h-full text-yellow-300 bg-zinc-900 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col items-center text-center justify-center gap-2 px-4">
                {isLoading ? (
                    <>
                        <div className="font-bold text-6xl bg-yellow-300/20 rounded-lg animate-[pulse_0.8s_ease-in-out_infinite] h-20 w-32"></div>
                        <div className="font-bold text-xl bg-yellow-300/20 rounded-lg animate-[pulse_0.8s_ease-in-out_infinite] h-6 w-80 mx-2"></div>
                    </>
                ) : (
                    <>
                        <h1 className="font-bold text-6xl">
                            {formatLiters(totalLiters)}L
                        </h1>
                        <h2 className="font-bold text-xl italic mx-2">
                            {totalLiters === 0
                                ? "¡Sal a beber! Ese hígado no va a engordar solo"
                                : `Llevas ${formatCanas(canasCount)} cañas ¡Sigue así!`
                            }
                        </h2>
                    </>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-4 justify-end p-6 pb-8">

                <div className="flex flex-row gap-4 justify-center flex-wrap">
                    <BeerSizeButton size="20cl" liters={0.20} onClick={addBeers} disabled={isLoading} />
                    <BeerSizeButton size="25cl" liters={0.25} onClick={addBeers} disabled={isLoading} />
                    <BeerSizeButton size="33cl" liters={0.33} onClick={addBeers} disabled={isLoading} />
                    <BeerSizeButton size="50cl" liters={0.50} onClick={addBeers} disabled={isLoading} />
                    <BeerSizeButton size="1L" liters={1.0} onClick={addBeers} disabled={isLoading} />
                </div>

                <div className={`rounded-full shadow-[0px_-2px_3px_rgba(0,0,0,0.25)] ${isLoading ? 'opacity-50' : 'active:shadow-[0px_-2px_1px_rgba(0,0,0,0.25)]'}`}>
                    <button
                        className={`font-bold w-full size-18 text-[16px] rounded-full shadow-[0px_2px_5px_rgba(0,0,0,0.25)] transition ${isLoading || history.length === 0
                            ? 'cursor-not-allowed'
                            : 'active:shadow-[0px_2px_1px_rgba(0,0,0,0.25)] active:text-[15px]'
                            }`}
                        disabled={history.length === 0 || isLoading}
                        onClick={undoLastAction}>
                        <span className="">Me sobró esa última</span>
                    </button>
                </div>

            </div>
        </div>
    );
}