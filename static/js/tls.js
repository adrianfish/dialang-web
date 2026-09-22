// We need to do this in case this isn't the first run
dialang.session.reviewBasket = null;
dialang.session.reviewItemId = null;
dialang.session.feedbackMode = false;
dialang.session.testDone = false;

if (!dialang.flags.hideALS) {
  $('#skipback').prop('disabled', false).click(function (e) {

    dialang.switchState('als');
    return false;
  });
}

$('#back').prop('disabled', false).click(function (e) {
  return dialang.navigation.backRules.tls();
});


$.get(`/content/tls/${dialang.session.al}.html`, function (data) {

  $('#content').html(data);

  document.getElementById("resume-test-button").addEventListener("click", e => {

    const token = document.getElementById("save-token-field").value;
    const formData = new FormData();
    formData.append("token", token);
    fetch("/api/resumesession", {
      method: "POST",
      body: formData,
    })
    .then(r => {

      if (r.ok) {
        return r.json();
      }

      throw new Error("Network error while resuming session");
    })
    .then(session => {

      dialang.session.al = session.al;
      dialang.session.tl = session.tl;
      dialang.session.skill = session.skill;
      dialang.session.vsptDone ??= {};
      dialang.session.vsptDone[session.tl] = !!session.vsptSubmitted;
      dialang.session.vsptLevel = session.vsptLevel;
      dialang.session.vsptMearaScore = session.vsptMearaScore;
      dialang.session.saDone = session.saSubmitted;
      session.scoredBaskets.forEach(sb => dialang.utils.configureScoredBasket(sb));
      dialang.session.loading = true;
      dialang.session.currentBasketId = session.currentBasketId;
      dialang.switchState('test');
    });
  });

  $('#disclaimer-dialog').dialog({
    modal: true,
    width: 'auto',
    resizable: false
  });

  $('#disclaimer-button').click(function (e) {

    $('#disclaimer-dialog').dialog('destroy');
    return false;
  });

  $('#confirm-dialog').dialog({
    modal: true,
    width: 'auto',
    autoOpen: false,
    resizable: false
  });

  $('#confirm-no').click(function (e) {

    $('#confirm-dialog').dialog('close');
    return false;
  });

  $.get(`/content/save/${dialang.session.al}.html`, function (saveDialogMarkup) {

    $('#save-dialog').html(saveDialogMarkup);
    $('#save-dialog').dialog({
        modal: true,
        title: saveDialogTitle,
        width: 'auto',
        height: 300,
        autoOpen: false,
        resizable: false
    });
  });

  $('.tls-link').click(function () {

    var langskill = $(this).attr('title');
    var tl = $(this).attr('tl');
    var skill = $(this).attr('skill');

    $('#confirmation_langskill').html(langskill);
    $('#confirm-yes').off('click').click(function (e) {

      const formData = new FormData();
      formData.append("tl", tl);
      formData.append("skill", skill);

      const url = "/api/settl";
      fetch(url, {
        method: "POST",
        body: formData,
      })
      .then(r => {

        if (r.ok) {
          return r.json();
        }

        throw new Error(`Failed to set test language at ${url}`);
      })
      .then(data => {

        dialang.session = { ...dialang.session, tl: data.tl, skill: data.skill, baskets: [], itemToBasketMap: {}, items: [], subskills: {} };
        $('#confirm-dialog').dialog('destroy');

        // If the vspt hasn't been done yet for this test language, switch
        // to the vsptintro screen.
        if (!dialang.session.vsptDone.hasOwnProperty(tl)) {
          dialang.navigation.nextRules.tls();
        } else {
          // Pretend we are already on the vspt feedback screen
          dialang.navigation.nextRules.vsptfeedback();
        }
      })
      .catch(error => {

        alert(`Failed to set test language and skill. Reason: ${error}`);
        $('#confirm-dialog').dialog('destroy');
      });

      return false;
    });
    $('#confirm-dialog').dialog('open');
    return false;
  }); // tls-link click

  // Disable the completed tests
  var testsDone = dialang.session.testsDone;

  if (testsDone) {
    testsDone.forEach(function (test) {

      $('#' + test)
        .off('click')
        .attr('href','')
        .children('img')
        .attr('src',`/images/done.gif`);
    });
  }
});
