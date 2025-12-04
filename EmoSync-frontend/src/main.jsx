import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '@/store/index.js';
import App from './App.jsx'
import './index.css'
import 'react-quill/dist/quill.snow.css'


createRoot(document.getElementById('root')).render(
 <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
