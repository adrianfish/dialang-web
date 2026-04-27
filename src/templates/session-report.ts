export const sessionReportTemplate = `
<html>
  <head>
  </head>
  <body>
    <h1>Session Report</h1>
    <form id="sessions-form">
    <table>
      <tr>
        <td>From:</td>
        <td><input id="from" name="from" type="datetime-local" /></td>
      </tr>
      <tr>
        <td>To:</td>
        <td><input id="to" name="to" type="datetime-local" /></td>
      </tr>
    </table>
    </form>
    <button type="button" id="display-sessions-button">Display Sessions</button>
    <div id="output">
    </div>
    <script type="module" src="/js/session-report.js"></script>
  </body>
</html>
`;
