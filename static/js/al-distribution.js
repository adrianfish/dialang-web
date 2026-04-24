const url = "/api/al-distribution";
fetch(url)
.then(r => {
  if (r.ok) {
    return r.json();
  }
  throw new Error(`Failed to get al distribution data from ${url}: ${r.status}`);
})
.then(data => {
  console.log(data);
})
.catch(error => log.error(error.message));
