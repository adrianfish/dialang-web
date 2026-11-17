export const skillDistributionReportTemplate = `
<html>
  <head>
    <script src="/lib/chart.umd.min.js"></script>
  </head>
  <body>
    <h1>Distribution by Skill</h1>
    <div style="width: 800px;"><canvas id="distribution"></canvas></div>
    <script src="/js/reports/skill-distribution.js"></script>
  </body>
</html>
`;
