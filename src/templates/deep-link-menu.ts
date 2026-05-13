export const deepLinkMenu = (data) => `
  <html>
    <head>
    </head>
    <body>
    This is the app's deep linking menu.
    <form action="/api/builddeeplinks" method="POST">
      <input type="hidden" name="platformCode" value="${data.platformCode}" />
      <input type="hidden" name="contextId" value="${data.contextId}" />
      <input type="hidden" name="userId" value="${data.user}" />
      ${data.links.map(l => `<div><input type="checkbox" name="${l.id}" value="${l.id}" />${l.title}</div>`)}
      <button>Submit</button>
    </form>
    </body>
  </html>`;
