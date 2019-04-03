
function markerSize(input) {
return input * 4
};
  
  // Adding tile layer to the map
var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
maxZoom: 18,
id: "mapbox.streets",
accessToken: API_KEY
})
var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});
  
  // Store API query variables
var baseURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var geojson;
  // Grab the data with d3
d3.json(baseURL, function(response) {

var mag = [];
 //Function to provide a color range
function getColor(d) {
    return d > 4   ? '#990000' :
           d > 3   ? '#d7301f' :
           d > 2.5 ? '#ef6548' :
           d > 2   ? '#fc8d59' :
           d > 1.5 ? '#fdbb84' :
           d > 1  ? '#fdd49e' :
           d > 0.5 ? '#fee8c8' :
                     '#fff7ec' ;
}

// Loop through data
for (var i = 0; i < response.features.length; i++) {
    var lat = response.features[i].geometry.coordinates[1];
    var lon = response.features[i].geometry.coordinates[0];
    var magSource = response.features[i].properties.mag;

    mag.push(
        L.circleMarker([lat,lon], {
        stroke: false,
        fillOpacity: 0.75,
        color: getColor(magSource),
        fillColor: getColor(magSource),
        radius: markerSize(magSource)
      }));
    }
var tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"     
var tectonic = new L.layerGroup();

tectonicURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(tectonicURL, function(response) {
  function tecStyle(feature) {
    return {
      weight: 2,
      color: "orange"
    };
  }

  L.geoJSON(response, {
    style: tecStyle
  }).addTo(tectonic);
})


var magnitude = L.layerGroup(mag)
// var tectonic = L.layerGroup(tectonicplates)
var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap     
  };

var overlayMaps = {
"Earthquakes": magnitude,
"Tectonic": tectonic
};

// Creating map object
var myMap = L.map("map", {
    center: [29.76, -95.36],
    zoom: 2,
    layers: [streetmap, magnitude, tectonic]
  });


  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4],
      labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '');
  }
  
  return div;
  };
  
  legend.addTo(myMap);


L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
});