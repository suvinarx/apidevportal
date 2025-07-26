import { ChevronDown, MapPin, Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DashboardHeader() {
  return (
    <header className="w-full bg-white fixed top-0 z-50 shadow">
      <div className="max-w-[1700px] mx-auto">
        {/* Top bar - SHOP, DONATE, and icons */}
        <div className="flex items-center justify-end px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-semibold text-sm">
              SHOP
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-semibold text-sm">
              DONATE
            </Button>
            <LogIn className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200" />
            <MapPin className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200" />
            <Button
              variant="outline"
              className="px-3 py-1 text-sm font-semibold border-gray-300 bg-transparent hover:border-[#006b50] hover:text-[#006b50] transition-colors duration-200"
            >
              ES
            </Button>
            <Search className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#006b50] transition-colors duration-200" />
          </div>
        </div>

        {/* Bottom bar - Logo on left, menu on right */}
        <div className="flex items-end justify-between px-6 pb-4">
          {/* Logo */}
          <div className="">
            <Image
              src="/images/logo/logo.png" // Replace with your logo path
              alt="Logo"
              width={150}
              height={150}
            />
          </div>

          {/* Navigation menu aligned to right */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-1 cursor-pointer group">
              <span className="font-semibold text-gray-800 group-hover:text-[#006b50] transition-colors duration-200 group-hover:underline decoration-[#006b50] underline-offset-4 decoration-2">
                Discover
              </span>
              <ChevronDown className="w-6 h-46 text-gray-800 group-hover:text-[#006b50] transition-colors duration-200" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer group">
              <span className="font-semibold text-gray-800 group-hover:text-[#006b50] transition-colors duration-200 group-hover:underline decoration-[#006b50] underline-offset-4 decoration-2">
                Get Involved
              </span>
              <ChevronDown className="w-6 h-46 text-gray-800 group-hover:text-[#006b50] transition-colors duration-200" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer group">
              <span className="font-semibold text-gray-800 group-hover:text-[#006b50] transition-colors duration-200 group-hover:underline decoration-[#006b50] underline-offset-4 decoration-2">
                Cookies
              </span>
              <ChevronDown className="w-6 h-46 text-gray-800 group-hover:text-[#006b50] transition-colors duration-200" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer group">
              <span className="font-semibold text-gray-800 group-hover:text-[#006b50] transition-colors duration-200 group-hover:underline decoration-[#006b50] underline-offset-4 decoration-2">
                Support Us
              </span>
              <ChevronDown className="w-6 h-46 text-gray-800 group-hover:text-[#006b50] transition-colors duration-200" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer group">
              <span className="font-semibold text-gray-800 group-hover:text-[#006b50] transition-colors duration-200 group-hover:underline decoration-[#006b50] underline-offset-4 decoration-2">
                Members
              </span>
              <ChevronDown className="w-6 h-46 text-gray-800 group-hover:text-[#006b50] transition-colors duration-200" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
