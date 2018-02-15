var map;
var markers = [];
var localMarkers = [];
var placeInfo = [];
var openedWindows = [];
var localMarkerInfo = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 12.972442, lng: 77.580643},
        zoom: 8
    });

    locations.forEach(function (location, locationsArrayIndex) {

        var position = location.location;
        var title = location.title;
        var placeSearch = {
            location: position,
            radius: 20000,
            type: ['point_of_interest']
        };
        placeInfo.push({
            googlePlaceData: [],
            wikiData: {
                'summary': [],
                'ImageSearch' : []
            }
        });
        loadNearbySearchData(placeSearch, locationsArrayIndex);
        loadWikiData(title, locationsArrayIndex);
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            map: map,
            id: locationsArrayIndex
        });

        markers.push(marker);
        addInfoWindow(marker);


    });

}

loadTextSearchData = function (locationsArrayIndex) {

    var keepTrackOfLocalLocations = [];
    var localLocationsTracker = function(localLocation) {

        this.requestStatus =  {location: localLocation, requestComplete : false, locked: false}
        this.printStatus = function () {
                console.log("Location is:", localLocation)
            };


        this.setStatus = function (value) {
            this.requestStatus.requestComplete = value
            };
        this.setLock = function (value) {
            this.requestStatus.locked = value
        }
        };

    function getLocalLocationTrackerIndex(localLocation){
        index = keepTrackOfLocalLocations.findIndex(function (element) {
            return element.requestStatus.location === localLocation
        });


        return index
    }

    function findLocationToRetry(){
        index = keepTrackOfLocalLocations.findIndex(function (element){
            console.log(element.requestStatus.requestComplete)
            return element.requestStatus.requestComplete === false && element.requestStatus.locked === false
        });
        console.log(index)
        keepTrackOfLocalLocations[index].requestStatus.locked = true;
        return keepTrackOfLocalLocations[index].requestStatus.location

    }




    locations[locationsArrayIndex].localLocations.forEach(function (localLocation) {

        var localLocationData = localMarkerInfo.filter(function(object){ //checks if google place data already exists in local array
            return object.name == localLocation});

        if (localLocationData.length == 1) { // if it does, use it.
            lati = localLocationData[0].geometry.location.lat()
            long = localLocationData[0].geometry.location.lng()
            locationLatLng = {lat: lati, lng: long}
            buildLocalMarkers(locationsArrayIndex, locationLatLng, localLocationData[0]);


        } else { // make google place API request.
            // create the object here
            keepTrackOfLocalLocations.push(new localLocationsTracker(localLocation))
            googlePlacesApiCall(localLocation)
        }

    });





    function googlePlacesApiCall(localLocation) { // google places API calling function
        var googleLocation = new google.maps.LatLng(location.lat, location.lng); // make a latlng object
        var request = {
            location: googleLocation,
            radius: 600,
            query: localLocation
        }; // the request object
        var service = new google.maps.places.PlacesService(map);

        service.textSearch(request, textSearchCallback); // make the API call

    }
    function textSearchCallback(results, status) { // the place search API Callback function
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            localMarkerInfo.push(results[0])
            lati = results[0].geometry.location.lat();
            long = results[0].geometry.location.lng();
            locationLatLng = {lat: lati, lng: long}
            buildLocalMarkers(locationsArrayIndex, locationLatLng, results[0]);
            //console.log(getLocalLocationTrackerIndex(results[0].name))
            keepTrackOfLocalLocations[getLocalLocationTrackerIndex(results[0].name)].setStatus(true)


        } else {

            if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                console.log('Couldn loadl palce searh', status, results);
                googlePlacesApiCall(findLocationToRetry())


                }
             else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log(status)
            }
        }
    }


    console.log('KEEPTRACKOFLOCALLOCATIOS', keepTrackOfLocalLocations)

};



buildLocalMarkers = function(locationsArrayIndex, locationLatLng, textSearchResultData) {

    var doesLocalMarkerExist = localMarkers.filter(function(object){ //checks if local marker already exists.
        return object.id == textSearchResultData.id});

    if (doesLocalMarkerExist.length === 1) {
        doesLocalMarkerExist[0].setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){doesLocalMarkerExist[0].setAnimation(null); }, 700)


    } else {

        var localMarker = new google.maps.Marker({
            position: locationLatLng,
            title: textSearchResultData.name,
            map: map,
            animation: google.maps.Animation.DROP,
            id: textSearchResultData.id,
            visible: true
        });
        localMarkers.push(localMarker);
        addLocalInfoWindow(localMarker, textSearchResultData);
        activeViewModel.updateLocalObservableLocations(textSearchResultData, locationsArrayIndex)
    }




};





toggleAllMarkersOn =  function () {
    markers.forEach (function(marker) {
        marker.setMap(map);
    })
};
toggleMarker = function (data, value) {
    if (typeof data === 'undefined') {console.log('Data is undefined');
    } else {
        if (value === undefined) {
            if (markers[data].map !== null) {
                markers[data].setMap(null);
            } else {
                markers[data].setMap(map);
            }
        } else if (value === 'on') {
            if (markers[data].map !== null) {
            } else {
                markers[data].setMap(map);
            }
        } else if (value === 'off') {
            markers[data].setMap(null);
        }
    }
};
closeAllInfoWindows = function () {
    openedWindows.forEach(function (window) {
        window.close();
    });

};
loadNearbySearchData = function(placeSearch, index){
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(placeSearch, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(function (results, i) {
                placeInfo[index].googlePlaceData.push(results)
            });
        } else {
            placeInfo[index].googlePlaceData.push("Unable to fetch results")
        }

    });

};
infoWindowPageConstructor = function (marker) {


    var cityTitle = marker.title
    var quickDescription = placeInfo[marker.id].wikiData.summary[0].split(".",1)[0]
    var windowHTML = "<div>" + cityTitle + "<br><br>" + quickDescription + "</div>"
    return windowHTML

    return infoWindowContent;
};





localInfoWindowPageConstructor = function (marker, textSearchResultData) {
    var locationName = textSearchResultData.name;
    var typeIcon = textSearchResultData.icon;
    var locationAddy = textSearchResultData.formatted_address;
    var placePhoto = function() {
        if (textSearchResultData.photos === undefined) {
            return "https://blog.stylingandroid.com/wp-content/themes/lontano-pro/images/no-image-slide.png";
        } else {
            return textSearchResultData.photos[0].getUrl({maxWidth:200,maxHeight:200});
        }


    }
    var windowHTML = "<div>" + locationName + "<img src='" + typeIcon + "' >" + "<br><br>" + locationAddy + "<br><br>"+ "<img src='" + placePhoto() + "' >" + "</div>";
    return windowHTML;
};


addInfoWindow = function (marker) {

    markers[marker.id].addListener('click', function() {

        var infowindow = new google.maps.InfoWindow({
            content: infoWindowPageConstructor(marker)
    });
        closeAllInfoWindows()
        infowindow.open(map, markers[marker.id]);
        openedWindows.push(infowindow);
    });
};


zoomToMarker = function (markerIndex) {

    var marker = localMarkers.filter(function(object){return object.id == markerIndex});

    map.setZoom(17);
    map.panTo(marker[0].position)

};

addLocalInfoWindow = function (localMarker, textSearchResultData) {


    localMarker.addListener('click', function() {

        var infowindow = new google.maps.InfoWindow({
            content: localInfoWindowPageConstructor(localMarker, textSearchResultData)
        });
        closeAllInfoWindows()
        infowindow.open(map, localMarker);
        openedWindows.push(infowindow);
    });
};


viewModelClickInit = function (locationsArrayIndex) {
    closeAllInfoWindows()
    panToMarker(locationsArrayIndex);
    loadTextSearchData(locationsArrayIndex)


};

panToMarker = function(i) {
    map.panTo(markers[i].getPosition());
    map.setZoom(11);
};


