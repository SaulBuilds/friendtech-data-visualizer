// src/components/ChartComponent.tsx
import React, { useEffect, useRef } from 'react';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
Chart.register(...registerables);

interface ChartComponentProps {
    data: ChartData;
    options: ChartOptions;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ data, options }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            const chartContext = chartRef.current.getContext('2d');
            if (chartContext) {
                // Destroy previous chart instance if exists
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = new Chart(chartContext, {
                    type: 'line',
                    data,
                    options,
                });
            }
        }

        // Cleanup function to destroy chart instance on unmount
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, options]);

    return <canvas ref={chartRef}></canvas>;
};

export default ChartComponent;
