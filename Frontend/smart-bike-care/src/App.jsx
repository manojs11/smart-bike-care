import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { BikeProvider } from './context/BikeContext'
export default function App() {
  return (
    <BikeProvider>
      {/* <h1>Smart Bike Care System</h1> */}
      <AppRoutes/>
    </BikeProvider>
    
  )
}
