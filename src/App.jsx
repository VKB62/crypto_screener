// import MarketMap from './components/MarketMap';
//
// function App() {
//     return (
//         <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
//             <h1 style={{ marginBottom: 16 }}>Crypto Screener — Market Map</h1>
//             <MarketMap />
//         </div>
//     );
// }
//
// export default App;



// src/App.jsx
import React, { useState } from 'react';
import ChartGrid from './components/ChartGrid';

function App() {
    // можно позже сделать выбор биржи/интервала
    const [symbols] = useState([
        'BTCUSDT', 'ETHUSDT', 'BNBUSDT',
        'SOLUSDT', 'ADAUSDT', 'XRPUSDT',
    ]);
    const [interval, setInterval] = useState('5m'); // пример

    return (
        <div style={{ padding: 20, fontFamily: 'sans-serif', background: '#0b1520', minHeight: '100vh' }}>
            <h1 style={{ color: '#fff', marginBottom: 16 }}>Crypto Screener — Futures Charts</h1>

            {/* TODO: позже сюда можно добавить селекторы бирж, таймфреймов и др. */}
            <ChartGrid symbols={symbols} interval={interval} />
        </div>
    );
}


export default App;
