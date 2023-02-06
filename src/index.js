import './css/styles.css';

const states = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };

function fillStateDropdown() {
  for (const abbrev in states) {
    document.getElementById('state-name-input').innerHTML += `
      <option name=${states[abbrev]}>${abbrev}</option>
    `;
  }
}

const apiKey = process.env.API_KEY;

function getWeather(city, state, units) {
  let geoRequest = new XMLHttpRequest();
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state}}&limit=5&appid=${apiKey}`;
  geoRequest.addEventListener("loadend", function () {
    let response = JSON.parse(this.responseText);
    if (this.status === 200) {
      console.log('georeq got', response)
      let targetCity = response.filter(obj => obj.state === state)[0];
      let lat = targetCity.lat;
      let lon = targetCity.lon;
      let unitType = 'metric';
      if (units === 'Fahrenheit') {
        unitType = 'imperial';
      } else if (units === 'Kelvin') {
        unitType = 'standard';
      }
      let request = new XMLHttpRequest();
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unitType}`;
      request.addEventListener("loadend", function () {
        let response = JSON.parse(this.responseText);
        document.getElementById('loading-message').classList.remove('showing');
        if (this.status === 200) {
          printWeatherInfo(city, state, units, response);
        } else {
          document.getElementById('output-area').innerHTML = `
            <div style="color: red">ERROR ${this.status}: ${this.statusText}</div>
          `;
        }
      });

      request.open("GET", url, true);
      request.send();
    } else {
      document.getElementById('loading-message').classList.remove('showing');
      document.getElementById('output-area').innerHTML = `
        <div style="color: red">ERROR ${this.status}: ${this.statusText}</div>
      `;
    }
  });

  geoRequest.open("GET", geoUrl, true);
  geoRequest.send();
}

function printWeatherInfo(city, state, units, data) {
  document.getElementById('output-area').innerHTML += `
    <h2>${city[0].toUpperCase() + city.substring(1, city.length)}, ${state}</h2>
    <div>${data.weather[0].main}</div>
    <div>Temp: ${data.main.temp}° ${units}</div>
    <div>Humidity: ${data.main.humidity}%</div>
  `;
}

document.getElementById('location-form').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('loading-message').classList.add('showing');
  let userCity = document.getElementById('city-name-input').value;
  let userState = states[document.getElementById('state-name-input').value];
  let userUnits = document.getElementById('temp-units-input').value;
  console.log('getting weather for', userCity, userState);
  getWeather(userCity, userState, userUnits);
});

fillStateDropdown();