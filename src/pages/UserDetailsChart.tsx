import React, { useState, useEffect } from 'react';
import ChartComponent from '../ChartComponent';
import useUserDetailsData from '../hooks/useUserDetailsData';
import { ChartData, ChartOptions } from 'chart.js';
import axios from 'axios';

const UserDetailsChart: React.FC = () => {
    const [address, setAddress] = useState('');
    const [loadingAddress, setLoadingAddress] = useState(true);
    const [errorAddress, setErrorAddress] = useState('');

    // Assuming this is your API call to get the user address
    const fetchUserAddress = async () => {
        try {
            const response = await axios.get('https://prod-api.kosetto.com/events');
            setAddress(response.data.address); // Adjust according to actual API response
            setLoadingAddress(false);
        } catch (error) {
            setErrorAddress(error.message);
            setLoadingAddress(false);
        }
    };

    useEffect(() => {
        fetchUserAddress();
    }, []);

    // Early return if still loading the address or if there's an error
    if (loadingAddress) return <div>Loading address...</div>;
    if (errorAddress) return <div>Error fetching address: {errorAddress}</div>;

    const { data, loading, error } = useUserDetailsData(address);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    // Rest of your component logic...
};

export default UserDetailsChart;
