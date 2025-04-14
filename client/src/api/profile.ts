import axios from 'axios';
import { getAccessToken } from './auth';

const profileApiClient = axios.create({
    baseURL: import.meta.env.VITE_USER_API_URI,
    timeout: 10000,
    withCredentials: true, 
});


export const getMe = async () => {
    try {

        const data = await getAccessToken();
        
        console.warn(data);
        const response = await profileApiClient.get('/profile', {
            headers: {
            Authorization: `Bearer ${data.data.accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

export const updateMe = async (username : string , phoneNo ?: string) => {
    try {

        const data = await getAccessToken();
        
        
        const response = await profileApiClient.put(
            '/profile',
            { username, phoneno : phoneNo }, 
            {
            headers: {
                Authorization: `Bearer ${data.data.accessToken}`,
            },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

export default profileApiClient;
