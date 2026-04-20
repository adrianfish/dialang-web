$('#skipforward').prop('disabled', false).click(function (e) {

    $('#confirm-skip-dialog').dialog('open');
    return false;
});

$.get(`/content/vspt/${dialang.session.al}/${dialang.session.tl}.html`, function (data) {

    $('#content').html(data);

    $('.word').click(function (e) {
        
        var wordId = this.id.substring(0,this.id.indexOf('_'));

        // Indicate this word as answered.
        answered[wordId] = true;

        // Switch the button image appropriately.
        if ($(this).hasClass('valid-button')) {
            $('#' + this.id + '_image').attr('src', '/images/trueselected.gif');
            $('#' + wordId + '_incorrect_image').attr('src', '/images/false.gif');
        } else {
            $('#' + this.id + '_image').attr('src', '/images/falseselected.gif');
            $('#' + wordId + '_correct_image').attr('src', '/images/true.gif');
        }

        // Have we answered all the words?
        var allAnswered = true;
        for (var id in answered) {
            if (answered[id] != true) {
                allAnswered = false;
            }
        }

        if (allAnswered) {
            // All the words have been answered, enable the send and next buttons.
            $('#vspt-send-button').prop('disabled', false);
            $('#next').prop('disabled', false);
        }

        // This will change the colour of the word. The css class is called 'done'.
        $(this).parent().parent().addClass('done');
    });

    $(document).keydown(function (e) {

        if(e.keyCode == '72' && e.ctrlKey) {
            $('#vspt-send-button,#next').prop('disabled', false);
            $('#vspt-table input.correct').prop('checked', true).trigger('click');
            return false;
        } else if(e.keyCode == '76' && e.ctrlKey) {
            $('#vspt-send-button,#next').prop('disabled', false);
            $('#vspt-table input.incorrect').prop('checked', true).trigger('click');
            return false;
        }
    });

    $('#confirm-send-dialog').dialog({
        modal: true,
        width: 'auto',
        autoOpen: false,
        resizable: false
    });

    $('#confirm-send-yes').click(function (e) {

      const formData = new FormData(document.getElementById('vsptform'));
      formData.append("tl", dialang.session.tl);
      formData.append("sessionId", dialang.session.id);

      const url = "/api/scorevspt";
      fetch(url, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
      })
      .then(r => {

        if (r.ok) {
          return r.json();
        }

        throw new Error(`Failed to score VSPT at ${url}`);
      })
      .then(scores => {

        if (scores.redirect) {
          window.location = scores.redirect;
        } else {
          dialang.session.vsptSubmitted = 1;
          dialang.session.vsptMearaScore = scores.mearaScore;
          dialang.session.vsptZScore = scores.zScore;
          dialang.session.vsptLevel = scores.level;
          $('#confirm-send-dialog').dialog('destroy');

          dialang.session.vsptDone[dialang.session.tl] = true;

          $('#save-button').prop('disabled', false);

          dialang.navigation.nextRules.vspt();
        }
      })
      .catch(error => {
        alert(`Failed to submit vspt. Reason: ${error}`);
      });

      return false;
    });

    $('#confirm-send-no').click(function (e) {

        $('#confirm-send-dialog').dialog('close');
        return false;
    });

    $('#vspt-send-button,#next').click(function (e) {

        $('#confirm-send-dialog').dialog('open');
        return false;
    });

    $('#confirm-skip-dialog').dialog({
        modal: true,
        width: 'auto',
        autoOpen: false,
        resizable: false
    });
    $('#confirm-skip-yes').click(dialang.skipVSPT);
    $('#confirm-skip-no').click(function (e) {
        $('#confirm-skip-dialog').dialog('close');
        return false;
    });

    $('#skipforward').click(function (e) {

        $('#confirm-skip-dialog').dialog('open');
        return false;
    });
});
