$(document).ready(function () {

    $('#basketform *').filter(':input').prop('disabled', true);

    var audio = document.getElementById('audio');
    audio.paused = true;
    var playButton = $('#playaudio');

    dialang.startSpinner();

    audio.addEventListener('canplaythrough', function () {

        dialang.stopSpinner();
        playButton.prop('disabled', false);
    }, false);

    audio.addEventListener('playing', function () {
        playButton.find('img').attr('src',`${dialang.baseAssetsUrl}/images/SpkPressedAnimated.gif`);
    }, false);

    audio.addEventListener('ended', function () {

        if (!dialang.session.reviewMode) {
            $('#basketform *').filter(':input').prop('disabled', false);
        }

        playButton.prop('disabled', true).find('img').attr('src',`${dialang.baseAssetsUrl}/images/SpkDisabled.gif`);
    }, false);

    playButton.click(function (e) {

        audio.play();
        return false;
    });
});
