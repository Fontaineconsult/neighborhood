let missingLocationCount = 0;
let counterVisible = false;


/**
 * @function googlePlacesApiUnknownErr
 * @description a general catch for google api errors. Usually only fires when the map data fails to load completely
 * @param greaterLocationIndex
 */
const googlePlacesApiUnknownErr = function (greaterLocationIndex) {
    console.log("Can't load greater location ", greaterLocationIndex)
    let alertMessage = "Can't load the Google Map JS Api";
    window.alert(alertMessage)

};
/**
 * @function undefinedMarkerErr
 * @description called when markers are not successfully pushed into their respective arrays
 */
const undefinedMarkerErr = function () {
    console.log("Couldn't Find Marker Data")
    let alertMessage = "Can't load marker data"
    window.alert(alertMessage)
};

/**
 * @function generalDisconnectHandler
 * @description called when the google map api call fails
 * @param error
 */


const generalDisconnectedHandler = function (error) {
    console.log("General Disconnect " + error);
    let alertMessage = "There appears to be a connection issue: n\ " + error;
    window.alert(alertMessage)


};

/**
 * @function ajaxError
 * @description general handler for wiki ajax failures beyond the build in ajax error methods
 * @param error
 */

const ajaxError = function (error) {
    console.log("AJAX ERROR ", error)
    let alertMessage = "Something went wrong a Wikipedia data request"
    window.alert(alertMessage)
};

/**
 * @function noResponseCallback
 * @description decrements the loader animation counter and calls localLocationNoReponse function
 * @param localLocationName
 */
const noResponseCallback = function (localLocationName) {
    localLocationNoResponse(localLocationName);
    toggleLoaderAnimation.removeCount()
};


/**
 * @function cancelLocalLocationResponseTimeouts
 * @description called when a location button is pressed. Cancels the response timeouts for all the tracked locations
 */

const cancelLocalLocationResponseTimeouts = function () {
    keepTrackOfLocalLocations.forEach(function (trackedLocation) {
        if (trackedLocation.greaterLocationIndex === activeLocation) {
            trackedLocation.cancelResponseTimeout()
        }
    })

};

/**
 * @function localLocationNoResponse
 * @description  calls the missing location counter increment function and passes the value to the KO counter object
 * @param location
 */

const localLocationNoResponse = function (location) {
    console.log('No location response from ' + location);
    missingLocationsElementToggle()
    missingLocationCount++
    counterVisible = true
    activeViewModel.missingLocationsObservable(missingLocationCount)
};

/**
 * @function missingLocationsElementToggle
 * @description toggles the missing location counter element.
 */

const missingLocationsElementToggle = function () {
    if (counterVisible === false) {
        let totalLocationCount = locations[activeLocation].localLocations.length;
        document.getElementById("missingLocationContainer").classList.remove("invisible");
        $("#missingLocationContainer").append("<span id='missingLocationCounter' class='missing-location-counter'>&#8201of " + totalLocationCount + " locations missing</span>");
        $("#localLocationList").css("height", "90%");
        counterVisible = true
    }
};

/**
 * @function removeMissingLocationElement
 * @description removes the missing location counter element
 */

const removeMissingLocationElement = function () {
    if (counterVisible === true) {
        $("#missingLocationCounter").remove();
        $("#localLocationList").removeAttr("style");
        document.getElementById("missingLocationContainer").classList.add("invisible");
        counterVisible = false;
        activeViewModel.missingLocationsObservable(0)
    }


};



const resetMissingLocationCount = function () {
    missingLocationCount = 0
}
const toggleLoaderAnimation =  {
    requestCount: 0,
    addCount() {
        toggleLoaderAnimation.requestCount++
        toggleLoaderAnimation.refresh()
    },
    removeCount() {
        toggleLoaderAnimation.requestCount--
        toggleLoaderAnimation.refresh()
    },

    clearCount() {
        toggleLoaderAnimation.requestCount = 0
        toggleLoaderAnimation.refresh()
    },

    refresh() {
        if (toggleLoaderAnimation.requestCount > 0) {
            if ($("#loaderContainer").length === 0) {
                $("#location-header").append("<div id='loaderContainer'><div class='loader'></div></div>")
            }
        } else {
            $("#loaderContainer").remove()
        }

    }
};
