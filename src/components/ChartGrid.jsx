// src/components/ChartGrid.jsx
import React from 'react';
import ChartPanel from './ChartPanel';

export default function ChartGrid({ symbols, interval }) {
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        }}>
            {symbols.map(sym => (
                <ChartPanel
                    key={sym}
                    symbol={sym}
                    interval={interval}
                    height={240}
                />
            ))}
        </div>
    );
}
