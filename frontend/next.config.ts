import type { NextConfig } from "next";

const USUARIO_SERVICE_URL = process.env.USUARIO_SERVICE_URL || "http://localhost:8083";
const PROJETO_SERVICE_URL = process.env.PROJETO_SERVICE_URL || "http://localhost:8082";
const HORAS_SERVICE_URL = process.env.HORAS_SERVICE_URL || "http://localhost:8084";
const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || "http://localhost:8085";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/usuario/:path*",
        destination: `${USUARIO_SERVICE_URL}/usuario/:path*`,
      },
      {
        source: "/api/dashboard/:path*",
        destination: `${USUARIO_SERVICE_URL}/dashboard/:path*`,
      },
      {
        source: "/api/projeto/:path*",
        destination: `${PROJETO_SERVICE_URL}/projeto/:path*`,
      },
      {
        source: "/api/horas/:path*",
        destination: `${HORAS_SERVICE_URL}/horas/:path*`,
      },
      {
        source: "/api/tarefas/:path*",
        destination: `${TASK_SERVICE_URL}/tarefas/:path*`,
      },
      {
        source: "/api/historico/:path*",
        destination: `${TASK_SERVICE_URL}/historico/:path*`,
      },
      {
        source: "/api/auditoria/:path*",
        destination: `${HORAS_SERVICE_URL}/auditoria/:path*`,
      },
    ];
  },
};

export default nextConfig;
