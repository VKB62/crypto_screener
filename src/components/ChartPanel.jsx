// // src/components/ChartPanel.jsx
// import React, { useEffect, useRef, useState } from 'react';
// import axios from 'axios';
//
// // Доступные таймфреймы
// const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
//
// export default function ChartPanel({ symbol, width = '100%', height = 240 }) {
//     const containerRef = useRef();
//     const [interval, setInterval] = useState('1m');
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//
//     useEffect(() => {
//         if (!containerRef.current) return;
//
//         setLoading(true);
//         setError(null);
//
//         // 1) создаём график
//         const chart = window.LightweightCharts.createChart(
//             containerRef.current,
//             {
//                 width: containerRef.current.clientWidth,
//                 height,
//                 layout: {
//                     textColor: '#d1d4dc',
//                     backgroundColor: '#0b1520',
//                 },
//                 grid: {
//                     vertLines: { color: '#334158' },
//                     horzLines: { color: '#334158' },
//                 },
//                 timeScale: { timeVisible: true, secondsVisible: false },
//             }
//         );
//         const candleSeries = chart.addCandlestickSeries();
//
//         // 2) загрузка исторических баров
//         axios
//             .get('https://fapi.binance.com/fapi/v1/klines', {
//                 params: { symbol, interval, limit: 200 },
//             })
//             .then(({ data }) => {
//                 const bars = data.map((d) => ({
//                     time: d[0] / 1000,
//                     open: +d[1],
//                     high: +d[2],
//                     low: +d[3],
//                     close: +d[4],
//                 }));
//                 candleSeries.setData(bars);
//                 setLoading(false);
//             })
//             .catch((e) => {
//                 console.error(e);
//                 setError('Failed to load data');
//                 setLoading(false);
//             });
//
//         // 3) WebSocket обновления
//         const ws = new WebSocket(
//             `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`
//         );
//         ws.onmessage = (msg) => {
//             try {
//                 const parsed = JSON.parse(msg.data);
//                 const kline = parsed.k || parsed.data?.k;
//                 if (!kline) return;
//                 const update = {
//                     time: kline.t / 1000,
//                     open: +kline.o,
//                     high: +kline.h,
//                     low: +kline.l,
//                     close: +kline.c,
//                 };
//                 candleSeries.update(update);
//             } catch {
//                 // ignore
//             }
//         };
//
//         // 4) ресайз по окну
//         const onResize = () => {
//             chart.applyOptions({ width: containerRef.current.clientWidth });
//         };
//         window.addEventListener('resize', onResize);
//
//         return () => {
//             ws.close();
//             window.removeEventListener('resize', onResize);
//             chart.remove();
//         };
//     }, [symbol, interval, height]);
//
//     return (
//         <div style={{ margin: 4, flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div style={{ fontSize: 12, color: '#a0aec0' }}>{symbol}</div>
//                 <select
//                     value={interval}
//                     onChange={(e) => setInterval(e.target.value)}
//                     style={{ fontSize: 10, padding: '2px', background: '#1f2a36', color: '#d1d4dc', border: '1px solid #334158', borderRadius: 4 }}
//                 >
//                     {INTERVALS.map((tf) => (
//                         <option key={tf} value={tf}>
//                             {tf}
//                         </option>
//                     ))}
//                 </select>
//                 {loading && <div style={{ fontSize: 10, color: '#68d391' }}>Loading...</div>}
//                 {error && <div style={{ fontSize: 10, color: '#e53e3e' }}>{error}</div>}
//             </div>
//             <div
//                 ref={containerRef}
//                 style={{ width, height, background: '#0b1520', position: 'relative' }}
//             />
//         </div>
//     );
// }


// src/components/ChartPanel.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';

// Доступные таймфреймы
const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

export default function ChartPanel({ symbol, height = 240 }) {
    const nodeRef = useRef(null);
    const chartContainerRef = useRef(null);
    const [interval, setInterval] = useState('1m');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        setLoading(true);
        setError(null);

        // создаём график
        const chart = window.LightweightCharts.createChart(
            chartContainerRef.current,
            {
                width: chartContainerRef.current.clientWidth,
                height,
                layout: { textColor: '#d1d4dc', backgroundColor: '#0b1520' },
                grid: { vertLines: { color: '#334158' }, horzLines: { color: '#334158' } },
                timeScale: { timeVisible: true, secondsVisible: false },
            }
        );
        const candleSeries = chart.addCandlestickSeries();

        // автоматический ресайз
        const ro = new ResizeObserver(([entry]) => {
            chart.applyOptions({ width: entry.contentRect.width });
        });
        ro.observe(chartContainerRef.current);

        // загрузка исторических данных
        axios
            .get('https://fapi.binance.com/fapi/v1/klines', { params: { symbol, interval, limit: 200 } })
            .then(({ data }) => {
                const bars = data.map(d => ({ time: d[0] / 1000, open: +d[1], high: +d[2], low: +d[3], close: +d[4] }));
                candleSeries.setData(bars);
                setLoading(false);
            })
            .catch(e => { console.error(e); setError('Failed to load data'); setLoading(false); });

        // WebSocket обновления
        const ws = new WebSocket(`wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`);
        ws.onmessage = msg => {
            try {
                const parsed = JSON.parse(msg.data);
                const k = parsed.k || parsed.data?.k;
                if (!k) return;
                candleSeries.update({ time: k.t / 1000, open: +k.o, high: +k.h, low: +k.l, close: +k.c });
            } catch {}
        };

        return () => {
            ws.close();
            ro.disconnect();
            chart.remove();
        };
    }, [symbol, interval, height]);

    return (
        <Draggable nodeRef={nodeRef} handle=".handle">
            <div
                ref={nodeRef}
                style={{
                    margin: 8,
                    padding: 4,
                    background: '#1f2a36',
                    border: '1px solid #334158',
                    borderRadius: 4,
                    resize: 'horizontal',
                    overflow: 'auto',
                    width: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    className="handle"
                    style={{ cursor: 'move', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}
                >
                    <div style={{ fontSize: 12, color: '#a0aec0' }}>{symbol}</div>
                    <select
                        value={interval}
                        onChange={e => setInterval(e.target.value)}
                        style={{ fontSize: 10, padding: '2px', background: '#334158', color: '#d1d4dc', border: 'none', borderRadius: 4 }}
                    >
                        {INTERVALS.map(tf => (
                            <option key={tf} value={tf}>{tf}</option>
                        ))}
                    </select>
                    {loading && <div style={{ fontSize: 10, color: '#68d391' }}>Loading...</div>}
                    {error && <div style={{ fontSize: 10, color: '#e53e3e' }}>{error}</div>}
                </div>
                <div ref={chartContainerRef} style={{ width: '100%', height }} />
            </div>
        </Draggable>
    );
}

