// src/components/AppLayout.jsx
import { Globe, Shield, Zap, Users, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function AppHeader({ onAddCatalog }) {
  return (
    <header className="border-b border-gray-200/60 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Developer Portal</h1>
              <p className="text-xs text-gray-500">API Management Hub</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Collaborative</span>
              </div>
            </div>

            {onAddCatalog && (
              <Button
                onClick={onAddCatalog}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Catalog
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-gray-200/60 bg-white/80 mt-12">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Developer Portal</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Streamline API management with our comprehensive catalog platform.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                <Github className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                <Twitter className="w-6 h-6" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 hover:bg-gray-100">
                <Linkedin className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Resources</h3>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Contact</h3>
            <ul className="space-y-1.5 text-xs text-gray-600">
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  support@portal.dev
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/60 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-500">© 2024 Developer Portal. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}