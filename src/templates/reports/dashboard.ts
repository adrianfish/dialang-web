export const dashboardTemplate = `
<html>
  <head>
    <script src="/lib/chart.umd.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/css/dialang-reports.css" media="all"/>
  </head>
  <body>
    <h1>Dialang Dashboard</h1>
    <div id="dashboard-panels">
      <div>
        <div class="chart-title">
          <h2>Administration Language</h2>
        </div>
        <div class="chart"><canvas id="al-distribution"></canvas></div>
      </div>
      <div>
        <div class="chart-title">
          <h2>Test Language</h2>
        </div>
        <div class="chart"><canvas id="tl-distribution"></canvas></div>
      </div>
      <div>
        <div class="chart-title">
          <h2>Skill</h2>
        </div>
        <div class="chart"><canvas id="skill-distribution"></canvas></div>
      </div>
      <div>
        <div class="chart-title">
          <h2>Estimation Accuracy</h2>
          <i>Comparing SA Level to Test Level</i>
        </div>
        <div class="chart"><canvas id="estimation"></canvas></div>
      </div>
    </div>
    <script src="/js/reports/dashboard.js"></script>
  </body>
</html>
`;

