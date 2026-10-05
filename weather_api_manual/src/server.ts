import app from './app.js'
import "dotenv/config";

const PORT: number = Number(process.env.WEATHER_PORT || 3000)



app.listen(PORT, () => {
    console.log(`Server Started on port: ${PORT}`)
})