export const appConfig = {
  agentName: "AEGIS",
  agentTagline: "Professional voice operations console",
  backendUrl:
    process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "") ||
    "http://localhost:4000",
} as const;
