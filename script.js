const cityInput  = document.querySelector(".city-input");
const searchButton  = document.querySelector(".search-btn");
const locationButton  = document.querySelector(".location-btn");
const currentWeatherDiv  = document.querySelector(".current-weather");
const weatherCardsDiv  = document.querySelector(".weather-cards");

const API_key = "ca0a5110f317fafcd493c315ac2bdab3";

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) {
        return `<div class="details">
                  <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                  <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                  <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                  <h4>Humidity: ${weatherItem.main.humidity}%</h4>   
                </div>
                <div class="icon">
                  <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather-icon"> 
                  <h4>${weatherItem.weather[0].description}</h4>
                 </div>`;
    } else {
        return ` <li class="card">
                 <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                 <img src="http://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon"> 
                 <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                 <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                 <h4>Humidity: ${weatherItem.main.humidity}%</h4>
             </li>`;
    }
    
}

const getWeatherDetails = (cityName, latitude, longitude ) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast/?lat=${latitude}&lon=${longitude}&appid=${API_key}`;
    
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

    //    filter the forecast to get only one forecast per day

       const uniqueForecastDays = [];

       const fiveDaysForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if(!uniqueForecastDays.includes(forecastDate)) {
            return uniqueForecastDays.push(forecastDate);
        }
       });

    //    clearing previous weather data
       cityInput.value = "";
       currentWeatherDiv.innerHTML = "";
       weatherCardsDiv.innerHTML = "";
      
       
       fiveDaysForecast.forEach ((weatherItem, index)  => {
        if(index === 0) {
            currentWeatherDiv.insertAdjacentHTML("beforeend",  createWeatherCard(cityName, weatherItem, index));
        } else {
            weatherCardsDiv.insertAdjacentHTML("beforeend",  createWeatherCard(cityName, weatherItem, index));
        }
       
       });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast!");
    });
}


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;

    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;
    
    // get entered city cordinates from API
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
       if(!data.length) return alert(`No coordinates found for ${cityName}`);
       const { name, lat, lon } = data[0];
       getWeatherDetails( name, lat, lon);

    }).catch(() => {
        alert("An error occured while fetching the coordinates!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            
            // Get city name from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
         
             }).catch(() => {
                 alert("An error occured while fetching the city!");
             });
        },
        error => {
           if(error.code === error.PERMISSION_DENIED) {
            alert("Geolocation request denied. Pleast reset location permission to grant acess again.");
           }
        }
    );
}
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
