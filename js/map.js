/** Map.JS contains the code that runs the Google Maps and Places API*/

/**
 *@constant
 *@default
 *@description Google Maps map variable
 */
let map;
/**
 *@var
 *@default
 *@description Holds the wider location markers that are placed after running initMap
 */
let markers = [];
/**
 *@var
 *@default
 *@description Holds the various markers for each wider location.
 */
let localMarkers = [];
/**
 *@var
 *@default
 *@description Holds business and photos info for each wider location
 */
let placeInfo = [];
/**
 *@var
 *@default
 *@description Holds the instance of an open google maps infoWindow
 */
let openedWindows = [];
/**
 *@var
 *@default
 *@description Holds the data used to populate info windows for each local marker
 */
let localMarkerInfo = [];


let keepTrackOfLocalLocations = [];


/**
 *@var
 *@default
 *@description Holds the index number of locations(js).locations the currently viewed wider location
 */
let activeLocation = undefined;


/**
 * @function initMap
 * @description places a map object in the page and populates it with the wider markers. Also loads wiki data for each location and builds the info windows.
 */
function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 12.972442, lng: 77.580643},
        zoom: 6
    });

    locations.forEach(function (location, locationsArrayIndex) {
        let position = location.location;
        let title = location.title;
        let placeSearch = {
            location: position,
            radius: 10000,
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
        let marker = new google.maps.Marker({
            position: position,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            title: title,
            map: map,
            id: locationsArrayIndex
        });
        markers.push(marker);
        addInfoWindow(marker);
    });
}
/**
 * @function viewModelClickInit
 * @description Triggers the necessary steps to load data from a wider location. Is called by the koToggleMarker function
 * @param locationsArrayIndex
 */

viewModelClickInit = function (locationsArrayIndex) {

    closeAllInfoWindows();
    panToMarker(locationsArrayIndex);
    activeLocation = locationsArrayIndex;
    loadTextSearchData(locationsArrayIndex)

};

/**
 * @function loadTextSearchData
 * @description the master function that contains everything necessary to load local markers and their place info.
 * @param locationsArrayIndex
 * @const apiErrors
 */

loadTextSearchData = function (locationsArrayIndex) {

    let apiErrors = 0;

    /**
     *@class localLocationsTracker
     *@description A new localLocationsTracker is constructed for each member in the locations.localLocations array. localLocationsTracker manages API calls for each localLocations. Most of the effort here is to stage the requests to get around the google map api query limit.
     *@param {string} localLocation name of 'locationName' in the locations.Localocations
     *@param {number} index the index of 'locationName'
     *@param {number} greaterLocationIndex Wider location index number
     */

    const localLocationsTracker = function(localLocation, index, greaterLocationIndex) {
        this.requestTimeoutIDs = []; //keeps a list of the active timeouts for each request
        this.timerMultiplier = index; //multiplier is used to stage each request to avoid overloading the api server request limit
        this.greaterLocationIndex = greaterLocationIndex; //simple the index of the greater location this local location is assocated with
        this.requestStatus = {location: localLocation, requestComplete : false, locked: false, apiCalls: 0, unableToComplete: false}; //the request status object keeps track of the important stages of the request process.
        this.makeGoogleApiRequest = function () {
            if (this.requestStatus.apiCalls < 2){
                setTimeout(googlePlacesApiCall, 400 * this.timerMultiplier, this.requestStatus.location);
                this.responseTimeout();
                toggleLoaderAnimation.addCount();
                this.requestStatus.apiCalls++

            } else {
                this.requestStatus.unableToComplete = true;
                console.log("Not able to find:", this.requestStatus.location);
                this.cancelResponseTimeout();
                toggleLoaderAnimation.removeCount()
            }
        }; // each location tracker object can call the google API independly, giving me a bit of flexibility in re-requesting the data if a prior request fails.
        this.setStatus = function () {
            this.requestStatus.requestComplete = true;
            this.cancelResponseTimeout();
            toggleLoaderAnimation.removeCount()
        };
        this.setLock = function (value, timeout) {
            timeout = timeout || true;

            let setFalse = function () {
                self.requestStatus.locked = false

            };
            self.requestStatus.locked = true;
            if (timeout === true) {
                setTimeout("setFalse()", 25)
            }
        }; //unused.

        this.clearFirstTimeout = function () {
            clearTimeout(this.requestTimeoutIDs.shift())
        }; //unused
        this.cancelResponseTimeout = function () {
            this.requestTimeoutIDs.forEach(function (timeOutID) {
                clearTimeout(timeOutID)
            })

        }; //cancels any currently in play api requests.

        this.responseTimeout = function () {
            let timeoutID = setTimeout(noResponseCallback, 400 * this.timerMultiplier + 7000 , this.requestStatus.location.locationName);
            this.requestTimeoutIDs.push(timeoutID)
        }; // the response timeout. if no api reponse is returned in time, it fires and lets the user know something is missing.

        this.makeGoogleApiRequest()

    };
    /**
     * @function initLocalLocationLoop
     * @description Checks if location data already exists, if it doesn't a new localLocationTracker is created.
     */
    function initLocalLocationLoop(){
        keepTrackOfLocalLocations = [];
        locations[locationsArrayIndex].localLocations.forEach(function (localLocation) {
            let localLocationData = localMarkerInfo.filter(function(object){ //checks if google place data already exists in local array

                return object.name === localLocation.locationName});
            if (localLocationData.length > 0) { // if it does, use it.
                const lati = localLocationData[0].geometry.location.lat();
                const long = localLocationData[0].geometry.location.lng();
                let locationLatLng = {lat: lati, lng: long};
                buildLocalMarkers(locationsArrayIndex, locationLatLng, localLocationData[0]);

            } else { // make google place API request.
                // create the object here
                keepTrackOfLocalLocations.push(new localLocationsTracker(localLocation, keepTrackOfLocalLocations.length, locationsArrayIndex))
            }
        });
    }
    /**
     * @function setLocationTrackerStatus
     * @description Checks if location data already exists, if it doesn't a new localLocationTracker is created.
     * @param localLocation {string} name of location tracker
     * @param status {boolean} set to true if a places API response includes the name of local Location
     */
    function setLocationTrackerStatus(localLocation, status){
        let index = keepTrackOfLocalLocations.findIndex(function (element) {
            return element.requestStatus.location.locationName.toLowerCase() === localLocation.toLowerCase()
        });
        if (index !== -1) {
            keepTrackOfLocalLocations[index].setStatus(status)
        } else {
            console.log("Could'nt find a set status match")
        }
    }
    /**
     * @function findLocationToRetry
     * @description locates the first localLocationsTracker object that has not been completed and fires off a new API request with that objects name
     */
    function findLocationToRetry(){
        let index = keepTrackOfLocalLocations.findIndex(function (element){
            return element.requestStatus.requestComplete === false && element.requestStatus.unableToComplete === false
        });
        if (index !== -1){
            keepTrackOfLocalLocations[index].makeGoogleApiRequest()
         } else {
                    console.log('Nothing available')
        }
    }
    /**
     * @function googlePlacesApiCall
     * @description The Google Places API calling function.
     * @param localLocation {string} name of local location
     */
    function googlePlacesApiCall(localLocation) { // google places API calling function
        try {
            let googleLocation = new google.maps.LatLng(locations[activeLocation].location.lat, locations[activeLocation].location.lng); // make a latlng object
            let request = {
                location: googleLocation,
                name: localLocation.locationName, //is the name in locations.localLocations
                keyword: localLocation.keyword,
                rankBy: google.maps.places.RankBy.DISTANCE
            }; // the request object
            let service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, textSearchCallback); // make the API call
        } catch (ReferenceError) {
            generalDisconnectedHandler(ReferenceError)
        }
        /**
         * @function textSearchCallback
         * @description The Google Places API calling function.
         * @param results {string} google places API search results
         * @param status {string} status of API request
         */
        function textSearchCallback(results, status) { // the place search API Callback function
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                let locationNameMatch = []; // results that match the current viewed location

                for (let i = 0; i < results.length; i++) {
                    if (locations[activeLocation].localLocations.filter(localLocation => (localLocation.locationName.toLowerCase() === results[i].name.toLowerCase())).length > 0) {
                        locationNameMatch.push(results[i])
                    }
                }
                if (locationNameMatch.length > 1) {
                    locationNameMatch.forEach(function (location) {
                        if (locations[activeLocation].localLocations.filter(localLocation => (localLocation.keyword === location.vicinity)).length > 0) {
                            let lati = location.geometry.location.lat();
                            let long = location.geometry.location.lng();
                            let locationLatLng = {lat: lati, lng: long};
                            buildLocalMarkers(locationsArrayIndex, locationLatLng, location);
                            setLocationTrackerStatus(location.name, true);
                            localMarkerInfo.push(location);
                        }
                    })
                } else if (locationNameMatch.length === 1) {
                    let lati = locationNameMatch[0].geometry.location.lat();
                    let long = locationNameMatch[0].geometry.location.lng();
                    let locationLatLng = {lat: lati, lng: long};
                    buildLocalMarkers(locationsArrayIndex, locationLatLng, locationNameMatch[0]);
                    setLocationTrackerStatus(locationNameMatch[0].name, true);
                    localMarkerInfo.push(locationNameMatch[0]);
                } else if (locationNameMatch.length === 0) {
                    checkNonActiveLocations(results)
                }

            } else {
                if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                    console.log("Couldn't Load ", status);
                    apiErrors++
                }
                else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    apiErrors++;
                    console.log("No Results", status)
                }
                else if (status === google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR || google.maps.places.PlacesServiceStatus.ERROR ) {
                    googlePlacesApiUnknownErr(activeLocation)
                } else {
                    console.log(status)
                }
            }
        }
        /**
         * @function checkNonActiveLocations
         * @description if none of the returned google places objects match local Locations in the current location, we check all  other locations for a match. This gets used mostly when the user changes locations while local locations are still loading.
         *
         */
        function checkNonActiveLocations(results) {
            let nonActiveLocationResults = [];
            results.forEach(function (result) {
                locations.forEach(function (location, locationsArrayIndex) {
                    if (location.localLocations.filter(localLocations => (localLocations.locationName.toLowerCase() === result.name.toLowerCase())).length > 0) {
                        nonActiveLocationResults.push({result:result, greaterLocationIndex: locationsArrayIndex})
                    }

                })
            });
            if (nonActiveLocationResults.length === 1) {
                let lati = nonActiveLocationResults[0].result.geometry.location.lat();
                let long = nonActiveLocationResults[0].result.geometry.location.lng();
                let locationLatLng = {lat: lati, lng: long};
                buildLocalMarkers(nonActiveLocationResults[0].greaterLocationIndex, locationLatLng, nonActiveLocationResults[0].result);
                localMarkerInfo.push(nonActiveLocationResults[0].result);
            }
        }

    }
    /**
     * @function localSearchRetry
     * @description after a timeout, looks for localLocation objects that haven't been completed. Currently unsed.
     * @param length
     */
    function localSearchRetry(length) {
        let waitTimeOutput = length * 100 + 1000;
        setTimeout(function () {
            for (let i=0; i <= apiErrors * 2; i++) {
                findLocationToRetry()
            }
        }, waitTimeOutput)


    }
    initLocalLocationLoop()
};


/**
 * @function buildLocalMarkers
 * @description local location marker building function. First checks to see if markers were previously constructed, if not, builds them.
 * @param locationsArrayIndex {number}
 * @param locationLatLng {function}
 * @param textSearchResultData {object}
 */
buildLocalMarkers = function(locationsArrayIndex, locationLatLng, textSearchResultData) { // takes the initial location index, the initial location LatLng, and the search data for the local locations

    let doesLocalMarkerExist = localMarkers.filter(function(object){ //checks if local marker already exists in the 'localMarkers' array
        return object.id === textSearchResultData.id});

    if (doesLocalMarkerExist.length === 1) {
        activeViewModel.updateLocalObservableLocations(textSearchResultData, locationsArrayIndex);
        doesLocalMarkerExist[0].setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){doesLocalMarkerExist[0].setAnimation(null); }, 700)


    } else {

        let localMarker = new google.maps.Marker({
            position: locationLatLng,
            title: textSearchResultData.name,
            map: map,
            animation: google.maps.Animation.DROP,
            id: textSearchResultData.id,
            greaterLocationIndex: locationsArrayIndex
        });
        let markerIndexReturn = localMarkers.push(localMarker);
        let index = markerIndexReturn - 1;
        addLocalInfoWindow(localMarker, textSearchResultData);
        activeViewModel.updateLocalObservableLocations(textSearchResultData, locationsArrayIndex, index)

    }

};
/**
 * @function toggleAllMarkersOn
 * @description makes all markers on the map visible. Called when the location search observable is cleared.
 */
toggleAllMarkersOn =  function () {
    localMarkers.forEach (function(marker) {
        marker.setMap(map);
    })
};
/**
 * @function toggleMarker
 * @description toggles marker visibility on or off depending on the value of the location search observable.
 * @param index {number} index of the marker in the localMarkers array
 * @param value {string} state the marker should be set to
 */
toggleMarker = function (index, value) {
    if (typeof index === 'undefined') {console.log('Data is undefined');
    } else {
        if (value === undefined) {
            if (localMarkers[index].map !== null) {
                localMarkers[index].setMap(null);
            } else {
                localMarkers[index].setMap(map);
            }
        } else if (value === 'on') {
            if (localMarkers[index].map !== null) {
            } else {
                localMarkers[index].setMap(map);
            }
        } else if (value === 'off') {
            localMarkers[index].setMap(null);
        }
    }
};
/**
 * @function closeAllInfoWindows
 * @description Makes sure only one info window can be opened at a time
 */
closeAllInfoWindows = function () {
    openedWindows.forEach(function (window) {
        window.close();
    });
};
/**
 * @function loadNearbySearchData
 * @description Does a Google places search for general locations around the wider marker. Currently unused
 */
loadNearbySearchData = function(placeSearch, index){
    let service = new google.maps.places.PlacesService(map);
    service.nearbySearch(placeSearch, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(function (results) {
                placeInfo[index].googlePlaceData.push(results)
            });
        } else {
            placeInfo[index].googlePlaceData.push("Unable to fetch results")
        }

    });

};
/**
 * @function infoWindowPageConstructor
 * @description Constructs the HTML used to describe the wider location marker.
 * @param marker {number} index of the locations.locations markers
 */
infoWindowPageConstructor = function (marker) {
    let cityTitle = marker.title;
    let quickDescription = placeInfo[marker.id].wikiData.summary[0].split(".",1)[0];
    return "<div>" + cityTitle + "<br><br>" + quickDescription + "</div>";

};
/**
 * @function localInfoWindowPageConstructor
 * @description Constructs the HTML used to describe the local location marker
 * @param marker {number} index of the local locations marker
 * @param textSearchResultData {object} google places data for this marker.
 */
localInfoWindowPageConstructor = function (marker, textSearchResultData) {
    let locationName = textSearchResultData.name;
    let typeIcon = textSearchResultData.icon;
    let locationAddy = textSearchResultData.vicinity;
    let placePhotos = function() {
        let outputImages = "";
        if (textSearchResultData.photos === undefined) {
            outputImages = "https://blog.stylingandroid.com/wp-content/themes/lontano-pro/images/no-image-slide.png";
            return outputImages
        } else {
            textSearchResultData.photos.forEach(function (photoObject) {
                let photoUrl = photoObject.getUrl({maxWidth:200,maxHeight:200});
                let imgTag = "<img class='local-location-image' src='" + photoUrl + "'>";
                outputImages = outputImages + imgTag
            });
            return outputImages
        }
    };
    return "<div class='local-info-window'><div class='location-name-top'><div class='location-name-text'>" + locationName + "</div><img class='type-icon' src='" + typeIcon +"'></div><div class = location-lower-container><div class='location-address'>" + locationAddy + "</div><div class='location-image-container'>" + placePhotos() + "</div></div></div>";

};
/**
 * @function addInfoWindow
 * @description Creates an info window object for the wider location marker
 * @param marker {number} index of the wider location marker
 */
addInfoWindow = function (marker) {

    markers[marker.id].addListener('click', function() {

        let infowindow = new google.maps.InfoWindow({
            content: infoWindowPageConstructor(marker)
    });
        closeAllInfoWindows();
        infowindow.open(map, markers[marker.id]);
        openedWindows.push(infowindow);
    });
};
/**
 * @function zoomToMarker
 * @description Zooms the google map to the local location index
 * @param markerIndex {number} index of the local location marker
 */
zoomToMarker = function (markerIndex) { //zooms to localLocation marker

    let marker = localMarkers.filter(function(object){return object.id === markerIndex});
    map.setZoom(17);
    map.panTo(marker[0].position)

};
/**
 * @function addLocalInfoWindow
 * @description Creates info window for local location markers
 * @param localMarker {number} index of the local location marker
 * @param textSearchResultData {string} google places api result data
 */
addLocalInfoWindow = function (localMarker, textSearchResultData) {


    localMarker.addListener('click', function() {

        let infowindow = new google.maps.InfoWindow({
            content: localInfoWindowPageConstructor(localMarker, textSearchResultData)
        });
        closeAllInfoWindows();
        infowindow.open(map, localMarker);
        openedWindows.push(infowindow);
    });
};
/**
 * @function panToMarker
 * @description Zooms the google map to the wider location index
 * @param i {number} index of wider location marker
 */
panToMarker = function(i) { //zooms to greater location marker
    try {
        map.panTo(markers[i].getPosition());
        map.setZoom(locations[i].zoomLevel);
    } catch (TypeError) {
        undefinedMarkerErr()
    }

};



