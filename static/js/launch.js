fetch("/api/session")
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get session from ${sessionUrl}`);
})
.then(session => {

  dialang.session.id = session.id;
  dialang.session.al = session.al;
  dialang.session.tl = session.tl;
  dialang.session.skill = session.skill;

  dialang.flags.hideVSPT = session.hideVSPT;
  dialang.flags.hideSA = session.hideSA;

  if (!dialang.session.tl) {
    dialang.switchState("legend");
    return;
  } else {
    dialang.navigation.nextRules.tls();
  }
});

