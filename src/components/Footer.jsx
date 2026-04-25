import { Link } from "react-router-dom";
import { BriefcaseIcon } from "@heroicons/react/24/outline";

function Footer() {
  return (
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BriefcaseIcon className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-bold">TalentMatch AI</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming hiring with artificial intelligence and smart matching.
              </p>
            </div>
            
            <div>
              <h4 className="text-base font-semibold mb-3">Product</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><Link to="/pricing" className="hover:text-white transition">pricing</Link></li>
                <li><Link to="/demo" className="hover:text-white transition">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-semibold mb-3">Company</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base font-semibold mb-3">Legal</h4>
              <ul className="space-y-1.5 text-gray-400 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
                <li><Link to="/security" className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs mb-3 md:mb-0">
              © {new Date().getFullYear()} TalentMatch AI. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm">
              <a href="https://x.com/Hammad_farooq13" className="text-gray-400 hover:text-white transition">Twitter</a>
              <a href="https://www.linkedin.com/in/hammad-farooq13/" className="text-gray-400 hover:text-white transition">LinkedIn</a>
              <a href="https://github.com/hammad-faroq" className="text-gray-400 hover:text-white transition">GitHub</a>
              <a href="https://www.youtube.com/@TalentMatchAI" className="text-gray-400 hover:text-white transition">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
  );
}

export default Footer;