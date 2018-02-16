


var observableLocation = function (data, index, location) {
    this.title = ko.observable(data.title);
    this.latLng = ko.observable(data.location);
    this.index = ko.observable(index);
    this.trueName = ko.observable(data.trueName);
    this.locationVisible = ko.computed(function () {
        if (location() === "") {
            toggleAllMarkersOn()
            return true
        } else {
            if (this.title().indexOf(location())) {
                toggleMarker(this.index(), 'off');
                return false
            } else {
                toggleMarker(this.index(), 'on');
                return true
            }
        }}, this)


};
var observableLocalLocation = function(textSearchObject, locationsArrayIndex){
    this.name = ko.observable(textSearchObject.name);
    this.greaterLocation = ko.observable(locations[locationsArrayIndex].title);
    this.locationID = ko.observable(textSearchObject.id)

}







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

    self.updateLocalObservableLocations = function (textSearchObject, locationsArrayIndex) {
        var localMarker = locations[locationsArrayIndex].title;
        var obslocalloc = new observableLocalLocation(textSearchObject, locationsArrayIndex);

        if (localMarker !== undefined) {
            if (self.koLocalLocationList().length > 0) {
                if (self.koLocalLocationList()[0].greaterLocation() === localMarker) {
                    self.koLocalLocationList.push(obslocalloc)
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







