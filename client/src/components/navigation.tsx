import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Compass, 
  Gamepad2, 
  BarChart3, 
  Plus, 
  User,
  Menu,
  X
} from "lucide-react";
import EnhancedCreatePostDialog from "@/components/enhanced-create-post-dialog";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/explore", label: "Explore", icon: Compass },
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <h1 className="text-2xl font-bold text-coral font-['Poppins'] cursor-pointer">
                  Postora
                </h1>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                        isActive(item.path)
                          ? "text-coral bg-coral/10"
                          : "text-gray-700 hover:text-coral hover:bg-coral/5"
                      }`}>
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setIsCreatePostOpen(true)}
                className="bg-coral hover:bg-coral/90 text-white hidden md:flex"
              >
                <Plus className="w-4 h-4 mr-1" />
                Post
              </Button>
              
              <Avatar className="cursor-pointer">
                <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || "User"} />
                <AvatarFallback className="bg-coral text-white">
                  {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-coral hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <a 
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
                          ? "text-coral bg-coral/10"
                          : "text-gray-700 hover:text-coral hover:bg-coral/5"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                    </a>
                  </Link>
                );
              })}
              <Button
                onClick={() => {
                  setIsCreatePostOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-coral hover:bg-coral/90 text-white mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex flex-col items-center p-2 ${
                  isActive(item.path) ? "text-coral" : "text-gray-400"
                }`}>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </a>
              </Link>
            );
          })}
          <button
            onClick={() => setIsCreatePostOpen(true)}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs">Post</span>
          </button>
        </div>
      </div>

      {/* Create Post Dialog */}
      <EnhancedCreatePostDialog 
        open={isCreatePostOpen} 
        onOpenChange={setIsCreatePostOpen}
      />
    </>
  );
}
