


function loadWikiData(location, markerIndex) {

    var wikiSummaryRequestTimeout = setTimeout(function () {
        placeInfo[markerIndex].wikiData.push('Failed to load Wiki Data')

    }, 2000);
    var wikiRequestTimeout = setTimeout(function () {
        placeInfo[markerIndex].wikiData.summary.push('Failed to load Wiki Data')

    }, 2000);

    function summaryCallback(data) {
        pageId = data.query.pageids[0];
        placeInfo[markerIndex].wikiData.summary.push(data.query.pages[pageId].extract)
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
        }

    });
}

function getWikiImgUrl(wikiImgId, markerIndex) {
    var wikiImageReqURL = setTimeout(function () {
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
        }

    });

}