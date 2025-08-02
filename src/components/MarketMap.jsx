// src/components/MarketMap.jsx
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

export default function MarketMap() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        )
            .then(res => res.json())
            .then(raw => {
                // Форматируем под Recharts: размер — по market_cap, цвет — по изменению цены
                const formatted = raw.map(coin => ({
                    name: coin.symbol.toUpperCase(),
                    size: coin.market_cap,
                    fill: coin.price_change_percentage_24h >= 0 ? '#4caf50' : '#f44336',
                }));
                setData(formatted);
            })
            .catch(console.error);
    }, []);

    return (
        <ResponsiveContainer width="100%" height={600}>
            <Treemap
                data={data}
                dataKey="size"
                ratio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
            >
                <Tooltip
                    content={({ payload }) => {
                        if (!payload || !payload.length) return null;
                        const { name, size } = payload[0].payload;
                        return (
                            <div style={{
                                background: '#fff',
                                padding: '6px 8px',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                fontSize: 12
                            }}>
                                <strong>{name}</strong>: ${size.toLocaleString()}
                            </div>
                        );
                    }}
                />
            </Treemap>
        </ResponsiveContainer>
    );
}
