document.addEventListener("DOMContentLoaded", function () {
    var video = document.querySelector("#videoElement");
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err0r) {
                console.log("Something went wrong!");
            });
    }
});