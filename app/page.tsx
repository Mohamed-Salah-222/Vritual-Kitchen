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
      <section className="relative overflow-hidden animate-fadeInUp">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Main Heading */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-[700] text-gray-900 mb-6 leading-tight">
              Your Kitchen
              <br />
              <span className="bg-gradient-to-r from-[#372f29] to-[#211b16] bg-clip-text text-transparent">Reimagined by AI</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Snap a photo of your ingredients and let AI create personalized recipes. No more wondering what is for dinner?</p>
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
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5] hover:shadow-md hover:scale-105 transition-all cursor-default">✨ AI-Powered</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5] hover:shadow-md hover:scale-105 transition-all cursor-default">📸 Image Recognition</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5] hover:shadow-md hover:scale-105 transition-all cursor-default">🍳 Personalized Recipes</span>
            <span className="px-4 py-2 bg-[#ebe6de] rounded-full shadow-sm border border-[#ded8c5] hover:shadow-md hover:scale-105 transition-all cursor-default">🌱 Dietary Filters</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-28 bg-[#f0eae3] animate-fadeInUp">
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

      {/* Feature Showcase Sections */}

      {/* Feature 1: Receipt Scanner */}
      <section className="py-28 bg-[#f0eae3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Left */}
            <div className="  flex items-center justify-center">
              <Image src="/receipt.jpg" alt="Receipt Scanner Feature" width={600} height={600} className="rounded-2xl shadow-xl w-full h-auto object-cover" />
            </div>

            {/* Text Right */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Scan Your Receipt,
                <br />
                Add Everything Instantly
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">Just bought groceries? Take one photo of your receipt and our AI extracts every item automatically. No manual typing, no hassle.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📸</span>
                  <span className="text-gray-700">One photo captures everything</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span className="text-gray-700">Instant AI extraction and organization</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✨</span>
                  <span className="text-gray-700">Automatically categorized by type</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Smart Shopping List */}
      <section className="py-28 bg-[#ebe6de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Left */}
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Never Forget
                <br />
                What You Need
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">Generate smart shopping lists from your favorite recipes. Know exactly what to buy and never waste time wandering the aisles.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <span className="text-gray-700">Auto-generate from any recipe</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <span className="text-gray-700">Organized by grocery sections</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-700">Check off items as you shop</span>
                </li>
              </ul>
            </div>

            {/* Image Right */}
            <div className="bg-[#ded8c5] rounded-2xl aspect-square flex items-center justify-center shadow-xl order-1 md:order-2">
              <p className="text-[#372f29] text-xl font-semibold">Shopping List Visual</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Dietary Filters */}
      <section className="py-28 bg-[#f0eae3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image Left */}
            <div className="bg-[#ded8c5] rounded-2xl aspect-square flex items-center justify-center shadow-xl">
              <p className="text-[#372f29] text-xl font-semibold">Dietary Filters Visual</p>
            </div>

            {/* Text Right */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Your Diet,
                <br />
                Your Rules
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">Vegan? Keto? Gluten-free? Filter recipes instantly to match your dietary needs and preferences. Every suggestion respects your choices.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <span className="text-gray-700">8+ dietary preferences supported</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <span className="text-gray-700">Calorie and cooking time filters</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🍽️</span>
                  <span className="text-gray-700">Cuisine-specific recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 4: Ingredient Tracking */}
      <section className="py-28 bg-[#ebe6de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Left */}
            <div className="order-2 md:order-1">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Know What You Have,
                <br />
                Always
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">Your virtual kitchen keeps track of everything. See what is in stock, what is running low, and what you need to restock - all in one place.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <span className="text-gray-700">Complete inventory overview</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <span className="text-gray-700">Low stock reminders</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-2xl">🗂️</span>
                  <span className="text-gray-700">Organized by category</span>
                </li>
              </ul>
            </div>

            {/* Image Right */}
            <div className=" flex items-center justify-center  order-1 md:order-2">
              <Image src="/kitchen.png" alt="Receipt Scanner Feature" width={600} height={600} className="rounded-2xl shadow-xl w-full h-auto object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 bg-gradient-to-r from-[#372f29] to-[#211b16] animate-fadeInUp">
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
            <Image src="/whiteLogo.png" alt="Kitchen Logo" width={32} height={32} />
            <span className="text-white text-xl font-bold">Virtual Kitchen</span>
          </div>
          <p className="text-sm">© 2025 Virtual Kitchen. Powered by AI. Made with ❤️ for home cooks.</p>
        </div>
      </footer>
    </div>
  );
}
