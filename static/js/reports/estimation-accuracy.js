const url = "/reports/api/estimation-accuracy";
fetch(url)
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get estimation accuracy data from ${url}: ${r.status}`);
})
.then(data => {

  new Chart(
    document.getElementById("distribution"),
    {
      type: 'pie',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: "Estimation Accuracy",
            data: Object.values(data),
          }
        ]
      },
    }
  );

})
.catch(error => console.error(error.message));
