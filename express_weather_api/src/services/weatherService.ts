import axios from "axios";

export interface CurrentConditions {
  datetime: string;
  temp: number;
  feelslike: number;
  humidity: number;
  windspeed: number;
  conditions: string;
  icon: string;
  uvindex?: number;
  visibility?: number;
}

export interface DayForecast {
  datetime: string;
  tempmax: number;
  tempmin: number;
  humidity: number;
  conditions: string;
  description: string;
}

export interface FormattedWeatherData {
  address: string;
  resolvedAddress: string;
  timezone: string;
  description: string;
  currentConditions: CurrentConditions;
  days: DayForecast[];
}

export class WeatherApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "WeatherApiError";
    this.statusCode = statusCode;
  }
}

export async function fetchWeatherData(city: string): Promise<FormattedWeatherData> {
  const apiKey = process.env.WEATHER_API;

  if (!apiKey) {
    throw new WeatherApiError("WEATHER_API key is not configured in environment variables", 500);
  }

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    const formattedData: FormattedWeatherData = {
      address: data.address || city,
      resolvedAddress: data.resolvedAddress || city,
      timezone: data.timezone || "UTC",
      description: data.description || "",
      currentConditions: {
        datetime: data.currentConditions?.datetime || new Date().toISOString(),
        temp: data.currentConditions?.temp,
        feelslike: data.currentConditions?.feelslike,
        humidity: data.currentConditions?.humidity,
        windspeed: data.currentConditions?.windspeed,
        conditions: data.currentConditions?.conditions,
        icon: data.currentConditions?.icon,
        uvindex: data.currentConditions?.uvindex,
        visibility: data.currentConditions?.visibility,
      },
      days: (data.days || []).slice(0, 7).map((day: any) => ({
        datetime: day.datetime,
        tempmax: day.tempmax,
        tempmin: day.tempmin,
        humidity: day.humidity,
        conditions: day.conditions,
        description: day.description,
      })),
    };

    return formattedData;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          throw new WeatherApiError(`Invalid location or city name '${city}'`, 400);
        }
        if (status === 401) {
          throw new WeatherApiError("Invalid or unauthorized 3rd party Weather API key", 500);
        }
        if (status === 429) {
          throw new WeatherApiError("3rd party Weather API rate limit exceeded", 429);
        }
        throw new WeatherApiError(`Upstream weather service returned status ${status}`, 502);
      } else if (error.code === "ECONNABORTED") {
        throw new WeatherApiError("Upstream weather service request timed out", 504);
      }
    }

    throw new WeatherApiError(`Failed to fetch weather data: ${error.message || "Unknown error"}`, 502);
  }
}

export default fetchWeatherData;
