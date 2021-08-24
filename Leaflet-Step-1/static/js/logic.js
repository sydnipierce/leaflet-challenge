// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  };

  // // Set marker color
  // function chooseColor(depth) {
  //   switch (depth) {
  //   case (depth > 0.6):
  //     return "red";
  //   case (depth > 0.3 && depth <= 0.6):
  //     return "orange";
  //   case (depth <= 0.3):
  //     return "yellow";
  //   }
  // };

  // var geojsonMarkerOptions = {
  //   radius: chooseRad(earthquakeData.feature.properties.mag),
  //   // fillColor: chooseColor(earthquakeData.feature.geometry.coordinates[2]),
  //   // color: "#000",
  //   // radius: 10000,
  //   fillColor: "black",
  //   color: "black",
  //   weight: 1,
  //   opacity: 1,
  //   fillOpacity: 0.8
  // };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circle(latlng)
      // return L.circle(latlng, {
      //   // fillColor: chooseColor(earthquakeData.feature.geometry.coordinates[2]),
      //   // color: "#000",
      //   // radius: 10000,
      //   radius: chooseRad(feature.properties.mag),
      //   fillColor: "black",
      //   color: "black",
      //   weight: 1,
      //   opacity: 1,
      //   fillOpacity: 0.8
      // });
    },
    style: function (feature) {
      var mag = feature.properties.mag;
      var depth = feature.geometry.coordinates[2];
      switch (mag) {
        case (mag > 2):
          return {radius: 20000000};
        case (mag > 1 && mag <= 2):
          return {radius: 20000000};
        case (mag <= 1):
          return {radius: 60000};
      };
      switch (depth) {
        case (depth > 20):
          return {color: "red"};
        case (depth <= 20 && depth > 12):
          return {color: "orange"};
        case (depth <= 12 && depth > 5):
          return {color: "yellow"};
        case (depth <= 5):
          return {color: "cream"};
      };
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Earthquake Depth</strong>',
    '<i class="circle" style="background:' + "red" + '"></i> ',
    '<i class="circle" style="background:' + "orange" + '"></i> ',
    '<i class="circle" style="background:' + "yellow" + '"></i> ',
    '<i class="circle" style="background:' + "white" + '"></i> '];
    categories = ['>20','20>=d>12','12>=d>5','<=5'];


    div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map)

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
}
