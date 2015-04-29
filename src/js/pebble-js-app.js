var options = JSON.parse(localStorage.getItem('options'));
//console.log('read options: ' + JSON.stringify(options));
if (options === null) options = { "use_gps" : "false",
                                  "location" : "Brisbane",
                                  "units" : "celsius",
                                  "invert_color" : "true"};

function getWeather() {
  var celsius = options['units'] == 'celsius';
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
          var temperature = response[0].temperature + (celsius ? "\u00B0C" : "\u00B0F");
          var humidity = response[0].humidity + "%";
          var t = new Date(response[0].time);
          t.setHours(t.getHours() + 14);
          var minutes = t.getMinutes();
          minutes = minutes > 9 ? minutes : '0' + minutes;
          var hours = t.getHours();
          hours = hours > 9 ? hours : '0' + hours;
          var u = hours + ":" + minutes;
          var rain = response[0].raintotal +"mm";
          Pebble.sendAppMessage({
            "humidity" : humidity,
            "temperature" : temperature,
            "invert_color" : (options["invert_color"] == "true" ? 1 : 0),
            "wxtime" : u,
            "rain" : rain,
          });
          console.log("Fetched successfully");
        }
      } 
    }
        console.log(JSON.stringify(e));

  };

  req.send(null);
}

function updateWeather() {
    getWeather();
}

Pebble.addEventListener('showConfiguration', function(e) {
  var uri = 'http://tallerthenyou.github.io/simplicity-with-day/configuration.html?' +
    'use_gps=' + encodeURIComponent(options['use_gps']) +
    '&location=' + encodeURIComponent(options['location']) +
    '&units=' + encodeURIComponent(options['units']) +
    '&invert_color=' + encodeURIComponent(options['invert_color']);
  //console.log('showing configuration at uri: ' + uri);

  Pebble.openURL(uri);
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) {
    options = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('options', JSON.stringify(options));
    //console.log('storing options: ' + JSON.stringify(options));
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
