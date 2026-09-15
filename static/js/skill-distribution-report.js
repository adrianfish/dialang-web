const url = "/api/reports/skill-distribution";
fetch(url)
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get skill distribution data from ${url}: ${r.status}`);
})
.then(data => {

  new Chart(
    document.getElementById("distribution"),
    {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Distribution by Skill',
            data: Object.values(data),
          }
        ]
      },
      options: { 
        scales: {
          y: {
            ticks: {
              stepSize: 1,
            }
          },
        }
      },
    }
  );

})
.catch(error => console.error(error.message));
