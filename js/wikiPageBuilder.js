
constructWikiHtml = function (index) {


    try {
        var currentWikiInfo = placeInfo[index].wikiData
        var $wikiPictureContainer = $("<div>", {"class":"wiki-picture-container"});
        currentWikiInfo.ImageSearch.forEach(function (imageUrl, i) {
            $wikiPictureContainer.append("<img class='wiki-image' id='" + "image" + i +"' onclick='viewWikiPhoto(this)' src='" + imageUrl +"'>")

        });
        var wikiMainContainer = $("#wikiContainer");
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



viewWikiPhoto = function (id) {
    var $bigWikiPictureBackground = $("<div>", {'class': 'wiki-image-container-background', 'onclick': 'closeWikiPhoto()' })

    var $bigWikiPictureContainer = $("<div>", {id: 'big-wiki-image-container', "class":"big-wiki-image-container"});
    var image = $(id).attr("src")
    $bigWikiPictureContainer.append("<img class='big-wiki-image' src='" + image +  "'>");
    $bigWikiPictureContainer.append($bigWikiPictureBackground)

    $("#upper-container").append($bigWikiPictureContainer)



}
closeWikiPhoto = function () {
    $('#big-wiki-image-container').remove()
}
openGreaterLocationMenu = function () {
    if ($(window).width() < 1366) {
        $("#mainLocationSelectors").toggle()
    }

}

resetPage = function () {
    cancelLocalLocationResponseTimeouts()
    toggleLoaderAnimation.clearCount()
    resetMissingLocationCount();
    removeMissingLocationElement();
    document.getElementById("location-header").classList.remove("invisible");
    document.getElementById("outer-location-container").classList.remove("outer-location-minwidth");
    document.getElementById("localLocationList").style.height = "95%"
    document.getElementById("outer-location-container").classList.remove("portrait-invisible");
    document.getElementById("wikiContainer").classList.remove("portrait-invisible");
}

var toggleWikiWindow = function () {
    $("#wikiContainer").toggle()
}


var closeWelcomeWindow = function () {
    $("#welcomeOverlay").remove()
}





$(window).resize(function () {
    if ($(window).width() > 1366) {
        $("#mainLocationSelectors").show()
    }
})


$(window).load(function () {
    const $welcomeOverlay = $('<div>', {'id':'welcomeOverlay','class':'welcome-overlay'});
    const $welcomeMessageContainer = $('<div>', {'class':'welcome-message-center-container'});
    const $welcomeMessageInnerContainer = $('<div>', {'class':'welcome-message-inner-container'});
    const $welcomeMessageTitle = $('<div>', {'class':'welcome-message-title'});
    const $welcomeMessageContent = $('<div>', {'class':'welcome-message-content'});
    const $welcomeMessageFooter = $('<div>', {'class':'welcome-message-footer'});
    const $welcomeMessageCloseButton = $('<button>', {'id':'closeButton'})



    $welcomeMessageTitle.html("Udacity FSND Neighboorhood Map");
    $welcomeMessageContent.html("Welcome! This javascript application displays most of the many random locations I visited on a recent trip to India to get married. The buttons at the top of the screen represent each city. Clicking on a button will show all the locations visited in that city as well as its wikipedia article.");
    $welcomeMessageCloseButton.html("Got it!")
    $welcomeMessageCloseButton.attr({"onClick": 'closeWelcomeWindow()'})

    $welcomeMessageInnerContainer.append($welcomeMessageTitle).append($welcomeMessageContent).append($welcomeMessageFooter.append($welcomeMessageCloseButton))


    $welcomeOverlay.append($welcomeMessageContainer.append($welcomeMessageInnerContainer))



    $(document.body).prepend($welcomeOverlay)
})

