import { sessionTableTemplate } from "../templates/report-templates.js";
import { sessionTemplate } from "../templates/report-templates.js";
import { render } from 'https://esm.run/lit-html@1';

document.getElementById("display-sessions-button").addEventListener("click", e => {

  const url = "/api/sessions";
  const body = new FormData(document.getElementById("sessions-form"));
  fetch(url, { method: "POST", body })
  .then(r => {
    if (r.ok) {
      return r.json();
    }
    throw new Error(`Failed to get session data from ${url}: ${r.status}`);
  })
  .then(sessionsData => {

    render(sessionTableTemplate(sessionsData), document.getElementById("output"));
    document.querySelectorAll(".session-button").forEach(b => {

      b.addEventListener("click", e => {

        const sessionId = e.target.dataset.sessionId;
        const sessionData = sessionsData.sessions.find(s => s.sessionId === sessionId);
        render(sessionTemplate(sessionData), document.getElementById("output"));
      });
    });
  })
  .catch(error => console.error(error.message));
});
