import { loggedIntoReports } from "../../utils/utils.ts";

export async function alDistribution(
  c: Context,
  storage: Storage,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");
  const results = await storage.getTestResults();
  const counts = {};
  results.forEach(r => {
    if (counts[r.al]) counts[r.al]++;
    else counts[r.al] = 1;
  });
  return c.json(counts);
}
