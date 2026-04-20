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
    dialang.switchState("legend");
  })
  .catch(error => console.error(error.message));
});
