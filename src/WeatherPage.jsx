import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WeatherCard from './WeatherCard';

const KYIV_COORDS = { lat: 50.4501, lon: 30.5234, label: 'Kyiv' };

export default function WeatherPage() {
    const [forecast, setForecast] = useState([]);
    const [locationName, setLocationName] = useState(KYIV_COORDS.label);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadWeather = async (lat, lon, label) => {
        try {
            setLoading(true);
            setLocationName(label);
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto&forecast_days=5`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to load weather data');
            }
            const data = await response.json();
            const days = data.daily.time.map((date, idx) => ({
                date,
                code: data.daily.weather_code[idx],
                maxTemp: data.daily.temperature_2m_max[idx],
                minTemp: data.daily.temperature_2m_min[idx],
                windSpeed: data.daily.wind_speed_10m_max[idx],
            }));

            setForecast(days);
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
        };
        loadWeather(KYIV_COORDS.lat, KYIV_COORDS.lon, KYIV_COORDS.label);
    }, []);

    const handleLogout = () => {
        document.cookie = 'isAuth=; path=/; max-age=0';
        navigate('/');
    };

    return (
        <div className="weather-page">
            <button onClick={handleLogout} className="logout-btn">
            Log out
            </button>

        <div className="weather-content">
            <h1 className="city-title">
            {locationName} <span className="country-sub">Ukraine</span>
            </h1>

            {loading && <div className="loader">Loading weather data...</div>}
            {fetchError && <div className="auth-error">{fetchError}</div>}

            {!loading && !fetchError && (
            <div className="days-row">
                {forecast.map((day, idx) => (
                <WeatherCard key={day.date} index={idx} date={day.date} maxTemp={day.maxTemp}
                    minTemp={day.minTemp} windSpeed={day.windSpeed} code={day.code}/>
                ))}
            </div>
            )}
        </div>
        </div>
    );
}