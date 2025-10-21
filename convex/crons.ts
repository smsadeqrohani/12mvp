import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to clean up expired matches
crons.interval(
  "expire-old-matches",
  { hours: 1 }, // Run every hour
  internal.matchAdmin.expireOldMatches
);

export default crons;

