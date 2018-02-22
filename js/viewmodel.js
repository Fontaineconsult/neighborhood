


var observableLocation = function (data, index, location) {
    this.title = ko.observable(data.title);
    this.latLng = ko.observable(data.location);
    this.index = ko.observable(index);
    this.trueName = ko.observable(data.trueName);
    this.locationVisible = ko.computed(function () {
        if (location() === "") { // if the search field is empty, turn all markers on and set visible to true
            //toggleAllMarkersOn()
            //return true
        } else {
            if (this.title().indexOf(location())) { //location() is the search field value
               // toggleMarker(this.index(), 'off');
               // return false
            } else {
               // toggleMarker(this.index(), 'on');
               // return true
            }
        }}, this)


};
var observableLocalLocation = function(textSearchObject, locationsArrayIndex, locationSearch, markerIndex){
    this.name = ko.observable(textSearchObject.name);
    this.markerIndex = markerIndex;
    this.greaterLocation = ko.observable(locations[locationsArrayIndex].title);
    this.locationID = ko.observable(textSearchObject.id);
    this.locationVisible = ko.computed(function () {
        if (locationSearch() === "") { // if the search field is empty, turn all markers on and set visible to true
            toggleAllMarkersOn()
            console.log("STERRTSSSS")
            return true
        } else {
            if (this.name().indexOf(locationSearch())) { //location() is the search field value
                toggleMarker(this.markerIndex, 'off')
                console.log(this.name(), this.markerIndex, 'off')
                return false
            } else {
                toggleMarker(this.markerIndex, 'on')
                console.log(this.name(), this.markerIndex, 'on')
                return true
            }
        }}, this)

};


var viewModel = function () {
    var self = this;
    self.locationSearch = ko.observable("")
    self.koLocationList = ko.observableArray([]);
    self.koLocalLocationList = ko.observableArray([]);
    locations.forEach(function (location, index) {
      self.koLocationList.push( new observableLocation(location, index, self.locationSearch))
    });

    self.koToggleLocalLocationMarker = function () {

    };

    self.zoomToMarker = function (data) {
        zoomToMarker(data.locationID())
    };

    self.koToggleMarker = function (index) {
        viewModelClickInit(index.index());
    };

    self.updateLocalObservableLocations = function (textSearchObject, locationsArrayIndex, index) {//textSearchObject = google places API data for locals location search. locationsArrayIndex = the index of the greater location buttons
        var localMarker = locations[locationsArrayIndex].title;
        var obslocalloc = new observableLocalLocation(textSearchObject, locationsArrayIndex, self.locationSearch, index);
        if (localMarker !== undefined) {
            console.log(localMarker)
            if (self.koLocalLocationList().length > 0) { //this means there are already knockout observable markers on the screen
                if (self.koLocalLocationList()[0].greaterLocation() === localMarker) {//if the first komarker buttons 'greater location' property matches location array index passed by map.js
                    var nameMatch = ko.utils.arrayFirst(self.koLocalLocationList(), function (obsLocLocName) { //looks at the koLocalLocationlist observable array to see if the object already exists
                        return textSearchObject.name === obsLocLocName.name()
                    });
                    if (!nameMatch) {
                        self.koLocalLocationList.push(obslocalloc)
                    }
                } else {
                    self.koLocalLocationList.removeAll();
                    self.koLocalLocationList.push(obslocalloc)
                }
            } else {
                self.koLocalLocationList.push(obslocalloc)
            }
        } else {
            //do nothing
        }
    }
};
var activeViewModel = new viewModel();
ko.applyBindings(activeViewModel);







