fetch("/api/session")
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get session from ${sessionUrl}`);
})
.then(session => {

  //var dialang = dialang || {};
  //dialang.session ??= {};
  dialang.session.al = session.al;
  dialang.session.id = session.id;

  dialang.switchState("legend");
});

