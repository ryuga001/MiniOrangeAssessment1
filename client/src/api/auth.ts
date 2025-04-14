import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URI, 
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials : true ,
});


export const loginUser = async (email: string, password: string) => {
    try {
        const response = await apiClient.post('/login', {
            email,
            password,
        });
        return response;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const loginUserGoogle = async (googleToken : string) =>{
    try {
        const response = await apiClient.post("/login_google",{googleToken});
        return response.data;
    } catch (error) {
        
    }
}

export const loginUserFacebook = async (facebookToken : string) =>{
    try {
        const response = await apiClient.post("/login_facebook",{facebookToken});
        return response.data;
    } catch (error) {
        
    }
}

export const registerUser = async (username: string, email: string, password: string) => {
    try {
        const response = await apiClient.post('/register', {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        const response = await apiClient.get('/logout');
        return response.data;
    } catch (error) {
        console.error('Error loggingout user:', error);
        throw error;
    }
};

export const getAccessToken = async ()=>{
    try {
        const response = await apiClient.get('/refresh-token');
        return response.data;
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error ;
    }
}

export default apiClient;