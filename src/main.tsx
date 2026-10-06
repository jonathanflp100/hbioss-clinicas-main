import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProfileProvider } from './hooks/useUserProfile'

createRoot(document.getElementById("root")!).render(
  <UserProfileProvider>
    <App />
  </UserProfileProvider>
);
