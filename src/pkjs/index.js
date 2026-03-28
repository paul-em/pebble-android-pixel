function fetchWeather() {
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var url =
        'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
        '&longitude=' + lon +
        '&current_weather=true' +
        '&daily=temperature_2m_max,temperature_2m_min' +
        '&forecast_days=1&timezone=auto';

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        try {
          var data = JSON.parse(xhr.responseText);
          var temp = Math.round(data.current_weather.temperature);
          var tmin = Math.round(data.daily.temperature_2m_min[0]);
          var tmax = Math.round(data.daily.temperature_2m_max[0]);
          var wcode = data.current_weather.weathercode || 0;

          function sendWithPhoneBattery(phoneBatt) {
            Pebble.sendAppMessage({
              Temperature: temp,
              TempMin: tmin,
              TempMax: tmax,
              WeatherCode: wcode,
              PhoneBattery: phoneBatt
            });
          }

          if (typeof navigator !== 'undefined' && navigator.getBattery) {
            navigator.getBattery().then(function (battery) {
              sendWithPhoneBattery(Math.round(battery.level * 100));
            }).catch(function () {
              sendWithPhoneBattery(-1);
            });
          } else {
            sendWithPhoneBattery(-1);
          }
        } catch (e) {
          console.log('Weather parse error: ' + e);
        }
      };
      xhr.onerror = function () {
        console.log('Weather request failed');
      };
      xhr.timeout = 15000;
      xhr.ontimeout = function () {
        console.log('Weather request timed out');
      };
      xhr.send();
    },
    function (err) {
      console.log('Location error: ' + err.message);
    },
    { timeout: 15000, maximumAge: 600000 }
  );
}

Pebble.addEventListener('ready', function () {
  fetchWeather();
});

Pebble.addEventListener('appmessage', function () {
  fetchWeather();
});
