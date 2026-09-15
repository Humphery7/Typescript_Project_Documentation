import axios from "axios";



export default async function getWeather(city: string) {
    const api_key = process.env.WEATHER_API_KEY
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?key=${api_key}`

    if (!api_key) {
        console.log("Please set your api key")
        throw new Error("Invalid key")
    }

    try {
        const response = await axios.get(url);
        console.log(response.data)
        return response.data;
    } catch (e) {
        console.log(e);
        throw new Error(`Unable to process due to: ${e}`)
    }

}