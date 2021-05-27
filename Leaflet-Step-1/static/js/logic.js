// Creating map object
var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 5
});
  
// Adding light tile layer to the map
L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    maxZoom: 18,
    id: "mapbox/light-v10",
    accessToken: API_KEY
}).addTo(myMap);

// Define API query URL variable that will retrieve GeoJSON earthquake data
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Function that will determine marker size based on earthquake magnitude values
function markerSize(mag) {
    return mag * 5
}

// Function that will set marker color based on earthquake depth values - greater depth reflected in darker colors
function setColors(d) {
    if (d < 10) {
        return "#fde725"
    }
    else if (d < 30) {
        return "#b5de2b"
    }
    else if (d < 50) {
        return "#35b779"
    }
    else if (d < 70) {
        return "#26828e"
    }
    else if (d < 90) {
        return "#3e4989"
    }
    else {
        return "#440154"
    }
};

// Function that will create markers and set related attributes
function createMarkers(feature, latlng) {
    var setMarkers = {
        radius: markerSize(feature.properties.mag),
        fillColor: setColors(feature.geometry.coordinates[2]),
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
    }
    var latlng = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    console.log(feature.geometry.coordinates);
    return L.circleMarker(latlng, setMarkers);
};

// Perform a GET request to the query URL
d3.json(queryURL, function(data) {

    console.log(data)

    var earthquakes = data.features

    console.log(earthquakes)

    // Loop through each of the features in the and bind popup description re: time & place of the relevant earthquake
    earthquakes.forEach(function(result) {
        // console.log(result.properties)
        L.geoJSON(result,{
            pointToLayer: createMarkers
        }).bindPopup("Date: " + new Date(result.properties.time) + "<br>Place: " + result.properties.place + "<br>Magnitude: " + result.properties.mag).addTo(myMap)
    });

    // Create the map legend displaying depth information
    var legend = L.control({position: "bottomright"});    
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        var breaks = [90, 70, 50, 30, 10, -10];
        var labels = [];
        
        // Loop through density categories and a generate label with a colored square respectively
        for (var i = 0; i < breaks.length; i++) {
                div.innerHTML +=
                    labels.push('<i style="background:' + setColors(breaks[i]) + '"></i> ' + 
                    breaks[i] + (breaks[i + 1] ? '&ndash;' + breaks[i + 1] + '<br>' : '+'));
        }
        div.innerHTML = labels.join('<br>');

        return div;
    };
    console.log(legend)
    legend.addTo(myMap);
});