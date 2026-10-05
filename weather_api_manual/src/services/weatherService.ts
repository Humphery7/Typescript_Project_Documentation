import axios from "axios";
import AppError from "./errorService.js"



export default async function getWeather(city: string) {
    const api_key = process.env.WEATHER_API_KEY
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${api_key}`

    if (!api_key) {
        console.log("Please set your api key")
        throw new AppError("Invalid key", 500)
    }

    try {
        const response = await axios.get(url);
        console.log(response.data)
        return response.data;
    } catch (e) {
        // console.log(e);
        if (axios.isAxiosError(e)) {
            throw new AppError(`Unable to process due to: ${e}`, e.response?.status || 500)
        }
        throw new AppError(`Unable to process due to: ${e}`, 500)
    }

}