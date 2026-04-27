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
`;
