import React from 'react';
import ReactDOM from 'react-dom/client';//render commponent to the web browser
import './index.css';
import App from './App';
import ShopContextProvider from './context/ShopContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </React.StrictMode>
);


