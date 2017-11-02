$(function () {
    var URL = "http://cs260.daviscodesbugs.com:5270";

    loadLinks();

    $("#shorten-btn").click(function () {
        var link = $("#link-input").val();
        if (!link.startsWith("http")) {
            link = "http://" + link;
        }
        if (validURL(link)) {
            $.post(URL, {
                url: link
            }, function (data) {
                console.log("Posted", data);
                loadLinks();
            });
        } else {
            alert("Please enter a valid URL");
        }
        $("#link-input").val("");
    });

    function loadLinks() {
        $.getJSON(URL, function (data) {
            $("#link-list").html("");
            data.forEach(function (link) {

                $("#link-list").append(
                    "<li class='list-group-item'>(" + link.click_count + " clicks) <a href='" + URL + "/" + link.id + "'>" + URL + "/" + link.id + "</a> -> " + link.redirect_url + "</li>"
                );
            });
        });
    }

    function validURL(str) {
        var res = str.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
        if (res == null)
            return false;
        else
            return true;
    }
});
