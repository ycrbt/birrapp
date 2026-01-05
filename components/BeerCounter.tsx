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
        // If it's a whole number, don't show decimals
        if (liters % 1 === 0) {
            return liters.toString();
        }

        // Otherwise, show up to 2 decimals, removing trailing zeros
        return liters.toFixed(2);
    };

    const formatCanas = (canas: number): string => {
        // If it's a whole number, don't show decimals
        if (canas % 1 === 0) {
            return canas.toString();
        }

        // Otherwise, show 1 decimal place
        return canas.toFixed(1);
    };

    const canasCount = totalLiters / 0.33;

    return (
        <div className="h-screen w-screen text-yellow-300 bg-zinc-800">
            <div className="h-1/3 flex flex-col items-center text-center justify-center">
                <h1 className="font-bold text-6xl">
                    {formatLiters(totalLiters)}L
                </h1>
                <h2 className="font-bold text-xl italic">
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
                        className="w-full size-18 text-[16px] rounded-full shadow-[0px_2px_5px_rgba(0,0,0,0.25)] active:shadow-[0px_2px_1px_rgba(0,0,0,0.25)] active:text-[15px] transition"
                        disabled={history.length === 0}
                        onClick={undoLastAction}>
                        <span className="">Me sobró esa última</span>
                    </button>
                </div>

            </div>

            <style jsx>{`
        .beer-counter {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #2c1810;
        }

        .center-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .counter-text {
          font-size: 72px;
          font-weight: bold;
          color: #FFD700;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .canas-text {
          font-size: 24px;
          font-weight: bold;
          color: #FFD700;
          margin-top: 10px;
          text-align: center;
          opacity: 0.9;
        }

        .bottom-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 40px;
        }

        .bottom-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 30px;
          gap: 25px;
        }

        .button-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 45px;
          background-color: #2c1810;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: -3px -3px 8px rgba(0, 0, 0, 0.8);
        }

        .circle-button {
          width: 80px;
          height: 80px;
          border-radius: 40px;
          background-color: #2c1810;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 2px 2px 4px rgba(64, 64, 64, 0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .circle-button:hover {
          transform: scale(1.05);
        }

        .circle-button:active {
          transform: scale(0.95);
        }

        .volume-text {
          color: #FFD700;
          font-size: 16px;
          font-weight: bold;
        }

        .undo-button-wrapper {
          width: 320px;
          background-color: #2c1810;
          border-radius: 35px;
          padding: 5px;
          box-shadow: -2px -2px 6px rgba(0, 0, 0, 0.8);
        }

        .undo-button {
          background-color: #2c1810;
          padding: 15px;
          border-radius: 30px;
          width: 100%;
          border: none;
          box-shadow: 2px 2px 4px rgba(64, 64, 64, 0.3);
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .undo-button:hover:not(.disabled) {
          transform: scale(1.02);
        }

        .undo-button:active:not(.disabled) {
          transform: scale(0.98);
        }

        .undo-button.disabled {
          box-shadow: 2px 2px 4px rgba(64, 64, 64, 0.1);
          cursor: not-allowed;
        }

        .undo-button-text {
          color: #FFD700;
          font-size: 16px;
          font-weight: 700;
          text-align: center;
        }

        .undo-button-text.disabled {
          color: rgba(255, 215, 0, 0.3);
        }

        @media (max-width: 768px) {
          .counter-text {
            font-size: 56px;
          }
          
          .canas-text {
            font-size: 20px;
            padding: 0 20px;
          }
          
          .bottom-buttons {
            gap: 15px;
          }
          
          .button-wrapper {
            width: 70px;
            height: 70px;
            border-radius: 35px;
          }
          
          .circle-button {
            width: 60px;
            height: 60px;
            border-radius: 30px;
          }
          
          .volume-text {
            font-size: 14px;
          }
          
          .undo-button-wrapper {
            width: 280px;
          }
        }
      `}</style>
        </div>
    );
}