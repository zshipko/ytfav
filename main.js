// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'z7eSpk1YYS0',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    $('#opt-single-user').on('keydown', function(e){
        if (e.which != 13) return;
        e.preventDefault();
        $("#f").html("");
        $(this).blur();

        initLikes();
    });

    $('#opt-init').click(initLikes);
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    if (event.data == 0) {
        $("#f a.current").next().click(); 
    }
}
function stopVideo() {
    player.stopVideo();
}

var YtUser = function(u){
    this.name = u;
};

YtUser.prototype.url = function(num, kind){
    kind = kind || "favorites";
    num = num || 25;

    return 'http://gdata.youtube.com/feeds/api/users/'+this.name+'/'+kind+'?alt=json&max-results='+num;
};

YtUser.prototype.loadFaves = function(num,recursive){
    var user = this;
    $.getJSON(user.url(), function(data) {   
        $.each(data.feed.entry, function(i, item) {
            if (!item['media$group']['media$player']) return; 
      
            var favItem = new FavItem(item, user);
       
            $('#f').append(favItem.element);
            if ($(".current").length == 0){
                $("#f a:first-of-type").click();
            }
            if(recursive){
                var nextAuthor = new YtUser(item["author"][0]["yt$userId"]["$t"]);
                nextAuthor.loadFaves(25, false);
            }
        }); // end each loop
    }); // end json parsing
};

var FavItem = function(item, user){
    this.item = item;
    this.title = item['title']['$t'];
    this.link = item['media$group']['media$player'][0]['url'].replace("watch?v=", "embed/").split("&")[0];
    var s = this.link.split("/");
    this.id = s[s.length-1];
    this.author = this.favedby = item["author"][0]["yt$userId"]["$t"];
    this.favedby = user;
    this.element = this.makeElem();
};

FavItem.prototype.makeElem = function(item){
    var newLink = $("<a>")
        .data("url", this.link  + "?enablejsapi=1&wmode=opaque")
        .data("id", this.id)
        .attr("title", "Fav'd by " + this.favedby.name)
        .html('<img src="'+this.item['media$group']['media$thumbnail'][0].url+'" width="100%">'+this.title)
        .append("<br>Fav'd by " + this.favedby.name)
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

    return newLink;
        
}

function getUserLikesFromList(users) {
    var per_user = (30-users.length);
    if(per_user<=0)
        per_user = 1;

    users.forEach(function(user, users_i, users){
        var ytuser = new YtUser(user);
        ytuser.loadFaves(per_user, false);
    });  // end forEach users loop
}

function initLikes() {
    $("#player").css("visibility", "visible");
    if($('#opt-users-list-on').is(':checked')) {    // favs of users list
        var users = $('#opt-users-list').val();         // split text into array
        users = users.split(', ');
        getUserLikesFromList(users);    
    } else {        
        var user = new YtUser($('#opt-single-user').val());
        user.loadFaves(25, true);
    }
    
    if($('#opt-shuffle').is(':checked'))  // shuffle videos in list
      $("#f a").shuffle();

 }


$("body").keydown(function(e){
    if (e.which == 40){
        $("#f a.current").next().click();
        e.preventDefault();
    } else if(e.which == 38){
        e.preventDefault();
        $("#f a.current").prev.click();
    }
});


$.fn.shuffle = function() {

    var allElems = this.get(),
        getRandom = function(max) {
            return Math.floor(Math.random() * max);
        },
        shuffled = $.map(allElems, function(){
            var random = getRandom(allElems.length),
                randEl = $(allElems[random]).clone(true)[0];
            allElems.splice(random, 1);
            return randEl;
       });

    this.each(function(i){
        $(this).replaceWith($(shuffled[i]));
    });

    return $(shuffled);

};

$("input[name='users-type']").change(function(){
    var t = $(this).attr("id").slice(0, $(this).attr("id").length-3);
    $("#opt-single-user, #opt-users-list").hide();
    $("#"+t).show();
});

$(document).ready(function(){
   $("input[name='users-type']:checked").click(); 
});

