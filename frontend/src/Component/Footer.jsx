import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">🚖 WageTexi</h3>
            <p className="text-sm mb-4">
              Connecting premium drivers with quality vehicles for daily rental and flexible work arrangements.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition">📘</a>
              <a href="#" className="hover:text-white transition">🐦</a>
              <a href="#" className="hover:text-white transition">📷</a>
              <a href="#" className="hover:text-white transition">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Drivers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Browse Vehicles</a></li>
              <li><a href="#" className="hover:text-white transition">How It Works</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Insurance</a></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Owners</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">List Your Vehicle</a></li>
              <li><a href="#" className="hover:text-white transition">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
              <li><a href="#" className="hover:text-white transition">Resources</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2026 WageTexi. All rights reserved.</p>
            <p>Made with ❤️ by WageTexi Team</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
