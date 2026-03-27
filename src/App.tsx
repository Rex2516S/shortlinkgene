import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link2, Copy, Check, ExternalLink, ArrowRight } from "lucide-react";

export default function App() {
  const [longUrl, setLongUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;
    
    // 简单的 URL 验证
    try {
      new URL(longUrl.startsWith("http") ? longUrl : `https://${longUrl}`);
    } catch {
      setError("请输入有效的 URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setShortCode("");

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl: longUrl.startsWith("http") ? longUrl : `https://${longUrl}` }),
      });
      
      const data = await response.json();
      if (data.shortCode) {
        setShortCode(data.shortCode);
      } else {
        setError("缩短失败，请重试");
      }
    } catch (err) {
      setError("服务器连接失败");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const fullUrl = `https://892264.xyz/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[24px] shadow-sm p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
            <Link2 size={20} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">892264.xyz 短链接</h1>
        </div>

        <form onSubmit={handleShorten} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="粘贴长链接..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !longUrl}
            className="w-full py-4 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                生成短链接
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 text-sm text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          {shortCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">您的短链接</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-medium text-gray-900 truncate">
                    892264.xyz/{shortCode}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
                      title="复制"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                    <a
                      href={`/${shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600"
                      title="打开"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-400">© 2026 极简工具</span>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">系统运行正常</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
