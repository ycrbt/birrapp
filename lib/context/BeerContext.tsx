'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBeerTotal } from '@/lib/persistence/beer-count';

interface BeerContextType {
  totalLiters: number;
  isLoading: boolean;
  updateTotal: (newTotal: number) => void;
  refreshTotal: () => Promise<void>;
}

const BeerContext = createContext<BeerContextType | undefined>(undefined);

export function useBeer() {
  const context = useContext(BeerContext);
  if (context === undefined) {
    throw new Error('useBeer must be used within a BeerProvider');
  }
  return context;
}

interface BeerProviderProps {
  children: ReactNode;
}

export function BeerProvider({ children }: BeerProviderProps) {
  const [totalLiters, setTotalLiters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTotalLiters = async () => {
    try {
      const total = await getBeerTotal();
      console.log("Fetching beer total from database");
      setTotalLiters(Number(total) || 0);
    } catch (error) {
      console.error('Failed to fetch beer total:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalLiters();
  }, []);

  const updateTotal = (newTotal: number) => {
    setTotalLiters(newTotal);
  };

  const refreshTotal = async () => {
    setIsLoading(true);
    await fetchTotalLiters();
  };

  const value: BeerContextType = {
    totalLiters,
    isLoading,
    updateTotal,
    refreshTotal,
  };

  return (
    <BeerContext.Provider value={value}>
      {children}
    </BeerContext.Provider>
  );
}