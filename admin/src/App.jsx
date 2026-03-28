import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Pages/Admin/Admin'
import { Routes, Route } from 'react-router-dom'


export const App = () => {
  return (
    <div>
    <Navbar/>
    <Routes>
      <Route path="/*" element={<Admin />} />
    </Routes>
      </div>
  )
}
export default App
