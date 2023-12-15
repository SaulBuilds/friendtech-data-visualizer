// src/hooks/useEventsData.ts
import { useState, useEffect } from 'react';
import { getEvents } from '../pages/api/endpoints';
import { Events, ErrorResponse } from '../../types'; // Adjust the import path as needed

const useEventsData = () => {
    const [data, setData] = useState<Events['events']>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ErrorResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getEvents();
                if ('events' in response) {
                    setData(response.events);
                } else {
                    setError(response);
                }
                setLoading(false);
            } catch (err) {
                setError(err as ErrorResponse);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
};

export default useEventsData;
