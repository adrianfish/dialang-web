export const login = () => `
<html>
  <head>
  </head>
  <body>
    <h1>Reports Login</h1>
    <form method="POST" action="/reportslogin">
      <span>Password:</span>
      <input type="password" name="password" />
      <div>
        <button>Login</button>
      </div>
    </form>
  </body>
</html>
`;
