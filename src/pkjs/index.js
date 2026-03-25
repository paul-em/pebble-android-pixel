function fetchWeather() {
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var url =
        'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
        '&longitude=' + lon +
        '&current_weather=true';

      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () {
        try {
          var data = JSON.parse(xhr.responseText);
          var temp = Math.round(data.current_weather.temperature);
          var code = data.current_weather.weathercode;
          Pebble.sendAppMessage({
            Temperature: temp,
            WeatherCode: code
          });
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
