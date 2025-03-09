import React from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa'; // Replaced FaEnvelope with FaLinkedin

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-6 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:justify-between md:space-y-0">
          {/* Brand */}
          <div className="text-center md:text-left">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
              RealSocial
            </span>
            <p className="text-sm mt-1">© {new Date().getFullYear()} RealSocial. All rights reserved.</p>
          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-6">
            <a
              href="https://instagram.com/realsocial_placeholder" // Placeholder until you provide it
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Instagram"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://x.com/Samadd33"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://www.linkedin.com/in/samuel-oyedeji004"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}