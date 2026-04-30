import { html, nothing } from 'https://esm.run/lit-html@1';

export const sessionTableTemplate = data => html`
  <h2>${data.label} - (${data.sessions.length})<h2>
  ${data.sessions.length > 0 ? html`
    <table border="1" cellpadding="4">
      <thead>
        <tr>
          <th>ID</th>
          <th>AL</th>
          <th>TL</th>
        </tr>
      </thead>
      ${data.sessions.map(s => html`
      <tr>
        <td>
          <button data-session-id="${s.sessionId}"
              class="session-button"
              title="View this session">
            ${s.sessionId}
          </button>
        </td>
        <td>${s.al}</td>
        <td>${s.tl}</td>
      </tr>
      `)}
    </table>
  `: nothing}
`;

export const sessionTemplate = session => html`
  <h2>Session ${session.sessionId}<h2>
  <h3>Test<h3>
  <table border="1" cellpadding="4">
    <tr>
      <td>ID:</td><td>${session.sessionId}</td>
    </tr>
    <tr>
      <td>AL:</td><td>${session.al}</td>
    </tr>
    <tr>
      <td>TL:</td><td>${session.tl}</td>
    </tr>
    <tr>
      <td>IP:</td><td>${session.ipAddress}</td>
    </tr>
    <tr>
      <td>Referrrer:</td><td>${session.referrer}</td>
    </tr>
    ${session.vsptLevel ? html`
    <tr>
      <td>VSPT Level:</td><td>${session.vsptLevel}</td>
    </tr>
    ` : nothing}
    ${session.saLevel ? html`
    <tr>
      <td>SA Level:</td><td>${session.saLevel}</td>
    </tr>
    ` : nothing}
    ${session.itemLevel ? html`
    <tr>
      <td>Item Level:</td><td>${session.itemLevel}</td>
    </tr>
    ` : nothing}
  </table>
  ${session.questionnaire ? html`
  <h3>Questionnaire</h3>
  <table border="1" cellpadding="4">
    <tr>
      <td>Age Group:</td><td>${session.questionnaire.agegroup}</td>
    </tr>
    <tr>
      <td>Gender:</td><td>${session.questionnaire.gender}</td>
    </tr>
    <tr>
      <td>First Language:</td><td>${session.questionnaire.firstlanguage}</td>
    </tr>
    <tr>
      <td>Nationality:</td><td>${session.questionnaire.nationality}</td>
    </tr>
    <tr>
      <td>Institution:</td><td>${session.questionnaire.institution}</td>
    </tr>
    <tr>
      <td>Reason:</td><td>${session.questionnaire.reason}</td>
    </tr>
    <tr>
      <td>Accuracy:</td><td>${session.questionnaire.accuracy}</td>
    </tr>
    <tr>
      <td>Comments:</td><td>${session.questionnaire.comments}</td>
    </tr>
    <tr>
      <td>Email:</td><td>${session.questionnaire.email}</td>
    </tr>
  </table>
  ` : nothing}
`;
