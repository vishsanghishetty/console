/* Copyright Contributors to the Open Cluster Management project */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 4 * 60 * 60 * 1000, // 4 hours
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App