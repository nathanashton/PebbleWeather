var options = JSON.parse(localStorage.getItem('options'));
//console.log('read options: ' + JSON.stringify(options));
if (options === null) options = { "tempunits" : "celsius",
                                   "rainunits" : "mm",
                                  "invert_color" : "false"};

function getWeather() {
  var celsius = options['tempunits'] == 'celsius';
  var mm = options['rainunits'] == 'mm';

  var url = "http://nathanashton.synology.me:8002/latest";

  var response;
  var req = new XMLHttpRequest();
  console.log("Fetching weather");
  req.open('GET', url, true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        response = JSON.parse(req.responseText);
        if (response) {
          var temperature = celsius ? response[0].temperature : (response[0].temperature * 9 / 5 + 32).toFixed(1);
          var temperaturestring = celsius ? temperature + "\u00B0C" : temperature + "\u00B0F";
          var humidity = response[0].humidity + "%";
          var t = new Date(response[0].time);
          t.setHours(t.getHours() + 14);
          var minutes = t.getMinutes();
          minutes = minutes > 9 ? minutes : '0' + minutes;
          var hours = t.getHours();
          hours = hours > 9 ? hours : '0' + hours;
          var u = hours + ":" + minutes;
          var raintotal = mm ? (response[0].raintotal * 25.4).toFixed(1) + "mm / " : (response[0].raintotal).toFixed(1) + "in /"; 
          var rainfallrate = mm ? (response[0].rainfallrate * 25.4).toFixed(1) + "mmh " : (response[0].rainfallrate).toFixed(1) + "inh"; 
          var rain = raintotal + rainfallrate;
          Pebble.sendAppMessage({
            "humidity" : humidity,
            "temperature" : temperaturestring,
            "invert_color" : (options["invert_color"] == "true" ? 1 : 0),
            "wxtime" : u,
            "rain" : rain,
          });
          console.log("Fetched successfully");
        }
      } 
    }
  };

  req.send(null);
}

function updateWeather() {
    getWeather();
}

Pebble.addEventListener('showConfiguration', function(e) {
  var uri = 'http://nathanashton.github.io/PebbleWeather/configuration.html?' +
    '&tempunits=' + encodeURIComponent(options['tempunits']) +
    '&rainunits=' + encodeURIComponent(options['rainunits']) +
    '&invert_color=' + encodeURIComponent(options['invert_color']);
  //console.log('showing configuration at uri: ' + uri);

  Pebble.openURL(uri);
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) {
    options = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('options', JSON.stringify(options));
    console.log('storing options: ' + JSON.stringify(options));
    updateWeather();
  } else {
    console.log('no options received');
  }
});

Pebble.addEventListener("ready", function(e) {
  updateWeather();
  setInterval(function() {
    //console.log("timer fired");
    updateWeather();
  }, 3600000); // 60 minutes

});
