import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import { WorkoutProvider } from './Context/workoutContext.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    {/* <WorkoutProvider> */}
      <App />
    {/* </WorkoutProvider> */}
    </AuthProvider>
  </StrictMode>,
)
