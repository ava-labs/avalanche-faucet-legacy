import axios from 'axios';

const instance = axios.create({
    baseURL: '/',
    timeout: 1000,
    headers: {
        'X-Custom-Header': 'foobar'
    }
});

export default instance;