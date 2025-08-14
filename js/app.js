// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const resultInput = document.getElementById('result');
const conversionRate = document.getElementById('conversion-rate');
const lastUpdated = document.getElementById('last-updated');
const swapBtn = document.getElementById('swap-currencies');
const menuToggle = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');
const tabButtons = document.querySelectorAll('.tab-button');
const converterSections = document.querySelectorAll('.converter-section');

// Exchange rates and cache
let exchangeRates = {
    USD: 1,
    EUR: 0.85,
    GBP: 0.72,
    JPY: 110.15,
    AUD: 1.30,
    CAD: 1.25,
    CHF: 0.92,
    CNY: 6.45,
    HKD: 7.77,
    NZD: 1.40
};

// API Configuration
// In production, this will be set from environment variables
// In development, we'll use the local server endpoint
let API_KEY = 'bfc429239a53eceab19992b7';
let API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

// Sanitize input to prevent XSS
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Validate currency code
function isValidCurrencyCode(code) {
    return /^[A-Z]{3}$/.test(code);
}

// Initialize API configuration
async function initializeApiKey() {
    try {
        // In production, we already have the API key from environment variables
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            console.log('Running in production, using environment API key');
            return true;
        }
        
        // For local development, fetch from the local server
        console.log('Running locally, fetching API key from server');
        const nonce = Date.now();
        const response = await fetch(`/api/config?_=${nonce}`, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const config = await response.json();
        
        // Validate the API key format
        if (config.apiKey && /^[a-f0-9]{24}$/.test(config.apiKey)) {
            API_KEY = config.apiKey;
            API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;
            console.log('API key loaded successfully');
            return true;
        } else {
            throw new Error('Invalid API key format received');
        }
    } catch (error) {
        console.warn('Could not load API key from server, using fallback:', error);
        // In a production environment, you might want to show a user-friendly error message
        showError('Unable to load exchange rates. Some features may be limited.');
        return false;
    }
}
let lastFetched = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Initialize the application
async function init() {
    // Initialize API key
    await initializeApiKey();
    
    // Get all tab buttons and converter sections
    const tabButtons = document.querySelectorAll('.main-nav a[data-tab]');
    const converterSections = document.querySelectorAll('.converter-section');
    
    // Store them in window object for global access
    window.tabButtons = tabButtons;
    window.converterSections = converterSections;
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial fetch of exchange rates
    fetchExchangeRates();
    
    // Set up periodic refresh of exchange rates (every 5 minutes)
    setInterval(fetchExchangeRates, 5 * 60 * 1000);
    
    // Initialize with current date and time
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDateTime = now.toISOString().slice(0, 16);
    
    // Set initial tab based on URL hash or default to 'currency'
    const initialTab = window.location.hash ? window.location.hash.substring(1) : 'currency';
    switchTab(initialTab);
    
    // Set up a small delay to ensure all elements are loaded
    setTimeout(() => {
        const datetimeInput = document.getElementById('datetime-input');
        if (datetimeInput) {
            datetimeInput.value = localDateTime;
            // Trigger input event to update the display
            const event = new Event('input', {
                bubbles: true,
                cancelable: true,
            });
            datetimeInput.dispatchEvent(event);
        }
    }, 1000);
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching - add click handlers to all tab buttons
    window.tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = button.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId, e);
            }
        });
    });
    
    // Currency conversion
    [amountInput, fromCurrency, toCurrency].forEach(element => {
        if (element) {
            element.addEventListener('input', convertCurrency);
        }
    });
    
    // Swap currencies
    const swapBtn = document.getElementById('swap-currencies');
    if (swapBtn) {
        swapBtn.addEventListener('click', swapCurrencies);
    }
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const tabButton = document.querySelector(`.tab-button[data-tab="${hash}"]`);
            if (tabButton) {
                tabButton.click();
            }
        } else {
            // Default to first tab if no hash
            const firstTab = document.querySelector('.tab-button');
            if (firstTab) {
                firstTab.click();
            }
        }
    });
    
    // Initial tab selection based on URL hash
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (tabButton) {
            tabButton.click();
        } else {
            // Default to first tab if hash is invalid
            const firstTab = document.querySelector('.tab-button');
            if (firstTab) {
                firstTab.click();
            }
        }
    } else {
        // Default to first tab if no hash
        const firstTab = document.querySelector('.tab-button');
        if (firstTab) {
            firstTab.click();
        }
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    nav.classList.toggle('active');
    const isExpanded = nav.classList.contains('active');
    menuToggle.setAttribute('aria-expanded', isExpanded);
}

// Switch between converter tabs
function switchTab(tabId, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Hide all sections
    window.converterSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    window.tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected section with animation
    const activeSection = document.getElementById(tabId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Force reflow to enable animation
        // eslint-disable-next-line no-void
        void activeSection.offsetWidth;
        activeSection.style.animation = 'fadeIn 0.3s ease-out forwards';
    }
    
    // Activate the clicked tab button
    const activeButton = document.querySelector(`.main-nav a[data-tab="${tabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        
        // Update URL hash for deep linking
        window.history.pushState({}, '', `#${tabId}`);
        document.title = `${activeButton.textContent.trim()} | Universal Converter`;
    }
    
    // Close mobile menu if open
    const nav = document.querySelector('nav.main-nav');
    const menuToggle = document.querySelector('.mobile-menu-btn');
    if (nav && menuToggle) {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    
    // Trigger a resize event to fix any layout issues
    window.dispatchEvent(new Event('resize'));
}

// Handle window resize
function handleResize() {
    if (window.innerWidth > 768) {
        nav.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
}

// Show error message to user
function showError(message) {
    // Check if error message element exists, if not create it
    let errorElement = document.getElementById('error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = 'error-message';
        errorElement.style.color = '#e53e3e';
        errorElement.style.marginTop = '10px';
        errorElement.style.padding = '10px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.backgroundColor = '#fff5f5';
        document.querySelector('.converter-section.active').appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => errorElement.remove(), 500);
    }, 5000);
}

// Calculate currency conversion with validation
function convertCurrency() {
    try {
        // Validate input
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount)) {
            showError('Please enter a valid number');
            return;
        }
        
        // Sanitize and validate currency codes
        const fromCurrencyCode = sanitizeInput(fromCurrency.value);
        const toCurrencyCode = sanitizeInput(toCurrency.value);
        
        if (!isValidCurrencyCode(fromCurrencyCode) || !isValidCurrencyCode(toCurrencyCode)) {
            showError('Invalid currency code');
            return;
        }
        
        // Get exchange rates with validation
        const fromRate = exchangeRates[fromCurrencyCode];
        const toRate = exchangeRates[toCurrencyCode];
        
        if (fromRate === undefined || toRate === undefined) {
            showError('Exchange rate data not available');
            return;
        }
        
        // Calculate result with bounds checking
        const result = (amount * toRate) / fromRate;
        if (!isFinite(result)) {
            throw new Error('Invalid calculation result');
        }
        
        // Update the result input with proper formatting
        resultInput.value = result.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });
        
        // Update the conversion rate display
        updateConversionRate();
        
    } catch (error) {
        console.error('Error in currency conversion:', error);
        showError('An error occurred during conversion');
    }
}

// Update conversion rate display with validation
function updateConversionRate() {
    try {
        const fromCurrency = sanitizeInput(document.getElementById('from-currency').value);
        const toCurrency = sanitizeInput(document.getElementById('to-currency').value);
        
        if (!isValidCurrencyCode(fromCurrency) || !isValidCurrencyCode(toCurrency)) {
            return;
        }
        
        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        
        if (fromRate === undefined || toRate === undefined) {
            return;
        }
        
        const rate = toRate / fromRate;
        const conversionRateEl = document.getElementById('conversion-rate');
        
        if (conversionRateEl && isFinite(rate)) {
            // Format the rate with appropriate decimal places
            const formattedRate = rate >= 0.0001 
                ? rate.toFixed(6).replace(/\.?0+$/, '')
                : rate.toExponential(4);
                
            conversionRateEl.textContent = `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
        }
    } catch (error) {
        console.error('Error updating conversion rate:', error);
    }
}

// Update last updated time
function updateLastUpdated() {
    if (!lastUpdatedEl) return;
    
    const now = new Date();
    lastUpdatedEl.textContent = now.toLocaleTimeString();
}

// Fetch exchange rates from API
async function fetchExchangeRates() {
    const now = Date.now();
    
    // Only fetch if cache is expired
    if (now - lastFetched < CACHE_DURATION) {
        console.log('Using cached exchange rates');
        return;
    }
    
    try {
        console.log('Fetching latest exchange rates...');
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.result === 'success') {
            exchangeRates = data.conversion_rates;
            lastFetched = now;
            updateConversionRate();
            updateLastUpdated();
            
            // Save to localStorage for offline use
            localStorage.setItem('exchangeRates', JSON.stringify({
                rates: exchangeRates,
                timestamp: now
            }));
            
            console.log('Exchange rates updated successfully');
        } else {
            throw new Error(data['error-type'] || 'Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        
        // Try to load from localStorage if available
        const cachedData = localStorage.getItem('exchangeRates');
        if (cachedData) {
            const { rates, timestamp } = JSON.parse(cachedData);
            if (now - timestamp < CACHE_DURATION * 2) { // Use cached data even if slightly stale
                exchangeRates = rates;
                updateConversionRate();
                console.log('Using cached exchange rates after error');
            }
        }
    }
}

// Swap currency values
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    convertCurrency();
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Add a simple service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Add a simple PWA manifest
const manifest = {
    "name": "Universal Converter",
    "short_name": "Converter",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#4a6cf7",
    "theme_color": "#4a6cf7",
    "description": "Free online unit and currency converter tool",
    "icons": [
        {
            "src": "/images/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/images/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
};

// Create a link element for the manifest
const link = document.createElement('link');
link.rel = 'manifest';
link.href = 'data:application/json,' + JSON.stringify(manifest);
document.head.appendChild(link);

// Add theme color meta tag
const themeColor = document.createElement('meta');
themeColor.name = 'theme-color';
themeColor.content = '#4a6cf7';
document.head.appendChild(themeColor);
