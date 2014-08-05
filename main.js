// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'z7eSpk1YYS0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onError
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
    initPlaylist();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    if (event.data == 0) {
        $("#f a.current").next().click(); 
    }
}

// Just go to the next video if something goes wrong
function onError(event) {
    $("#f a.current").next().click(); 
}

function stopVideo() {
    player.stopVideo();
}

var FavItem = function(item){
    this.title = item['title'];
    this.id = item['id'];
    this.link = 'http://www.youtube.com/watch?v=' + this.id;
    if(item['type'] == 'favorites')
        this.byline = '<span style="font-size:12px">Favorited by:</span> ' + item['favorited_by']['name'];
    else
        this.byline = '<span style="font-size:12px">Uploaded by</span> ' + item['uploaded_by']['name']; 
    this.thumb = item['thumb'];       
    this.element = this.makeElem();
};

FavItem.prototype.makeElem = function(item){
    var newLink = $("<a>")
        .data("url", this.link  + "?enablejsapi=1&wmode=opaque&modestbranding=1&autohide=1&iv_load_policy=3")
        .data("id", this.id)
        .attr("title", this.byline)
        .html('<img class="lazy" data-src="'+this.thumb+'" width="100%">'+this.title)
        .append("<br>" + this.byline)
        .click(function(e){
            var $this = $(this);
            $("#f a").removeClass("current");
            $this.addClass("current");
            $('html, body').animate({
                scrollTop: $this.offset().top
            }, 500);
            player.loadVideoById($this.data("id"));
            player.playVideo();
        });
    newLink.find("img").unveil(300);
    return newLink;
        
}

function initPlaylist() {
    $("#player").css("visibility", "visible");
    $("#player").on("focus", function(){ 
        $(document).focus(); 
    });
    // Get .json playlist for this hour
    // # how to append the next hour's playlist during playback (timer goes off on the hour?) so we can play hour to hour seamlessly...

    $.ajax({
        url: "http://theageofmammals.com/secret/youtube/jukebox.php?callback=?",
        datatype: 'jsonp',
        success: function(data){
            data = JSON.parse(data);
            var count = data.length;
            for(var i=0; i<count; i++) {
                var favItem = new FavItem(data[i]);    
                $('#f').append(favItem.element);
                if ($(".current").length == 0){
                    $("#f a:first-of-type").click();
                }                
            }
        }
    });

}

$("html").keydown(function(e){
    if (e.which == 78){
        $("#f a.current").next().click();
        e.preventDefault();
    } else if(e.which == 66){
        e.preventDefault();
        $("#f a.current").prev.click();
    } else if (e.which == 16) {
        e.preventDefault();
        $("#player").toggleClass("bigger");
        if ($("#f").css("visibility") == "hidden"){
            $("#f").css("visibility", "visible");
        } else {
            $("#f").css("visibility", "hidden");
        }
        $("html").click(function(ev){
           if ($("#f").css("visibility") == "hidden"){
               ev.preventDefault();
               $("#f").css("visibility", "visible");
               $("#player").removeClass("bigger");
           }
            
        });

    }
});



/**
 * jQuery Unveil
 * A very lightweight jQuery plugin to lazy load images
 * http://luis-almeida.github.com/unveil
 *
 * Licensed under the MIT license.
 * Copyright 2013 Luís Almeida
 * https://github.com/luis-almeida
 */

;(function($){$.fn.unveil=function(threshold,callback){var $w=$(window),th=threshold||0,retina=window.devicePixelRatio>1,attrib=retina?"data-src-retina":"data-src",images=this,loaded;this.one("unveil",function(){var source=this.getAttribute(attrib);source=source||this.getAttribute("data-src");if(source){this.setAttribute("src",source);if(typeof callback==="function")callback.call(this);}});function unveil(){var inview=images.filter(function(){var $e=$(this),wt=$w.scrollTop(),wb=wt+$w.height(),et=$e.offset().top,eb=et+$e.height();return eb>=wt-th&&et<=wb+th;});loaded=inview.trigger("unveil");images=images.not(loaded);}$w.scroll(unveil);$w.resize(unveil);unveil();return this;};})(window.jQuery||window.Zepto);

