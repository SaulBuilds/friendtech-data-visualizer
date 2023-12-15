// src/pages/dashboard.tsx
import React from 'react';
import ChartComponent from './ChartComponent';
import useEventsData from '../../hooks/useEventsData';
import { ChartData, ChartOptions } from 'chart.js';

const Dashboard: React.FC = () => {
    const { data, loading, error } = useEventsData();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Transform data to a suitable format for Chart.js
    const chartData: ChartData = {
        labels: data.map(event => new Date(event.value).toLocaleDateString()), // Convert timestamp to readable date
        datasets: [{
            label: 'Event Data',
            data: data.map(event => parseFloat(event.value)), // Assuming 'value' is a numerical field
            backgroundColor: 'rgba(0, 123, 255, 0.5)',
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1,
        }],
    };

    const chartOptions: ChartOptions = {
        scales: {
            y: {  // 'y' for the y-axis
                beginAtZero: true, // Start the y-axis at 0
                ticks: {
                    // Additional tick configuration if needed
                }
            },
            x: {  // 'x' for the x-axis
                // Additional x-axis configuration if needed
            }
        },
        responsive: true, // Ensure the chart is responsive
    };
    

    return (
        <div>
            <h1>Dashboard</h1>
            <ChartComponent data={chartData} options={chartOptions} />
        </div>
    );
};

export default Dashboard;
