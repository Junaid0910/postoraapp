import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral/10 via-turquoise/10 to-sky/10">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-coral font-['Poppins']">Postora</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-coral hover:bg-coral/90 text-white"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Share Your Journey,
            <br />
            <span className="text-coral">Level Up Your Life</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Combine the best of Instagram and Snapchat with gaming elements. 
            Track your daily posts, build streaks, and unlock new levels in your social journey.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-coral hover:bg-coral/90 text-white text-lg px-8 py-4 rounded-full"
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Postora?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Daily Streaks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Build momentum with daily posting streaks. Keep the fire burning and watch your consistency grow.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-turquoise rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Level Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Each post unlocks a new level in your journey. Visualize your progress with our gaming-inspired map.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track your activities, habits, and preferences. Get insights into your lifestyle patterns.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Social Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with like-minded people, discover public posts, and build your community.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-coral to-plum">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Ready to Level Up Your Social Media Experience?
          </h3>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of users who are already building their streaks and unlocking new levels.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            size="lg"
            className="bg-white text-coral hover:bg-gray-100 text-lg px-8 py-4 rounded-full font-semibold"
          >
            Join Postora Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-2xl font-bold text-coral mb-4">Postora</h4>
          <p className="text-gray-400">
            Share your journey, level up your life.
          </p>
        </div>
      </footer>
    </div>
  );
}
