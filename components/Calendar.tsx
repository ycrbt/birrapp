'use client';

import { useState, useEffect } from 'react';
import { getBeersByMonth, getDetailedBeersByMonth, recordBeerWithDateTime, removeBeer, updateBeer } from '@/lib/persistence/beer-count';
import { useBeer } from '@/lib/context/BeerContext';

interface CalendarProps {
    className?: string;
}

interface BeerData {
    [key: string]: number; // date string -> quantity
}

interface DetailedBeer {
    id: number;
    quantity: number;
    date: string;
    time: string;
}

export default function Calendar({ className = '' }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [beerData, setBeerData] = useState<BeerData>({});
    const [detailedBeers, setDetailedBeers] = useState<DetailedBeer[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingBeer, setEditingBeer] = useState<DetailedBeer | null>(null);
    const [deletingBeer, setDeletingBeer] = useState<DetailedBeer | null>(null);
    const [addingBeer, setAddingBeer] = useState(false);
    const [newBeerQuantity, setNewBeerQuantity] = useState('');
    const [newBeerTime, setNewBeerTime] = useState('');
    const [showSizeDropdown, setShowSizeDropdown] = useState(false);
    const [showEditSizeDropdown, setShowEditSizeDropdown] = useState(false);
    const { updateTotal, totalLiters } = useBeer();

    // Set default selected day to today if it's in the current month
    useEffect(() => {
        const today = new Date();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                              currentDate.getFullYear() === today.getFullYear();
        if (isCurrentMonth) {
            setSelectedDay(today.getDate());
        } else {
            setSelectedDay(null);
        }
    }, [currentDate]);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        // Convert Sunday (0) to be last day (6), and shift others down by 1
        return firstDay === 0 ? 6 : firstDay - 1;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    // Fetch beer data for the current month
    const fetchBeerData = async () => {
        setLoading(true);
        try {
            const [monthData, detailedData] = await Promise.all([
                getBeersByMonth(currentDate.getFullYear(), currentDate.getMonth()),
                getDetailedBeersByMonth(currentDate.getFullYear(), currentDate.getMonth())
            ]);
            
            const beerMap: BeerData = {};
            monthData.forEach(item => {
                // The date should already be in YYYY-MM-DD format from the database
                beerMap[item.date] = item.quantity;
            });
            setBeerData(beerMap);
            setDetailedBeers(detailedData);
        } catch (error) {
            console.error('Error fetching beer data:', error);
            setBeerData({});
            setDetailedBeers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBeerData();
    }, [currentDate]);

    // Handle day click
    const handleDayClick = (day: number) => {
        setSelectedDay(day);
    };

    // Handle adding a new beer
    const handleAddBeer = () => {
        const now = new Date();
        const timeString = now.toTimeString().slice(0, 5); // HH:MM format
        setNewBeerTime(timeString);
        setNewBeerQuantity('0.33'); // Default to 33cl
        setShowAddModal(true);
    };

    // Beer size options
    const beerSizes = [
        { label: '20cl', value: '0.20' },
        { label: '25cl', value: '0.25' },
        { label: '33cl', value: '0.33' },
        { label: '50cl', value: '0.50' },
        { label: '1L', value: '1.0' }
    ];

    const handleSaveBeer = async () => {
        if (!selectedDay || !newBeerQuantity || !newBeerTime) return;

        setAddingBeer(true);
        try {
            const quantity = parseFloat(newBeerQuantity);
            if (quantity <= 0) {
                alert('La cantidad debe ser mayor que 0');
                return;
            }

            // Create datetime string for the selected day and time
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const dateTimeStr = `${dateStr} ${newBeerTime}:00`;

            await recordBeerWithDateTime(quantity, dateTimeStr);
            
            // Update total in context
            updateTotal(totalLiters + quantity);

            // Refresh data
            await fetchBeerData();
            
            // Close modal
            setShowAddModal(false);
            setNewBeerQuantity('');
            setNewBeerTime('');
        } catch (error) {
            console.error('Error adding beer:', error);
            alert('Error al añadir la cerveza');
        } finally {
            setAddingBeer(false);
        }
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setShowSizeDropdown(false);
        setNewBeerQuantity('');
        setNewBeerTime('');
    };

    const handleEditBeer = (beer: DetailedBeer) => {
        setEditingBeer(beer);
        setNewBeerQuantity(beer.quantity.toString());
        setNewBeerTime(beer.time);
        setShowEditModal(true);
    };

    const handleUpdateBeer = async () => {
        if (!editingBeer || !newBeerQuantity || !newBeerTime) return;

        setAddingBeer(true);
        try {
            const quantity = parseFloat(newBeerQuantity);
            if (quantity <= 0) {
                alert('La cantidad debe ser mayor que 0');
                return;
            }

            // Create datetime string for the selected day and time
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            const dateTimeStr = `${dateStr} ${newBeerTime}:00`;

            const oldQuantity = editingBeer.quantity;
            await updateBeer(editingBeer.id, quantity, dateTimeStr);
            
            // Update total in context (difference between new and old quantity)
            const quantityDifference = quantity - oldQuantity;
            updateTotal(totalLiters + quantityDifference);

            // Refresh data
            await fetchBeerData();
            
            // Close modal
            setShowEditModal(false);
            setEditingBeer(null);
            setNewBeerQuantity('');
            setNewBeerTime('');
        } catch (error) {
            console.error('Error updating beer:', error);
            alert('Error al actualizar la cerveza');
        } finally {
            setAddingBeer(false);
        }
    };

    const handleRemoveBeer = async (beer: DetailedBeer) => {
        setDeletingBeer(beer);
        setShowDeleteModal(true);
    };

    const confirmRemoveBeer = async () => {
        if (!deletingBeer) return;

        try {
            await removeBeer(deletingBeer.id);
            
            // Update total in context
            updateTotal(totalLiters - deletingBeer.quantity);

            // Refresh data
            await fetchBeerData();
            
            // Close modal
            setShowDeleteModal(false);
            setDeletingBeer(null);
        } catch (error) {
            console.error('Error removing beer:', error);
            alert('Error al eliminar la cerveza');
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingBeer(null);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setShowEditSizeDropdown(false);
        setEditingBeer(null);
        setNewBeerQuantity('');
        setNewBeerTime('');
    };
    const getSelectedDayBeers = () => {
        if (!selectedDay) return [];
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        return detailedBeers.filter(beer => beer.date === dateStr);
    };
    const getBeerIntensity = (quantity: number) => {
        if (quantity === 0) return '';
        if (quantity <= 0.5) return 'bg-yellow-100';
        if (quantity <= 1) return 'bg-yellow-200';
        if (quantity <= 2) return 'bg-yellow-300';
        if (quantity <= 3) return 'bg-yellow-400';
        return 'bg-yellow-500';
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const today = new Date();
        const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-10 flex items-center justify-center">
                </div>
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = isCurrentMonth && day === today.getDate();
            
            // Format date to match database format (YYYY-MM-DD)
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const beerQuantity = beerData[dateStr] || 0;
            const beerIntensity = getBeerIntensity(beerQuantity);

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-10 flex items-center justify-center cursor-pointer transition-colors relative ${
                        beerQuantity > 0 ? 'text-zinc-900 font-semibold hover:opacity-80' : 'text-yellow-300 hover:bg-zinc-800'
                    }`}
                >
                    {/* Beer quantity background circle */}
                    {beerQuantity > 0 && (
                        <div className={`absolute w-8 h-8 rounded-full ${beerIntensity}`} />
                    )}
                    
                    {/* Today's date indicator - circular border */}
                    {isToday && (
                        <div className="absolute w-8 h-8 rounded-full border-2 border-yellow-400" />
                    )}
                    
                    {/* Day number */}
                    <span className={`relative z-10 ${beerQuantity > 0 ? 'text-zinc-900 font-semibold' : isToday ? 'font-bold' : ''}`}>
                        {day}
                    </span>
                </div>
            );
        }

        return days;
    };

    return (
        <div className={`bg-zinc-900 text-yellow-300 ${className}`}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    aria-label="Mes anterior"
                >
                    <span className="text-xl">←</span>
                </button>

                <h2 className="text-xl font-bold">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    aria-label="Mes siguiente"
                >
                    <span className="text-xl">→</span>
                </button>
            </div>

            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                    <div
                        key={day}
                        className="h-10 flex items-center justify-center text-sm font-semibold text-yellow-400"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {loading ? (
                    // Loading skeleton
                    Array.from({ length: 42 }, (_, i) => (
                        <div key={i} className="h-10 flex items-center justify-center">
                            <div className="w-4 h-4 bg-yellow-300/20 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></div>
                        </div>
                    ))
                ) : (
                    renderCalendarDays()
                )}
            </div>

            {/* Selected Day Beer List */}
            {selectedDay && (
                <div className="mt-6">
                    {/* Header */}
                    <div className="bg-zinc-800 rounded-t-lg p-4 border-b border-zinc-700">
                        <h3 className="text-xl font-bold text-yellow-300">
                            {selectedDay} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h3>
                        {(() => {
                            const dayBeers = getSelectedDayBeers();
                            const totalQuantity = dayBeers.reduce((sum, beer) => sum + beer.quantity, 0);
                            return (
                                <p className="text-zinc-400 text-sm mt-1">
                                    {dayBeers.length > 0 
                                        ? `${dayBeers.length} cerveza${dayBeers.length !== 1 ? 's' : ''} • Total: ${totalQuantity.toFixed(2)}L`
                                        : 'No hay cervezas registradas'
                                    }
                                </p>
                            );
                        })()}
                    </div>
                    
                    {/* Beer List */}
                    <div className="bg-zinc-800 rounded-b-lg max-h-80 overflow-y-auto">
                        <div className="p-4">
                            {(() => {
                                const dayBeers = getSelectedDayBeers();
                                
                                return (
                                    <div className="space-y-3">
                                        {dayBeers.length === 0 ? (
                                            <div className="text-center py-4">
                                                <div className="text-4xl mb-2">🍺</div>
                                                <p className="text-zinc-400">No bebiste nada este día</p>
                                                <p className="text-zinc-500 text-sm mt-1">¡Perfecto para la salud!</p>
                                            </div>
                                        ) : (
                                            dayBeers.map((beer) => (
                                                <div key={beer.id} className="bg-zinc-700 rounded-lg p-4 border border-zinc-600 hover:border-yellow-400/30 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                                                                <span className="text-xl">🍺</span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="text-yellow-300 font-semibold text-lg">
                                                                    {beer.quantity}L
                                                                </div>
                                                                <div className="text-zinc-300 text-sm">
                                                                    {beer.time}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleEditBeer(beer)}
                                                                className="p-2 text-zinc-400 hover:text-yellow-300 hover:bg-zinc-600 rounded-lg transition-colors"
                                                                title="Editar cerveza"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveBeer(beer)}
                                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-600 rounded-lg transition-colors"
                                                                title="Eliminar cerveza"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        
                                        {/* Add Beer Button - Always visible */}
                                        <button
                                            onClick={handleAddBeer}
                                            className="w-full bg-zinc-700 hover:bg-zinc-600 rounded-lg p-4 border border-zinc-600 hover:border-yellow-400/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                                                    <span className="text-xl text-zinc-900">➕</span>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Beer Modal */}
            {showAddModal && selectedDay && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeAddModal}>
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-yellow-300">
                                Añadir Cerveza
                            </h3>
                            <button
                                onClick={closeAddModal}
                                className="text-zinc-400 hover:text-yellow-300 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-zinc-300 text-sm">
                                {selectedDay} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </div>
                            
                            <div>
                                <label className="block text-zinc-300 text-sm font-medium mb-2">
                                    Tamaño de cerveza
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-yellow-300 focus:border-yellow-400 focus:outline-none flex items-center justify-between hover:border-zinc-500 transition-colors"
                                    >
                                        <span>
                                            {beerSizes.find(size => size.value === newBeerQuantity)?.label || '33cl'} ({newBeerQuantity || '0.33'}L)
                                        </span>
                                        <span className={`transform transition-transform ${showSizeDropdown ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    
                                    {showSizeDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-700 border border-zinc-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {beerSizes.map(size => (
                                                <button
                                                    key={size.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewBeerQuantity(size.value);
                                                        setShowSizeDropdown(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left hover:bg-zinc-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                        newBeerQuantity === size.value ? 'bg-zinc-600 text-yellow-300' : 'text-zinc-300'
                                                    }`}
                                                >
                                                    {size.label} ({size.value}L)
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-zinc-300 text-sm font-medium mb-2">
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    value={newBeerTime}
                                    onChange={(e) => setNewBeerTime(e.target.value)}
                                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-yellow-300 focus:border-yellow-400 focus:outline-none"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeAddModal}
                                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-300 py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveBeer}
                                    disabled={addingBeer || !newBeerQuantity || !newBeerTime}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingBeer ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Beer Modal */}
            {showEditModal && editingBeer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeEditModal}>
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-yellow-300">
                                Editar Cerveza
                            </h3>
                            <button
                                onClick={closeEditModal}
                                className="text-zinc-400 hover:text-yellow-300 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-zinc-300 text-sm">
                                {selectedDay} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </div>
                            
                            <div>
                                <label className="block text-zinc-300 text-sm font-medium mb-2">
                                    Tamaño de cerveza
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditSizeDropdown(!showEditSizeDropdown)}
                                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-yellow-300 focus:border-yellow-400 focus:outline-none flex items-center justify-between hover:border-zinc-500 transition-colors"
                                    >
                                        <span>
                                            {beerSizes.find(size => size.value === newBeerQuantity)?.label || `${newBeerQuantity}L`} ({newBeerQuantity}L)
                                        </span>
                                        <span className={`transform transition-transform ${showEditSizeDropdown ? 'rotate-180' : ''}`}>
                                            ▼
                                        </span>
                                    </button>
                                    
                                    {showEditSizeDropdown && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-700 border border-zinc-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                            {beerSizes.map(size => (
                                                <button
                                                    key={size.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setNewBeerQuantity(size.value);
                                                        setShowEditSizeDropdown(false);
                                                    }}
                                                    className={`w-full px-3 py-2 text-left hover:bg-zinc-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                                        newBeerQuantity === size.value ? 'bg-zinc-600 text-yellow-300' : 'text-zinc-300'
                                                    }`}
                                                >
                                                    {size.label} ({size.value}L)
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-zinc-300 text-sm font-medium mb-2">
                                    Hora
                                </label>
                                <input
                                    type="time"
                                    value={newBeerTime}
                                    onChange={(e) => setNewBeerTime(e.target.value)}
                                    className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-yellow-300 focus:border-yellow-400 focus:outline-none"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeEditModal}
                                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-300 py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateBeer}
                                    disabled={addingBeer || !newBeerQuantity || !newBeerTime}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-zinc-900 py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addingBeer ? 'Actualizando...' : 'Actualizar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingBeer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeDeleteModal}>
                    <div className="bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-red-400">
                                Eliminar Cerveza
                            </h3>
                            <button
                                onClick={closeDeleteModal}
                                className="text-zinc-400 hover:text-yellow-300 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-zinc-700 rounded-lg p-4 border border-zinc-600">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                                        <span className="text-xl">🍺</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="text-yellow-300 font-semibold text-lg">
                                            {deletingBeer.quantity}L
                                        </div>
                                        <div className="text-zinc-300 text-sm">
                                            {deletingBeer.time} • {deletingBeer.date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeDeleteModal}
                                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-zinc-300 py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmRemoveBeer}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}