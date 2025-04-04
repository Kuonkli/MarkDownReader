import axios from 'axios';

const AuthService = {
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        await axios.post('http://localhost:8080/refresh', {}, {
            headers: {
                "X-Refresh-Token": refreshToken,
            }
        }).then(response => {
            const newAccessToken = response.headers['authorization'].split(' ')[1];
            localStorage.setItem('accessToken', newAccessToken)
        }).catch(error => {
            throw error;
        });
    },
};

export default AuthService;
