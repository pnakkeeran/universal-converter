# Universal Converter

A modern, responsive web application for converting between various units including currency, length, weight, temperature, and time zones. The application works offline and provides real-time exchange rates when online.

## Features

- **Currency Converter**: Convert between different currencies with real-time exchange rates
- **Length Converter**: Convert between meters, kilometers, miles, feet, inches, etc.
- **Weight Converter**: Convert between kilograms, grams, pounds, ounces, etc.
- **Temperature Converter**: Convert between Celsius, Fahrenheit, and Kelvin
- **Time Zone Converter**: Convert between different time zones with support for daylight saving time
- **Offline Support**: Works without an internet connection after the first visit
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Automatically adapts to system preferences

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge, etc.)
- An API key from [ExchangeRate-API](https://www.exchangerate-api.com/) for live currency rates

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/universal-converter.git
   cd universal-converter
   ```

2. Open `js/app.js` and replace `YOUR_API_KEY` with your ExchangeRate-API key:
   ```javascript
   const API_KEY = 'YOUR_API_KEY';
   ```

3. Open `index.html` in your web browser to start using the application.

## Usage

1. **Currency Converter**:
   - Enter an amount
   - Select the source and target currencies
   - The converted amount will be displayed instantly
   - Click the swap button to reverse the conversion

2. **Length/Weight Converters**:
   - Enter a value
   - Select the source and target units
   - The converted value will be displayed instantly

3. **Temperature Converter**:
   - Enter a temperature
   - Select the source and target units (Celsius, Fahrenheit, or Kelvin)
   - The converted temperature will be displayed instantly

4. **Time Zone Converter**:
   - Select a date and time
   - Choose the source and target time zones
   - The converted time will be displayed instantly

## API Integration

This application uses the ExchangeRate-API to fetch real-time currency exchange rates. To get started:

1. Sign up for a free API key at [ExchangeRate-API](https://www.exchangerate-api.com/)
2. Replace the placeholder API key in `js/app.js` with your actual API key

## Browser Support

The application is tested and works on all modern browsers including:

- Google Chrome (latest)
- Mozilla Firefox (latest)
- Apple Safari (latest)
- Microsoft Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ExchangeRate-API](https://www.exchangerate-api.com/) for providing the currency exchange rate data
- [Font Awesome](https://fontawesome.com/) for the icons
- [Google Fonts](https://fonts.google.com/) for the Inter font family
