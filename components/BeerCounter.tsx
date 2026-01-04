'use client';

import { useState } from "react";

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
    // Round to 2 decimal places to avoid floating point issues
    const rounded = Math.round(liters * 100) / 100;
    
    // If it's a whole number, don't show decimals
    if (rounded % 1 === 0) {
      return rounded.toString();
    }
    
    // Otherwise, show up to 2 decimals, removing trailing zeros
    return rounded.toFixed(2).replace(/\.?0+$/, '');
  };

  const formatCanas = (canas: number): string => {
    // Round to 1 decimal place
    const rounded = Math.round(canas * 10) / 10;
    
    // If it's a whole number, don't show decimals
    if (rounded % 1 === 0) {
      return rounded.toString();
    }
    
    // Otherwise, show 1 decimal place
    return rounded.toFixed(1);
  };

  const canasCount = totalLiters / 0.33;

  return (
    <div className="beer-counter">
      <div className="center-content">
        <div className="counter-text">{formatLiters(totalLiters)}L</div>
        <div className="canas-text">
          {totalLiters === 0 
            ? "¡Sal a beber! Ese hígado no va a engordar solo" 
            : `Llevas ${formatCanas(canasCount)} cañas ¡Sigue así!`
          }
        </div>
      </div>

      <div className="bottom-section">
        <div className="bottom-buttons">
          <div className="button-wrapper">
            <button className="circle-button" onClick={() => addBeers(0.33)}>
              <span className="volume-text">33cl</span>
            </button>
          </div>
          <div className="button-wrapper">
            <button className="circle-button" onClick={() => addBeers(0.5)}>
              <span className="volume-text">0,5L</span>
            </button>
          </div>
          <div className="button-wrapper">
            <button className="circle-button" onClick={() => addBeers(1)}>
              <span className="volume-text">1L</span>
            </button>
          </div>
        </div>

        <div className="undo-button-wrapper">
          <button
            className={`undo-button ${history.length === 0 ? 'disabled' : ''}`}
            onClick={undoLastAction}
            disabled={history.length === 0}
          >
            <span className={`undo-button-text ${history.length === 0 ? 'disabled' : ''}`}>
              Me sobró esa última
            </span>
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