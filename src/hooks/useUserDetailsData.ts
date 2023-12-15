import { useState, useEffect } from 'react';
import { getUserDetails } from '../pages/api/endpoints';
import { UserDetails } from '../../types';

interface UserDetailsState {
    timestamp: number;
    holderCount: number;
    holdingCount: number;
}

const useUserDetailsData = (address: string, interval: number = 60000) => {
    const [data, setData] = useState<UserDetailsState[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await getUserDetails(address, 'yourAuthToken');
                if ('id' in response) {
                    setData(prevData => [...prevData, { 
                        timestamp: Date.now(), 
                        holderCount: response.holderCount, 
                        holdingCount: response.holdingCount 
                    }]);
                } else {
                    setError('Error fetching user details');
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        const intervalId = setInterval(fetchData, interval);
        fetchData();

        return () => clearInterval(intervalId);
    }, [address, interval]);

    return { data, loading, error };
};

export default useUserDetailsData;