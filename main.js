// European cities with their coordinates for the 7Timer API
const cityData = {
    london: { name: "London, UK", lat: 51.5074, lon: -0.1278 },
    paris: { name: "Paris, France", lat: 48.8566, lon: 2.3522 },
    rome: { name: "Rome, Italy", lat: 41.9028, lon: 12.4964 },
    madrid: { name: "Madrid, Spain", lat: 40.4168, lon: -3.7038 },
    berlin: { name: "Berlin, Germany", lat: 52.5200, lon: 13.4050 },
    amsterdam: { name: "Amsterdam, Netherlands", lat: 52.3676, lon: 4.9041 },
    vienna: { name: "Vienna, Austria", lat: 48.2082, lon: 16.3738 },
    prague: { name: "Prague, Czech Republic", lat: 50.0755, lon: 14.4378 },
    budapest: { name: "Budapest, Hungary", lat: 47.4979, lon: 19.0402 },
    warsaw: { name: "Warsaw, Poland", lat: 52.2297, lon: 21.0122 },
    stockholm: { name: "Stockholm, Sweden", lat: 59.3293, lon: 18.0686 },
    oslo: { name: "Oslo, Norway", lat: 59.9139, lon: 10.7522 },
    copenhagen: { name: "Copenhagen, Denmark", lat: 55.6761, lon: 12.5683 },
    helsinki: { name: "Helsinki, Finland", lat: 60.1699, lon: 24.9384 },
    dublin: { name: "Dublin, Ireland", lat: 53.3498, lon: -6.2603 },
    brussels: { name: "Brussels, Belgium", lat: 50.8503, lon: 4.3517 },
    zurich: { name: "Zurich, Switzerland", lat: 47.3769, lon: 8.5417 },
    munich: { name: "Munich, Germany", lat: 48.1351, lon: 11.5820 },
    barcelona: { name: "Barcelona, Spain", lat: 41.3851, lon: 2.1734 }
};

// Weather condition mapping for icons
const weatherIcons = {
    'clearday': 'fas fa-sun',
    'clearnight': 'fas fa-moon',
    'pcloudyday': 'fas fa-cloud-sun',
    'pcloudynight': 'fas fa-cloud-moon',
    'mcloudyday': 'fas fa-cloud',
    'mcloudynight': 'fas fa-cloud',
    'cloudyday': 'fas fa-cloud',
    'cloudynight': 'fas fa-cloud',
    'humidday': 'fas fa-cloud-rain',
    'humidnight': 'fas fa-cloud-rain',
    'lightrainday': 'fas fa-cloud-rain',
    'lightrainnight': 'fas fa-cloud-rain',
    'oshowerday': 'fas fa-cloud-showers-heavy',
    'oshowernight': 'fas fa-cloud-showers-heavy',
    'ishowerday': 'fas fa-cloud-showers-heavy',
    'ishowernight': 'fas fa-cloud-showers-heavy',
    'lightsnowday': 'fas fa-snowflake',
    'lightsnownight': 'fas fa-snowflake',
    'rainyday': 'fas fa-cloud-showers-heavy',
    'rainynight': 'fas fa-cloud-showers-heavy',
    'snowyday': 'fas fa-snowflake',
    'snowynight': 'fas fa-snowflake',
    'rainsnowday': 'fas fa-cloud-showers-heavy',
    'rainsnownight': 'fas fa-cloud-showers-heavy'
};

// DOM elements
const citySelect = document.getElementById('citySelect');
const searchBtn = document.getElementById('searchBtn');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');
const weatherSection = document.getElementById('weatherSection');
const weatherGrid = document.getElementById('weatherGrid');
const cityName = document.getElementById('cityName');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// Event listeners
searchBtn.addEventListener('click', handleSearch);
retryBtn.addEventListener('click', handleRetry);
citySelect.addEventListener('change', handleCityChange);

// Handle city selection change
function handleCityChange() {
    const selectedCity = citySelect.value;
    if (selectedCity) {
        searchBtn.disabled = false;
        searchBtn.style.opacity = '1';
    } else {
        searchBtn.disabled = true;
        searchBtn.style.opacity = '0.6';
    }
}

// Handle search button click
async function handleSearch() {
    const selectedCity = citySelect.value;
    
    if (!selectedCity) {
        showError('Please select a city first.');
        return;
    }

    const cityInfo = cityData[selectedCity];
    if (!cityInfo) {
        showError('City data not found.');
        return;
    }

    showLoading();
    hideError();
    hideWeather();

    try {
        const weatherData = await fetchWeatherData(cityInfo.lat, cityInfo.lon);
        displayWeatherData(cityInfo.name, weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to fetch weather data. Please try again.');
    }
}

// Handle retry button click
function handleRetry() {
    handleSearch();
}

// Fetch weather data from 7Timer API
async function fetchWeatherData(lat, lon) {
    const url = `http://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civil&output=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.dataseries || !Array.isArray(data.dataseries)) {
        throw new Error('Invalid data format received from API');
    }
    
    return data.dataseries;
}

// Display weather data
function displayWeatherData(city, weatherData) {
    hideLoading();
    hideError();
    
    cityName.textContent = `${city} Weather Forecast`;
    
    // Clear previous weather cards
    weatherGrid.innerHTML = '';
    
    // Create weather cards for each day (7 days)
    weatherData.slice(0, 7).forEach((day, index) => {
        const card = createWeatherCard(day, index);
        weatherGrid.appendChild(card);
    });
    
    showWeather();
}

// Create a weather card element
function createWeatherCard(dayData, dayIndex) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    
    const date = new Date();
    date.setDate(date.getDate() + dayIndex);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const weatherIcon = weatherIcons[dayData.weather] || 'fas fa-cloud';
    const temp = Math.round(dayData.temp2m);
    const description = getWeatherDescription(dayData.weather);
    
    card.innerHTML = `
        <h3>${dayName}</h3>
        <p style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 15px;">${dateStr}</p>
        <div class="weather-icon">
            <i class="${weatherIcon}"></i>
        </div>
        <div class="temperature">${temp}°C</div>
        <div class="weather-description">${description}</div>
        <div class="weather-details">
            <span>
                <i class="fas fa-tint"></i>
                <span>${dayData.rh2m}%</span>
            </span>
            <span>
                <i class="fas fa-wind"></i>
                <span>${dayData.wind10m.speed} km/h</span>
            </span>
            <span>
                <i class="fas fa-eye"></i>
                <span>${dayData.visibility} km</span>
            </span>
        </div>
    `;
    
    return card;
}

// Get weather description from weather code
function getWeatherDescription(weatherCode) {
    const descriptions = {
        'clearday': 'Clear Sky',
        'clearnight': 'Clear Night',
        'pcloudyday': 'Partly Cloudy',
        'pcloudynight': 'Partly Cloudy',
        'mcloudyday': 'Mostly Cloudy',
        'mcloudynight': 'Mostly Cloudy',
        'cloudyday': 'Cloudy',
        'cloudynight': 'Cloudy',
        'humidday': 'Humid',
        'humidnight': 'Humid',
        'lightrainday': 'Light Rain',
        'lightrainnight': 'Light Rain',
        'oshowerday': 'Occasional Showers',
        'oshowernight': 'Occasional Showers',
        'ishowerday': 'Isolated Showers',
        'ishowernight': 'Isolated Showers',
        'lightsnowday': 'Light Snow',
        'lightsnownight': 'Light Snow',
        'rainyday': 'Rainy',
        'rainynight': 'Rainy',
        'snowyday': 'Snowy',
        'snowynight': 'Snowy',
        'rainsnowday': 'Rain & Snow',
        'rainsnownight': 'Rain & Snow'
    };
    
    return descriptions[weatherCode] || 'Unknown';
}

// Show/hide functions
function showLoading() {
    loadingSection.classList.remove('hidden');
}

function hideLoading() {
    loadingSection.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

function hideError() {
    errorSection.classList.add('hidden');
}

function showWeather() {
    weatherSection.classList.remove('hidden');
}

function hideWeather() {
    weatherSection.classList.add('hidden');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial state
    searchBtn.disabled = true;
    searchBtn.style.opacity = '0.6';
    
    // Add some interactive feedback
    searchBtn.addEventListener('mouseenter', function() {
        if (!this.disabled) {
            this.style.transform = 'translateY(-2px)';
        }
    });
    
    searchBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    // Add keyboard support
    citySelect.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});

// Error handling for network issues
window.addEventListener('online', function() {
    console.log('Network connection restored');
});

window.addEventListener('offline', function() {
    showError('Network connection lost. Please check your internet connection.');
});

// Add some visual feedback for better UX
function addVisualFeedback(element, type = 'success') {
    const originalBackground = element.style.background;
    const feedbackColor = type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)';
    
    element.style.background = feedbackColor;
    setTimeout(() => {
        element.style.background = originalBackground;
    }, 300);
}

// Enhanced error handling with more specific messages
function handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showError('Network error. Please check your internet connection.');
    } else if (error.message.includes('HTTP error')) {
        showError('Service temporarily unavailable. Please try again later.');
    } else {
        showError('An unexpected error occurred. Please try again.');
    }
}

// Add loading animation enhancement
function enhanceLoadingAnimation() {
    const spinner = document.querySelector('.loading-spinner i');
    if (spinner) {
        spinner.style.animation = 'spin 1.5s linear infinite';
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    enhanceLoadingAnimation();
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 