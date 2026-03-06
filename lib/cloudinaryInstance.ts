import axios, { AxiosInstance } from "axios"; 

const cloudinaryApi : AxiosInstance = axios.create({
    baseURL: 'https://api.cloudinary.com/v1_1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
})
 


export default cloudinaryApi 