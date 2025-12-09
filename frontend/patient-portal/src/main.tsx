import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

import { MeshProvider } from '@meshsdk/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <MeshProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </MeshProvider>
    </React.StrictMode>,
)
