export async function alDistribution(
  c: Context,
  storage: Storage,
): Promise<Response> {
  const results = await storage.getTestResults();
  const counts = {};
  results.forEach(r => {
    if (counts[r.al]) counts[r.al]++;
    else {
      counts[r.al] = 1;
    }
  });
  console.log(counts);
  return c.json(counts);
}
