var put_story_on_board = function (story) {
    var storyElement = $('.story#' + story.id);
    if (storyElement.length == 0) {
        storyElement = $('<li class="story" id="' + story.id + '"></li>');
        storyElement.append(story.label);
        storyElement.append('<br><a href="#">delete</a>')
        storyElement.show('drop');
        var closeElement = storyElement.children('a');
        closeElement.click(function () {
            $.ajax({
                url:'api/story/' + story.id,
                type:'DELETE',
                dataType:'json',
                error:function (data) {
                    $('#error-message').html('<p>' + data.responseText + '</p>');
                }
            })
        });
    } else {
        storyElement.detach();
    }
    $('#' + story.state).append(storyElement);
    return storyElement;
};
var fetch_and_create_stories = function () {
    $.getJSON('api/stories.json', function (data) {
        for (var i in data.stories) {
            put_story_on_board(data.stories[i]);
        }
    });
};
var add_story_button = function () {
    var addStory = $('#add-story');
    addStory.button();
    addStory.click(function () {
        $.ajax({
            url:'api/story/' + $('#add-story-text').val(),
            type:'PUT',
            dataType:'json',
            error:function (data) {
                $('#error-message').html('<p>' + data.responseText + '</p>');
            }
        })
    });
}
var make_states_columns_sortable = function () {
    $('.state').sortable({
        connectWith:".state"
    }).disableSelection();
    $('.state').droppable({
        drop:function (event, ui) {
            $.ajax({
                url:'api/story/' + $(event.srcElement).attr('id') + '/' + this.id,
                type:'POST',
                error:function (data) {
                    $('#error-message').html('<p>' + data.responseText + '</p>');
                }
            })
        }
    });
};
var verify_web_socket = function () {
    if (!window.WebSocket) {
        window.WebSocket = window.MozWebSocket;
        if (!window.WebSocket)
            alert("WebSocket not supported by this browser");
    }
}
var activate_web_socket = function () {
    var onerror = function () {
    };
    var onopen = function () {
        $('#network-status').toggleClass('connected').html('connected');
    };
    var onmessage = function (m) {
        var action = $.parseJSON(m.data);
        $.each(action, function (index, story) {
            put_story_on_board(story);
        });
    };
    var onclose = function () {
        $('network-status').toggleClass('connected').html('disconnected');
        this.ws = null;
    };
    var location = document.location.toString().replace('http://', 'ws://').replace('#', '') + 'ws';
    this.ws = new WebSocket(location, 'kanban');
    this.ws.onerror = onerror;
    this.ws.onopen = onopen;
    this.ws.onmessage = onmessage;
    this.ws.onclose = onclose;
};
$(function () {
    add_story_button();
    make_states_columns_sortable();
    fetch_and_create_stories();
    verify_web_socket();
    activate_web_socket();
});
