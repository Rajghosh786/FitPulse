import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { WorkoutProvider } from './Context/workoutContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
    {/* <WorkoutProvider> */}
      <App />
    {/* </WorkoutProvider> */}
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
