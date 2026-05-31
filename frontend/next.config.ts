import type { NextConfig } from "next";

const APONTAMENTO_URL = process.env.NEXT_PUBLIC_APONTAMENTO_API_URL || "http://localhost:8084";
const PROJETO_URL = process.env.NEXT_PUBLIC_PROJETO_API_URL || "http://localhost:8082";
const TASK_URL = process.env.NEXT_PUBLIC_TASK_API_URL || "http://localhost:8085";
const USUARIO_URL = process.env.NEXT_PUBLIC_USUARIO_API_URL || "http://localhost:8083";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/horas/:path*",
          destination: `${APONTAMENTO_URL}/horas/:path*`,
        },
        {
          source: "/api/projeto/:path*",
          destination: `${PROJETO_URL}/projeto/:path*`,
        },
        {
          source: "/api/tarefas/:path*",
          destination: `${TASK_URL}/tarefas/:path*`,
        },
        {
          source: "/api/usuario/:path*",
          destination: `${USUARIO_URL}/usuario/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
