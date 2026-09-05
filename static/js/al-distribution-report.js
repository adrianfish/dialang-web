const url = "/api/reports/al-distribution";
fetch(url)
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get al distribution data from ${url}: ${r.status}`);
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
            label: 'Distribution by Admin Language',
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
.catch(error => log.error(error.message));
