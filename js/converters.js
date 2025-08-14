// Length conversion factors (to meters)
const lengthFactors = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.34
};

// Weight conversion factors (to kilograms)
const weightFactors = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.453592,
    oz: 0.0283495,
    st: 6.35029
};

// Temperature conversion functions
function convertTemperature(value, fromUnit, toUnit) {
    // First convert to Celsius
    let celsius;
    switch (fromUnit) {
        case 'c':
            celsius = value;
            break;
        case 'f':
            celsius = (value - 32) * 5 / 9;
            break;
        case 'k':
            celsius = value - 273.15;
            break;
        default:
            return value;
    }
    
    // Then convert from Celsius to target unit
    switch (toUnit) {
        case 'c':
            return celsius;
        case 'f':
            return (celsius * 9 / 5) + 32;
        case 'k':
            return celsius + 273.15;
        default:
            return value;
    }
}

// Format time in 12-hour format with AM/PM
function formatTime(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours}:${minutes} ${ampm}`;
}

// Format date in a readable format
function formatDate(date, timezone) {
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        timeZone: timezone
    };
    return date.toLocaleDateString('en-US', options);
}

// Initialize converters
function initializeConverters() {
    // Length converter
    const lengthValue = document.getElementById('length-value');
    const fromLength = document.getElementById('from-length');
    const toLength = document.getElementById('to-length');
    const lengthResult = document.getElementById('length-result');
    const swapLengthBtn = document.getElementById('swap-length');
    
    // Weight converter
    const weightValue = document.getElementById('weight-value');
    const fromWeight = document.getElementById('from-weight');
    const toWeight = document.getElementById('to-weight');
    const weightResult = document.getElementById('weight-result');
    const swapWeightBtn = document.getElementById('swap-weight');
    
    // Temperature converter
    const tempValue = document.getElementById('temp-value');
    const fromTemp = document.getElementById('from-temp');
    const toTemp = document.getElementById('to-temp');
    const tempResult = document.getElementById('temp-result');
    
    // Time zone converter
    const datetimeInput = document.getElementById('datetime-input');
    const fromTimezone = document.getElementById('from-timezone');
    const toTimezone = document.getElementById('to-timezone');
    const timeResult = document.getElementById('time-result');
    
    // Set current date and time as default
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localDateTime = now.toISOString().slice(0, 16);
    datetimeInput.value = localDateTime;
    
    // Set user's timezone as default
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneOptions = Array.from(fromTimezone.options);
    const userOption = timezoneOptions.find(opt => opt.value === userTimezone);
    if (userOption) {
        fromTimezone.value = userTimezone;
    }
    
    // Convert functions
    function convertLength() {
        const value = parseFloat(lengthValue.value) || 0;
        const from = fromLength.value;
        const to = toLength.value;
        
        // Convert to meters first, then to target unit
        const meters = value * lengthFactors[from];
        const result = meters / lengthFactors[to];
        
        lengthResult.value = result.toFixed(6).replace(/\.?0+$/, ''); // Remove trailing zeros
    }
    
    function convertWeight() {
        const value = parseFloat(weightValue.value) || 0;
        const from = fromWeight.value;
        const to = toWeight.value;
        
        // Convert to kilograms first, then to target unit
        const kg = value * weightFactors[from];
        const result = kg / weightFactors[to];
        
        weightResult.value = result.toFixed(6).replace(/\.?0+$/, '');
    }
    
    function convertTemperatureValue() {
        const value = parseFloat(tempValue.value) || 0;
        const from = fromTemp.value;
        const to = toTemp.value;
        
        const result = convertTemperature(value, from, to);
        tempResult.value = result.toFixed(2);
    }
    
    function convertTime() {
        const date = new Date(datetimeInput.value);
        if (isNaN(date.getTime())) return;
        
        const fromTZ = fromTimezone.value;
        const toTZ = toTimezone.value;
        
        try {
            // Format the date in the target timezone
            const options = {
                timeZone: toTZ,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            
            const formatter = new Intl.DateTimeFormat('en-US', options);
            const formatted = formatter.format(date);
            
            // Split into date and time parts
            const [weekday, month, day, year, time] = formatted.split(/[\s,]+/);
            
            // Get timezone abbreviation
            const timezoneAbbr = new Intl.DateTimeFormat('en-US', {
                timeZone: toTZ,
                timeZoneName: 'short'
            }).formatToParts(date)
            .find(part => part.type === 'timeZoneName').value;
            
            // Format the result
            timeResult.textContent = `${time} ${timezoneAbbr} on ${weekday}, ${month} ${day}, ${year}`;
        } catch (error) {
            console.error('Error converting time:', error);
            timeResult.textContent = 'Invalid date or timezone';
        }
    }
    
    // Event listeners for length converter
    [lengthValue, fromLength, toLength].forEach(element => {
        element.addEventListener('input', convertLength);
    });
    
    swapLengthBtn.addEventListener('click', () => {
        const temp = fromLength.value;
        fromLength.value = toLength.value;
        toLength.value = temp;
        convertLength();
    });
    
    // Event listeners for weight converter
    [weightValue, fromWeight, toWeight].forEach(element => {
        element.addEventListener('input', convertWeight);
    });
    
    swapWeightBtn.addEventListener('click', () => {
        const temp = fromWeight.value;
        fromWeight.value = toWeight.value;
        toWeight.value = temp;
        convertWeight();
    });
    
    // Event listeners for temperature converter
    [tempValue, fromTemp, toTemp].forEach(element => {
        element.addEventListener('input', convertTemperatureValue);
    });
    
    // Event listeners for time zone converter
    [datetimeInput, fromTimezone, toTimezone].forEach(element => {
        element.addEventListener('change', convertTime);
        element.addEventListener('input', convertTime);
    });
    
    // Initial conversions
    convertLength();
    convertWeight();
    convertTemperatureValue();
    convertTime();
}

// Expose the function globally
window.initializeConverters = initializeConverters;
