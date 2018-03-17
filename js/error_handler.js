let missingLocationCount = 0;
let counterVisible = false;

const googlePlacesApiUnknownErr = function (greaterLocationIndex) {
    let errorCalls = 0;
    errorCalls++;
    function insertLoaderDiv() {
        if (errorCalls === 1) {
            $("#location-header").append("<div id='loaderContainer'><div class='loader'></div></div>")
        }
    }


};

const undefinedMarkerErr = function () {
    console.log("Couldn't Find Marker Data")
};

const generalDisconnectedHandler = function (error) {
    console.log("General Disconnect " + error);

    $("#master-container").prepend("<div class='disconnected-overlay'></div>")


};

const ajaxError = function (error) {
    console.log("AJAX ERROR ", error)
};
const noResponseCallback = function (localLocationName) {
    localLocationNoResponse(localLocationName);
    toggleLoaderAnimation.removeCount()
};


const cancelLocalLocationResponseTimeouts = function () {
    keepTrackOfLocalLocations.forEach(function (trackedLocation) {
        if (trackedLocation.greaterLocationIndex === activeLocation) {
            trackedLocation.cancelResponseTimeout()
        }
    })

}

const localLocationNoResponse = function (location) {
    console.log('No location response from ' + location);

    missingLocationsElementToggle()
    missingLocationCount++
    counterVisible = true
    activeViewModel.missingLocationsObservable(missingLocationCount)
};

const missingLocationsElementToggle = function () {
    console.log($("#missinglocationcounter").length);
    if (counterVisible === false) {
        let totalLocationCount = locations[activeLocation].localLocations.length;
        document.getElementById("missingLocationContainer").classList.remove("invisible");
        $("#missingLocationContainer").append("<span id='missingLocationCounter' class='missing-location-counter'>&#8201of " + totalLocationCount + " locations missing</span>");
        $("#localLocationList").css("height", "90%");
        counterVisible = true
    }
};
const removeMissingLocationElement = function () {
    if (counterVisible === true) {
        $("#missingLocationCounter").remove();
        $("#localLocationList").removeAttr("style");
        document.getElementById("missingLocationContainer").classList.add("invisible");
        counterVisible = false
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
