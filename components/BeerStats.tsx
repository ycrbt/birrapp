'use client';

import { useState, useEffect, useRef } from 'react';
import { useBeer } from '@/lib/context/BeerContext';

export default function BeerStats() {
    const [activeCard, setActiveCard] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { totalLiters, isLoading } = useBeer();

    // Calculate beer weight: 1 liter of beer ≈ 1.03 kg (beer is slightly denser than water)
    const totalBeerWeight = totalLiters * 1.03;

    const getBeerWeightComparison = (weight: number) => {
        const comparisons = [
            {
                threshold: 2,
                item: "chihuahua",
                weight: 2,
                emoji: "🐕",
                mockingPhrase: "¡Solo has bebido el equivalente a {count} chihuahuas! ¿Eres abstemio?"
            },
            {
                threshold: 4,
                item: "bebé",
                weight: 3.5,
                emoji: "👶",
                mockingPhrase: "Has bebido {count} bebés de cerveza. ¡Qué tierno!"
            },
            {
                threshold: 8,
                item: "gato doméstico",
                weight: 4.5,
                emoji: "🐱",
                mockingPhrase: "Has bebido {count} gatos en cerveza. ¡Miau!"
            },
            {
                threshold: 15,
                item: "bola de bolos",
                weight: 7,
                emoji: "🎳",
                mockingPhrase: "Has bebido {count} bolas de bolos. ¡Ya ruedas!"
            },
            {
                threshold: 25,
                item: "microondas",
                weight: 15,
                emoji: "📱",
                mockingPhrase: "Has bebido {count} microondas de cerveza. ¡Beep beep!"
            },
            {
                threshold: 40,
                item: "golden retriever",
                weight: 30,
                emoji: "🐕‍🦺",
                mockingPhrase: "Has bebido {count} golden retrievers. ¡Buen perro!"
            },
            {
                threshold: 60,
                item: "maleta grande",
                weight: 25,
                emoji: "🧳",
                mockingPhrase: "Has bebido {count} maletas de alcohol. ¡Buen viaje!"
            },
            {
                threshold: 80,
                item: "canguro adulto",
                weight: 70,
                emoji: "🦘",
                mockingPhrase: "Has bebido {count} canguros borrachos. ¡Hop hop!"
            },
            {
                threshold: 120,
                item: "lavadora",
                weight: 80,
                emoji: "🌀",
                mockingPhrase: "Has bebido {count} lavadoras de cerveza. ¡Das vueltas!"
            },
            {
                threshold: 200,
                item: "elefante bebé",
                weight: 150,
                emoji: "🐘",
                mockingPhrase: "Has bebido {count} elefantes bebés. Deberías ir al psicólogo"
            }
        ];

        const comparison = comparisons.find(c => weight <= c.threshold) || comparisons[comparisons.length - 1];
        const count = Math.round(weight / comparison.weight * 10) / 10;

        return {
            item: comparison.item,
            count: count,
            emoji: comparison.emoji,
            weight: comparison.weight,
            mockingPhrase: comparison.mockingPhrase.replace('{count}', count.toString())
        };
    };

    const getBeerHeightComparison = (liters: number) => {
        // Calculate number of 0.33L bottles
        const bottleCount = Math.round(liters / 0.33);

        // Standard beer bottle height: ~24cm (240mm)
        const bottleHeight = 0.24; // meters
        const totalHeight = bottleCount * bottleHeight;

        const comparisons = [
            { threshold: 0.5, item: "lata de refresco", height: 0.12, emoji: "🥤" },
            { threshold: 1, item: "botella de agua", height: 0.25, emoji: "💧" },
            { threshold: 2, item: "persona promedio", height: 1.7, emoji: "🧍" },
            { threshold: 5, item: "jirafa", height: 5.5, emoji: "🦒" },
            { threshold: 10, item: "casa de dos pisos", height: 7, emoji: "🏠" },
            { threshold: 30, item: "árbol grande", height: 20, emoji: "🌳" },
            { threshold: 50, item: "edificio de 15 pisos", height: 45, emoji: "🏢" },
            { threshold: 100, item: "Estatua de la Libertad", height: 93, emoji: "🗽" },
            { threshold: 200, item: "Torre Eiffel", height: 330, emoji: "🗼" },
            { threshold: 500, item: "Empire State Building", height: 443, emoji: "🏙️" }
        ];

        const comparison = comparisons.find(c => totalHeight <= c.threshold) || comparisons[comparisons.length - 1];
        const count = Math.round(totalHeight / comparison.height * 10) / 10;

        // Generate mocking phrase based on height
        let mockingPhrase = "";
        if (totalHeight < 1) {
            mockingPhrase = `¡Solo ${totalHeight.toFixed(1)}m de botellas! ¿Ni para llegar al metro?`;
        } else if (totalHeight < 5) {
            mockingPhrase = `${totalHeight.toFixed(1)}m de botellas. ¡Ya superas a una persona!`;
        } else if (totalHeight < 20) {
            mockingPhrase = `${totalHeight.toFixed(1)}m de botellas. ¡Podrías escalar una casa!`;
        } else if (totalHeight < 100) {
            mockingPhrase = `${totalHeight.toFixed(1)}m de botellas. ¡Eres un rascacielos andante!`;
        } else {
            mockingPhrase = `${totalHeight.toFixed(1)}m de botellas. ¡Deberías aparecer en Google Maps!`;
        }

        return {
            bottleCount,
            totalHeight,
            comparison: comparison.item,
            comparisonCount: count,
            comparisonEmoji: comparison.emoji,
            mockingPhrase
        };
    };

    const heightComparison = totalLiters > 0 ? getBeerHeightComparison(totalLiters) : null;
    const weightComparison = totalLiters > 0 ? getBeerWeightComparison(totalBeerWeight) : null;

    const cards = [
        {
            id: 1,
            title: "🍺 Peso de Cervezas",
            content: isLoading ? (
                <div className="space-y-6">
                    <div className="text-2xl text-yellow-400">
                        Cargando datos...
                    </div>
                    <div className="animate-spin text-4xl">🍺</div>
                </div>
            ) : totalLiters === 0 ? (
                <div className="space-y-6">
                    <div className="text-2xl text-yellow-400">
                        ¡Aún no has bebido nada!
                    </div>
                    <div className="text-6xl mb-4">😴</div>
                    <div className="text-lg opacity-80">
                        Ve al contador y empieza a registrar tus cervezas
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="text-4xl font-bold text-yellow-400">
                        {totalBeerWeight.toFixed(1)} kg
                    </div>
                    <div className="text-lg opacity-80">
                        ({totalLiters.toFixed(1)} litros de cerveza)
                    </div>
                    <div className="text-xl">
                        Equivale a
                    </div>
                    <div className="text-6xl mb-4">
                        {weightComparison?.emoji}
                    </div>
                    <div className="text-2xl font-semibold">
                        {weightComparison?.count} {weightComparison?.item}
                        {weightComparison && weightComparison.count !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm opacity-70 mt-4">
                        (Promedio {weightComparison?.item.toLowerCase()}: {weightComparison?.weight}kg)
                    </div>
                    <div className="text-base italic text-yellow-200 mt-6 px-4 py-3 bg-zinc-800/50 rounded-lg border-l-4 border-yellow-400">
                        "{weightComparison?.mockingPhrase}"
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "📏 Altura de Botellas",
            content: isLoading ? (
                <div className="space-y-6">
                    <div className="text-2xl text-yellow-400">
                        Cargando datos...
                    </div>
                    <div className="animate-spin text-4xl">🍺</div>
                </div>
            ) : totalLiters === 0 ? (
                <div className="space-y-6">
                    <div className="text-2xl text-yellow-400">
                        ¡Aún no has apilado botellas!
                    </div>
                    <div className="text-6xl mb-4">📦</div>
                    <div className="text-lg opacity-80">
                        Empieza a beber para construir tu torre
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="text-4xl font-bold text-yellow-400">
                        {heightComparison?.totalHeight.toFixed(1)} m
                    </div>
                    <div className="text-lg opacity-80">
                        ({heightComparison?.bottleCount} botellas de 0.33L apiladas)
                    </div>
                    <div className="text-xl">
                        Equivale a
                    </div>
                    <div className="text-6xl mb-4">
                        {heightComparison?.comparisonEmoji}
                    </div>
                    <div className="text-2xl font-semibold">
                        {heightComparison?.comparisonCount} {heightComparison?.comparison}
                        {heightComparison && heightComparison.comparisonCount !== 1 ? 's' : ''}
                    </div>
                    <div className="text-base italic text-yellow-200 mt-6 px-4 py-3 bg-zinc-800/50 rounded-lg border-l-4 border-yellow-400">
                        "{heightComparison?.mockingPhrase}"
                    </div>
                </div>
            )
        }
    ];

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const cardHeight = container.clientHeight;
            const currentCard = Math.round(scrollTop / cardHeight);
            setActiveCard(currentCard);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToCard = (index: number) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const cardHeight = container.clientHeight;
        container.scrollTo({
            top: index * cardHeight,
            behavior: 'smooth'
        });
    };

    return (
        <div className="h-full bg-zinc-900 relative flex">
            {/* Main scrolling container */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto snap-y snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {cards.map((card) => (
                    <div
                        key={card.id}
                        className="h-full snap-start flex items-center justify-center px-4 py-16"
                    >
                        <div className="bg-zinc-900 rounded-2xl shadow-2xl shadow-black/50 px-8 py-16 w-full h-full mx-4 border border-zinc-700/50">
                            <div className="text-center text-yellow-300 h-full flex flex-col justify-center">
                                <h2 className="text-3xl font-bold mb-6">{card.title}</h2>
                                {typeof card.content === 'string' ? (
                                    <p className="text-lg opacity-80">{card.content}</p>
                                ) : (
                                    <div>{card.content}</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3 z-10">
                {cards.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToCard(index)}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${activeCard === index
                            ? 'bg-yellow-300 scale-125'
                            : 'bg-zinc-600 hover:bg-zinc-500'
                            }`}
                        aria-label={`Go to card ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}