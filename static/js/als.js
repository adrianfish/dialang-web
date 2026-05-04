document.getElementById('al-dropdown').addEventListener("change", e => {

  const url = "/api/setal";
  fetch(url, {
    method: "POST",
    body: new FormData(document.getElementById("als-form")),
  })
  .then(r => {

    if (r.ok) {
      return r.json();
    }

    throw new Error(`Failed to set admin language at ${url}`);
  })
  .then(data => {

    dialang.session.al = data.al;
    dialang.session.id = data.sessionId;

    $.get(`/content/help/${dialang.session.al}.html`, function (helpDialogMarkup) {

      $('#help-dialog').html(helpDialogMarkup);
      $('#help-tabs').tabs();
      $('#help-dialog').dialog({
          modal: true,
          width: 'auto',
          height: 600,
          autoOpen: false,
          resizable: false
      });
    });

    /*
    $.get(`/content/save/${dialang.session.al}.html`, function (saveDialogMarkup) {

      $('#save-dialog').html(saveDialogMarkup);
      $('#save-dialog').dialog({
          modal: true,
          width: 'auto',
          height: 300,
          autoOpen: false,
          resizable: false
      });
    });
    */

    dialang.switchState("legend");
  })
  .catch(error => console.error(error.message));
});
