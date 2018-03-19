/**
 * @function constructWikiHtml
 * @description builds the wiki html view for each local Location.
 * @param index {number}
 */

constructWikiHtml = function (index) {


    try {
        let currentWikiInfo = placeInfo[index].wikiData;
        let $wikiPictureContainer = $("<div>", {"class":"wiki-picture-container"});
        currentWikiInfo.ImageSearch.forEach(function (imageUrl, i) {
            $wikiPictureContainer.append("<img class='wiki-image' id='" + "image" + i +"' onclick='viewWikiPhoto(this)' src='" + imageUrl +"'>")

        });
        let wikiMainContainer = $("#wikiContainer");
        wikiMainContainer.empty();
        wikiMainContainer.append("<div class='wiki-content-header'>" +
            "<div class='wiki-content-title'>About This City</div>" +
            "<div class='close-button' onclick='toggleWikiWindow()'></div>" +
            "</div>" +
            "<div class='wiki-content' id='wikiContent'>"
            + currentWikiInfo.summary[0] +
            "</div>"
        );
        wikiMainContainer.append($wikiPictureContainer)
    } catch (TypeError) {
        generalDisconnectedHandler()
    }

};

/** @function viewWikiPhoto
 * @description places a full screen overlay with the clicked wiki image.
 *@param id {number} id of image element
 */

viewWikiPhoto = function (id) {
    let $bigWikiPictureBackground = $("<div>", {'class': 'wiki-image-container-background', 'onclick': 'closeWikiPhoto()' });

    let $bigWikiPictureContainer = $("<div>", {id: 'big-wiki-image-container', "class":"big-wiki-image-container"});
    let image = $(id).attr("src");
    $bigWikiPictureContainer.append("<img class='big-wiki-image' src='" + image +  "'>");
    $bigWikiPictureContainer.append($bigWikiPictureBackground);

    $("#upper-container").append($bigWikiPictureContainer)

};

/**
 * @function closeWikiPhoto
 * @description removes the full screen wiki photo element
 */

closeWikiPhoto = function () {
    $('#big-wiki-image-container').remove()
};

/**
 * @function openGreaterLocationMenu
 * @description when the screen width is in mobile size, allows for toggling of the greater location buttons
 *
 */
openGreaterLocationMenu = function () {
    if ($(window).width() < 1366) {
        $("#mainLocationSelectors").toggle()
    }
};

/**
 * @function resetPage
 * @description returns the page to its starting state after clicking on a greater location button
 *
 */

resetPage = function () {
    cancelLocalLocationResponseTimeouts();
    toggleLoaderAnimation.clearCount();
    resetMissingLocationCount();
    removeMissingLocationElement();
    document.getElementById("location-header").classList.remove("invisible");
    document.getElementById("outer-location-container").classList.remove("outer-location-minwidth");
    document.getElementById("localLocationList").style.height = "95%";
    document.getElementById("outer-location-container").classList.remove("portrait-invisible");
    document.getElementById("wikiContainer").classList.remove("portrait-invisible");
};

/*
lets user close the wiki display window to save space.
 */

const toggleWikiWindow = function () {
    $("#wikiContainer").toggle()
};


const closeWelcomeWindow = function () {
    $("#welcomeOverlay").remove()
};

/*
enables the greater location selectors if they are turned off in mobile display when resizing the page to desktop size.
 */

$(window).resize(function () {
    if ($(window).width() > 1366) {
        $("#mainLocationSelectors").show()
    }
});

/*
loads the welcome overlay page when the page is first loaded
 */

$(window).load(function () {
    const $welcomeOverlay = $('<div>', {'id':'welcomeOverlay','class':'welcome-overlay'});
    const $welcomeMessageContainer = $('<div>', {'class':'welcome-message-center-container'});
    const $welcomeMessageInnerContainer = $('<div>', {'class':'welcome-message-inner-container'});
    const $welcomeMessageTitle = $('<div>', {'class':'welcome-message-title'});
    const $welcomeMessageContent = $('<div>', {'class':'welcome-message-content'});
    const $welcomeMessageFooter = $('<div>', {'class':'welcome-message-footer'});
    const $welcomeMessageCloseButton = $('<button>', {'id':'closeButton'});
    $welcomeMessageTitle.html("Udacity FSND Neighboorhood Map");
    $welcomeMessageContent.html("Welcome! This javascript application displays most of the many random locations I visited on a recent trip to India to get married. The buttons at the top of the screen represent each city. Clicking on a button will show all the locations visited in that city as well as its wikipedia article.");
    $welcomeMessageCloseButton.html("Got it!");
    $welcomeMessageCloseButton.attr({"onClick": 'closeWelcomeWindow()'});
    $welcomeMessageInnerContainer.append($welcomeMessageTitle).append($welcomeMessageContent).append($welcomeMessageFooter.append($welcomeMessageCloseButton));
    $welcomeOverlay.append($welcomeMessageContainer.append($welcomeMessageInnerContainer));
    $(document.body).prepend($welcomeOverlay)
});

