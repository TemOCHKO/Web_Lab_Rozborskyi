import React from 'react';

const WEATHER_LABELS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  51: 'Light drizzle',
  61: 'Rain',
  71: 'Snow',
  80: 'Showers',
  95: 'Thunderstorm',
};

function formatDay(dateStr, index) {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
}

export default function WeatherCard({ index, date, maxTemp, minTemp, windSpeed, code }) {
    const weather = WEATHER_LABELS[code] || 'Cloudy';

    return (
        <div className="day-col">
        <div className="day-date">{formatDay(date, index)}</div>

        <div className="day-condition">
            <span>{weather}</span>
        </div>

        <div className="day-temps">
            <div>Max: {Math.round(maxTemp)}°C</div>
            <div>Min: {Math.round(minTemp)}°C</div>
        </div>

        <div className="day-wind">
            Wind: {Math.round(windSpeed)} km/h
        </div>
        </div>
    );
}