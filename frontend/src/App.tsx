import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import ChatLayout from './components/ChatLayout'
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from 'next-themes'

function App() {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/' element={
              <ChatLayout />
            } />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            className: '',
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
      </ThemeProvider>
    </>
  )
}

export default App