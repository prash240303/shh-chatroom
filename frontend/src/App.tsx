import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import { Toaster } from "@/components/ui/toaster"
import ChatLayout from './components/ChatLayout'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={
            <ChatLayout />
          } />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  )
}

export default App