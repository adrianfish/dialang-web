import { loggedIntoReports } from "../../utils/utils.ts";

export async function tlDistribution(
  c: Context,
  storage: Storage,
): Promise<Response> {
  if (!loggedIntoReports(c)) return c.redirect("/reportslogin");
  const results = await storage.getTestResults();
  const counts = {};
  results.forEach(r => {
    if (counts[r.tl]) counts[r.tl]++;
    else counts[r.tl] = 1;
  });
  return c.json(counts);
}
