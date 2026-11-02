export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { runAccountJobs } = await import("./lib/auth/jobs");
    const timer = setInterval(() => { void runAccountJobs().catch(() => console.error("Account background job failed")); }, 60000);
    timer.unref();
  }
}
