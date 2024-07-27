import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      // http://localhost:8000/api -> http://localhost:3000/api
      "/api": "http://localhost:3000",
    },
  },
});
