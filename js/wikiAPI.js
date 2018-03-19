/**
 * @function loadWikiData
 * @description loads wiki article and page image list
 * @param location
 * @param markerIndex
 */

function loadWikiData(location, markerIndex) {

    let wikiSummaryRequestTimeout = setTimeout(function () {

        try {
            placeInfo[markerIndex].wikiData.push('Failed to load Wiki Data')
        } catch (typeError) {

        }


    }, 8000);
    let wikiRequestTimeout = setTimeout(function () {

        try {
            placeInfo[markerIndex].wikiData.summary.push('Failed to load Wiki Data')

        } catch (typeError) {
            $("#wikiContainer").append("Failed To Load Wiki Data")

        }

    }, 8000);

    function summaryCallback(data) {

       let pageId = data.query.pageids[0];
        try {
            placeInfo[markerIndex].wikiData.summary.push(data.query.pages[pageId].extract)

        } catch (typeError) {

        }
    }

    function ImageSearchCallback(data) {
        pageId = data.query.pageids[0];
        imageLocation = data.query.pages[pageId].images;
        imageLocation.forEach(function (image) {
            getWikiImgUrl(image.title, markerIndex)
        })
        //placeInfo[markerIndex].wikiData.ImageSearch.push(data.query.pages[pageId].images)
    }

    $.ajax( {

        url: "https://en.wikipedia.org/w/api.php",
        data: {'action':'query',
            'prop': 'extracts',
            'titles': location,
            'explaintext': true,
            'exintro' : true,
            'indexpageids': true,
            'format': 'json'
        },
        callback: 'wikiCallback',
        dataType: 'jsonp',
        type: 'GET',
        headers: { 'Api-User-Agent': 'Example/1.0'},
        success: function (data) {
            summaryCallback(data);
            clearTimeout(wikiSummaryRequestTimeout);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            ajaxError("Explain Text")
            if (XMLHttpRequest.readyState === 0) {
                ajaxError("Explain Text")
            }

        }

    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        if (XMLHttpRequest.readyState === 0) {
        }

    });
    $.ajax( {

        url: "https://en.wikipedia.org/w/api.php",
        data: {'action':'query',
            'prop': 'images',
            'titles': location,
            'indexpageids': true,
            'format': 'json'
        },
        callback: 'wikiCallback',
        dataType: 'jsonp',
        type: 'GET',
        headers: { 'Api-User-Agent': 'Example/1.0'},
        success: function (data) {
            ImageSearchCallback(data);
            clearTimeout(wikiRequestTimeout);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            if (XMLHttpRequest.readyState === 0) {
                ajaxError("Explain Text Failed to Load")
            }
        }

    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        if (XMLHttpRequest.readyState === 0) {
            ajaxError("Wiki Page Image Data Failed to Load")
        }

    });
}


/**
 * @function getWikiImgUrl
 * @description uses the page image data from loadWikiData to build a URL list for each image
 * @param wikiImgId
 * @param markerIndex
 */

function getWikiImgUrl(wikiImgId, markerIndex) {

    let wikiImageReqURL = setTimeout(function () {
        placeInfo[markerIndex].wikiData.summary.push('Failed to load Wiki Data')

    }, 2000);
    function imageUrlCallback(data){
        pageId = data.query.pageids[0];
        placeInfo[markerIndex].wikiData.ImageSearch.push(data.query.pages[pageId].imageinfo[0].url)
    }


    $.ajax( {

        url: "https://en.wikipedia.org/w/api.php",
        data: {'action':'query',
            'titles': wikiImgId,
            'prop': 'imageinfo',
            'iiprop': 'url',
            'indexpageids': true,
            'format': 'json'
        },
        callback: 'wikiCallback',
        dataType: 'jsonp',
        type: 'GET',
        headers: { 'Api-User-Agent': 'Example/1.0'},
        success: function (data) {
            imageUrlCallback(data);
            clearTimeout(wikiImageReqURL);
        },
        error: function () {
            ajaxError()
        }

    }).fail(function (XMLHttpRequest, textStatus, errorThrown) {
        ajaxError("Image URLs failed")
        if (XMLHttpRequest.readyState === 0) {
            ajaxError("Image URLs failed")
        }

    });

}

