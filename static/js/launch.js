const params = new URLSearchParams(document.location.search);
const ltik = params.get("ltik");

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
  dialang.session.baskets = {};
  dialang.session.itemToBasketMap = {};
  dialang.session.items = [];
  dialang.session.subskills = {};

  dialang.session.ltik = ltik;

  dialang.flags.hideVSPT = session.hideVSPT;
  dialang.flags.hideSA = session.hideSA;

  dialang.flags.skipQuestionnaire = true;

  if (!dialang.session.tl) {
    dialang.switchState("legend");
    return;
  } else {
    dialang.navigation.nextRules.tls();
  }
});

