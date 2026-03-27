import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 内存存储：短码 -> 长链接
const urlMap = new Map<string, string>();

// 简单的短码生成器
function generateShortCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: 缩短链接
  app.post("/api/shorten", (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    // 检查是否已存在
    for (const [code, url] of urlMap.entries()) {
      if (url === longUrl) {
        return res.json({ shortCode: code });
      }
    }

    const shortCode = generateShortCode();
    urlMap.set(shortCode, longUrl);
    res.json({ shortCode });
  });

  // 重定向逻辑
  app.get("/:shortCode", (req, res, next) => {
    const { shortCode } = req.params;
    
    // 排除 API 和 Vite 内部路径
    if (shortCode.startsWith("api") || shortCode.includes(".")) {
      return next();
    }

    const longUrl = urlMap.get(shortCode);
    if (longUrl) {
      console.log(`Redirecting ${shortCode} to ${longUrl}`);
      return res.redirect(longUrl);
    }
    
    next();
  });

  // Vite 中间件
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
