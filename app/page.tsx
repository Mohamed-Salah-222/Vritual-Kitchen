import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { ChefHat, Camera, Sparkles, Clock, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0eae3] via-[#ece7e0] to-[#eae4dd]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Main Heading */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-[700] text-gray-900 mb-6 leading-tight">
              Your Kitchen,
              <br />
              <span className="bg-gradient-to-r from-[#372f29] to-[#211b16] bg-clip-text text-transparent">Reimagined by AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Snap a photo of your ingredients and let AI create personalized recipes. No more wondering what is for dinner?</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {userId ? (
              <Link href="/upload">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  Go to Your Kitchen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-[#372f29] to-[#211b16] hover:from-[#211b16] hover:to-[#372f29] shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3 justify-center text-sm text-gray-600">
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5]">✨ AI-Powered</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5]">📸 Image Recognition</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5]">🍳 Personalized Recipes</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5]">🌱 Dietary Filters</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-[#f0eae3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">Three simple steps to discover amazing recipes</p>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-[#372f29] to-[#211b16] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Snap & Upload</h3>
              <p className="text-gray-600 leading-relaxed">Take photos of your fridge, pantry, or ingredients. Upload multiple images at once.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-[#372f29] to-[#211b16] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">2. AI Analyzes</h3>
              <p className="text-gray-600 leading-relaxed">Our AI identifies ingredients, quantities, and organizes them in your virtual kitchen.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-[#372f29] to-[#211b16] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                <ChefHat className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Get Recipes</h3>
              <p className="text-gray-600 leading-relaxed">Receive personalized recipe suggestions based on what you have. Filter by diet, calories, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-[#ece7e0] to-[#e9e3dc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Why Choose Virtual Kitchen?</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#ebe6de] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#ded8c5]">
              <div className="bg-[#ded8c5] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Save Time</h3>
              <p className="text-gray-600">No more scrolling through recipe sites. Get instant suggestions based on what you have.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#ebe6de] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#ded8c5]">
              <div className="bg-[#ded8c5] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Reduce Waste</h3>
              <p className="text-gray-600">Use ingredients before they expire. Track what you have and what you need.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#ebe6de] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#ded8c5]">
              <div className="bg-[#ded8c5] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized</h3>
              <p className="text-gray-600">Filter by dietary restrictions, calories, cuisine type, and cooking time.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#ebe6de] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#ded8c5]">
              <div className="bg-[#ded8c5] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Super Easy</h3>
              <p className="text-gray-600">No manual typing. Just take photos and let AI do the work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#372f29] to-[#211b16]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Cooking?</h2>
          <p className="text-xl text-[#ded8c5] mb-8 max-w-2xl mx-auto">Join thousands of home cooks who never run out of recipe ideas.</p>
          {userId ? (
            <Link href="/upload">
              <Button size="lg" className="text-lg px-8 py-6 bg-[#f0eae3] text-[#211b16] hover:bg-[#ded8c5] shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer">
                Start Cooking Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#211b16] text-[#ded8c5] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/kitchenLogo.png" alt="Kitchen Logo" width={32} height={32} />
            <span className="text-white text-xl font-bold">Virtual Kitchen</span>
          </div>
          <p className="text-sm">© 2025 Virtual Kitchen. Powered by AI. Made with ❤️ for home cooks.</p>
        </div>
      </footer>
    </div>
  );
}
