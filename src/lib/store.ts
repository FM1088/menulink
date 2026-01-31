'use client'

import { create } from 'zustand'
import type { RestaurantPage, UserProfile } from './types'

interface AppState {
  user: UserProfile | null
  pages: RestaurantPage[]
  currentPage: RestaurantPage | null
  setUser: (user: UserProfile | null) => void
  setPages: (pages: RestaurantPage[]) => void
  setCurrentPage: (page: RestaurantPage | null) => void
  updateCurrentPage: (updates: Partial<RestaurantPage>) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  pages: [],
  currentPage: null,
  setUser: (user) => set({ user }),
  setPages: (pages) => set({ pages }),
  setCurrentPage: (page) => set({ currentPage: page }),
  updateCurrentPage: (updates) =>
    set((state) => ({
      currentPage: state.currentPage
        ? { ...state.currentPage, ...updates }
        : null,
    })),
}))
