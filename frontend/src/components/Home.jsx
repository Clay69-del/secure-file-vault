import React from "react";
import { Link } from "react-router-dom";
import {
  FiLock,
  FiUploadCloud,
  FiShield,
  FiGlobe,
  FiClock,
  FiUsers,
  FiPlay,
  FiChevronRight,
  FiStar,
  FiCheck,
  FiArrowRight,
  FiZap,
  FiEye,
  FiDownload,
} from "react-icons/fi";

const Home = () => {
  const features = [
    {
      icon: <FiLock size={28} className="text-purple-600" />,
      title: "End-to-End Encryption",
      description:
        "Military-grade encryption protects your files before they leave your device. Only you hold the decryption keys.",
      gradient: "from-purple-500 to-purple-700",
    },
    {
      icon: <FiUploadCloud size={28} className="text-blue-600" />,
      title: "Seamless File Management",
      description:
        "Drag, drop, and organize with our intuitive interface. Support for all file types and sizes.",
      gradient: "from-blue-500 to-blue-700",
    },
    {
      icon: <FiShield size={28} className="text-green-600" />,
      title: "Secure Sharing",
      description:
        "Share files with encrypted links, password protection, and expiration dates for complete control.",
      gradient: "from-green-500 to-green-700",
    },
    {
      icon: <FiGlobe size={28} className="text-indigo-600" />,
      title: "Global Access",
      description:
        "Access your files from anywhere in the world with our global CDN and offline sync capabilities.",
      gradient: "from-indigo-500 to-indigo-700",
    },
    {
      icon: <FiClock size={28} className="text-orange-600" />,
      title: "Version History",
      description:
        "Never lose work again. Track changes and restore any version of your files with one click.",
      gradient: "from-orange-500 to-orange-700",
    },
    {
      icon: <FiUsers size={28} className="text-pink-600" />,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with real-time collaboration tools and permission management.",
      gradient: "from-pink-500 to-pink-700",
    },
  ];

  const stats = [
    { number: "10M+", label: "Files Protected", icon: FiShield },
    { number: "500K+", label: "Active Users", icon: FiUsers },
    { number: "99.9%", label: "Uptime", icon: FiZap },
    { number: "256-bit", label: "Encryption", icon: FiLock },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager at TechCorp",
      avatar: "👩‍💼",
      content:
        "Secure File Vault has transformed how our team handles sensitive documents. The security features give us complete peace of mind.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Freelance Designer",
      avatar: "👨‍🎨",
      content:
        "The interface is incredibly intuitive, and the file sharing capabilities are exactly what I needed for client work.",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Small Business Owner",
      avatar: "👩‍💻",
      content:
        "Finally, a cloud storage solution that prioritizes privacy without sacrificing functionality. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-pink-800/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Your Files,
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Absolutely Secure
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the next generation of cloud storage with
              military-grade encryption, seamless collaboration, and privacy
              that never compromises.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <span>Start Free Today</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <button className="group flex items-center space-x-3 px-8 py-4 border-2 border-white/20 text-white hover:bg-white/10 rounded-full transition-all duration-300">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <FiPlay className="w-4 h-4 ml-1" />
                </div>
                <span className="font-medium">Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <Icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm lg:text-base">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Secure File Vault?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with privacy-first principles and packed with powerful
              features to keep your digital life secure and organized.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users who trust Secure File Vault with their
              most important files.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Secure Your Files?
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
            Join millions of users who trust Secure File Vault with their most
            valuable data. Start your free account today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="group px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <span className="flex items-center space-x-2">
                <span>Get Started Free</span>
                <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <div className="flex items-center space-x-4 text-purple-100">
              <div className="flex items-center space-x-2">
                <FiCheck className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCheck className="w-5 h-5" />
                <span>5GB free storage</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
