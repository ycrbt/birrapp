'use client';

import { useState } from 'react';
import BeerCounter from './BeerCounter';
import BeerLeaderboard from './BeerLeaderboard';
import BeerStats from './BeerStats';
import { BeerProvider } from '@/lib/context/BeerContext';

type ActivePage = 'counter' | 'leaderboard' | 'stats';

export default function AuthenticatedHome() {
    const [activePage, setActivePage] = useState<ActivePage>('counter');

    const renderActivePage = () => {
        switch (activePage) {
            case 'counter':
                return <BeerCounter />;
            case 'leaderboard':
                return <BeerLeaderboard />;
            case 'stats':
                return <BeerStats />;
            default:
                return <BeerCounter />;
        }
    };

    return (  
        <BeerProvider>
            <div className="h-full flex flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                    {renderActivePage()}
                </div>

                {/* Navigation Bar */}
                <nav className="bg-zinc-900 border-t border-zinc-700 px-4 pt-[8px] pb-[calc(8px+env(safe-area-inset-bottom))] flex-shrink-0">
                    <div className="flex">

                        <button
                            onClick={() => setActivePage('leaderboard')}
                            className={`flex-1 flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${activePage === 'leaderboard'
                                    ? 'text-yellow-300 bg-zinc-800'
                                    : 'text-zinc-400 hover:text-yellow-300'
                                }`}
                        >
                            <span className="text-xl">🏆</span>
                            <span className="text-xs mt-1">Leaderboard</span>
                        </button>

                        <button
                            onClick={() => setActivePage('counter')}
                            className={`flex-1 flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${activePage === 'counter'
                                    ? 'text-yellow-300 bg-zinc-800'
                                    : 'text-zinc-400 hover:text-yellow-300'
                                }`}
                        >
                            <span className="text-xl">🍺</span>
                            <span className="text-xs mt-1">Counter</span>
                        </button>

                        <button
                            onClick={() => setActivePage('stats')}
                            className={`flex-1 flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${activePage === 'stats'
                                    ? 'text-yellow-300 bg-zinc-800'
                                    : 'text-zinc-400 hover:text-yellow-300'
                                }`}
                        >
                            <span className="text-xl">📊</span>
                            <span className="text-xs mt-1">Stats</span>
                        </button>
                    </div>
                </nav>
            </div>
        </BeerProvider>
    );
}