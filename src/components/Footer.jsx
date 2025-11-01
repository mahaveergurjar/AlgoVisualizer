import React from "react";
import { Github, Mail, Heart, Code2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0B0E14] text-gray-400 border-t border-gray-800 backdrop-blur-md">
      {/* Subtle Glow Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 bottom-0 w-72 h-72 bg-blue-600/10 blur-3xl" />
        <div className="absolute right-0 top-0 w-72 h-72 bg-pink-600/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <Code2 className="w-5 h-5 text-blue-400" />
            AlgoVisualizer
          </div>
          <p className="text-sm text-gray-400">
            Interactive algorithm visualization platform for learners and
            developers.
          </p>
          <div className="flex gap-3 pt-2">
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 hover:scale-110 transition-all"
            >
              <Github className="w-4 h-4 text-gray-300" />
            </a>
            <a
              href="mailto:contact@algovisualizer.com"
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 hover:scale-110 transition-all"
            >
              <Mail className="w-4 h-4 text-gray-300" />
            </a>
          </div>
        </div>

        {/* Links + Copyright */}
        <div className="flex flex-col items-center md:items-end text-sm gap-3 text-gray-500">
          <div className="flex gap-6">
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/mahaveergurjar/AlgoVisualizer/blob/main/LICENSE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              MIT License
            </a>
            <a
              href="#privacy"
              className="hover:text-blue-400 transition-colors"
            >
              Privacy
            </a>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            <span>© {currentYear} AlgoVisualizer</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              by{" "}
              <a
                href="https://github.com/mahaveergurjar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mahaveer Gurjar
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
