'use client';

import { useEffect, useState } from 'react';
import { getBeerRankings } from '@/lib/persistence/beer-count';

interface RankingData {
    name: string;
    quantity: number;
}

export default function BeerLeaderboard() {
    const [rankings, setRankings] = useState<RankingData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                setLoading(true);
                const data = await getBeerRankings();
                setRankings(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load rankings');
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    if (loading) {
        return (
            <div className="h-full text-yellow-300 bg-zinc-900 p-6">
                <div className="bg-yellow-300/20 rounded-lg animate-[pulse_0.8s_ease-in-out_infinite] h-96 w-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full text-yellow-300 bg-zinc-900 flex items-center justify-center">
                <div className="text-xl text-red-400">Error cargando borrachos</div>
            </div>
        );
    }

    return (
        <div className="h-full text-yellow-300 bg-zinc-900 p-4 sm:p-6 lg:p-10">
            {rankings.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-xl text-gray-400">¡Nadie ha bebido nada!</p>
                </div>
            ) : (
                <div className="w-full max-w-full mx-auto">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max border-collapse">
                            <thead>
                                <tr className="border-b-2 border-yellow-400">
                                    <th className="py-3 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">Posición</th>
                                    <th className="py-3 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">Nombre</th>
                                    <th className="py-3 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">Litros</th>
                                    <th className="py-3 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">Cervezas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((user, index) => (
                                    <tr
                                        key={user.name}
                                        className={`border-b border-gray-600 hover:bg-zinc-800 transition-colors ${index === 0 ? 'text-yellow-400' :
                                                index === 1 ? 'text-gray-300' :
                                                    index === 2 ? 'text-orange-400' :
                                                        'text-gray-400'
                                            }`}
                                    >
                                        <td className="py-4 px-3 sm:px-6 text-sm sm:text-lg font-semibold text-center whitespace-nowrap">
                                            {index === 0 ? '🥇' :
                                                index === 1 ? '🥈' :
                                                    index === 2 ? '🥉' :
                                                        `#${index + 1}`}
                                        </td>
                                        <td className="py-4 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">{user.name}</td>
                                        <td className="py-4 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">
                                            {user.quantity}L
                                        </td>
                                        <td className="py-4 px-3 sm:px-6 text-sm sm:text-lg font-bold text-center whitespace-nowrap">
                                            {Math.round(user.quantity / 0.33)} 🍺
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}