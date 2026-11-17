const url = "/reports/api/dashboard";
fetch(url)
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get dashboard data from ${url}: ${r.status}`);
})
.then(data => {

  const options = { 
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        }
      },
      x: {
        ticks: {
          stepSize: 1,
        }
      },
    }
  };

  new Chart(
    document.getElementById("al-distribution"),
    {
      type: 'bar',
      data: {
        labels: Object.keys(data.al),
        datasets: [
          {
            label: 'Distribution by Admin Language',
            data: Object.values(data.al),
          }
        ]
      },
      ...options,
    }
  );

  new Chart(
    document.getElementById("tl-distribution"),
    {
      type: 'bar',
      data: {
        labels: Object.keys(data.tl),
        datasets: [
          {
            label: 'Distribution by Test Language',
            data: Object.values(data.tl),
          }
        ]
      },
      ...options,
    }
  );

  new Chart(
    document.getElementById("skill-distribution"),
    {
      type: 'bar',
      data: {
        labels: Object.keys(data.skill),
        datasets: [
          {
            label: 'Distribution by Skill',
            data: Object.values(data.skill),
          }
        ]
      },
      ...options,
    }
  );

  new Chart(
    document.getElementById("estimation"),
    {
      type: 'pie',
      data: {
        labels: Object.keys(data.estimation),
        datasets: [
          {
            label: "Estimation Accuracy",
            data: Object.values(data.estimation),
          }
        ]
      },
    }
  );

})
.catch(error => console.error(error.message));
