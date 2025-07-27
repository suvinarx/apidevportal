import { Search, LogIn } from "lucide-react";
import Image from "next/image";

export default function DashboardHeader() {

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <header className="w-full bg-white fixed top-0 z-50 shadow">
      <div className="max-w-[1700px] mx-auto">
        {/* Top bar - only icons */}
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center space-x-4">
            <LogIn className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200" onClick={logout}/>
            <Search className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200" />
          </div>
        </div>

        {/* Bottom bar - Logo and title */}
        <div className="flex items-end justify-between px-6 pb-4">
          {/* Logo + Label */}
          <div className="flex items-center space-x-4">
            <Image
              src="/images/logo/logo.png" // Replace with your logo path
              alt="Logo"
              width={150}
              height={150}
            />
            <span className="text-xl font-bold text-gray-800">API Developer Portal</span>
          </div>

          {/* Right side is now empty */}
          <div />
        </div>
      </div>
    </header>
  );
}
