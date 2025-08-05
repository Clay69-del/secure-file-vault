import React from "react";
import {
  FiShield,
  FiLock,
  FiUsers,
  FiGlobe,
  FiAward,
  FiCode,
} from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Alex Chen",
      role: "Security Architect",
      bio: "10+ years in cryptographic systems and zero-knowledge protocols",
      expertise: "End-to-End Encryption",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Cloud Infrastructure Lead",
      bio: "Former cloud security specialist at major tech companies",
      expertise: "Distributed Systems",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      role: "Frontend Engineer",
      bio: "Specializes in secure client-side applications and privacy UX",
      expertise: "Secure Web Applications",
      photo: "https://randomuser.me/api/portraits/men/75.jpg",
    },
    {
      id: 4,
      name: "Priya Patel",
      role: "Compliance Officer",
      bio: "Ensures we meet global data protection standards",
      expertise: "GDPR & Compliance",
      photo: "https://randomuser.me/api/portraits/women/68.jpg",
    },
  ];

  const securityFeatures = [
    {
      icon: <FiLock size={32} className="text-primary-600" />,
      title: "End-to-End Encryption",
      description:
        "Your data is encrypted before it leaves your device and only you hold the keys",
    },
    {
      icon: <FaGoogle size={28} className="text-primary-600" />,
      title: "Secure Authentication",
      description:
        "Google Sign-In integration with OAuth 2.0 and multi-factor authentication",
    },
    {
      icon: <FiShield size={32} className="text-primary-600" />,
      title: "Zero-Knowledge Architecture",
      description: "We never have access to your unencrypted data or passwords",
    },
    {
      icon: <FiGlobe size={32} className="text-primary-600" />,
      title: "Global Infrastructure",
      description: "Geo-redundant storage with 99.99% uptime guarantee",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Secure by Design, Private by Default
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We built SecureCloud because we believe privacy shouldn't be
            optional. Our platform ensures your files remain truly private with
            military-grade encryption that even we can't access.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <div className="flex items-center mb-1">
                <FiAward className="text-yellow-500 mr-2" size={24} />
                <span className="text-2xl font-bold text-gray-900">4.9/5</span>
              </div>
              <small className="text-gray-600">Security Rating</small>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <FiUsers className="text-primary-600 mr-2" size={24} />
                <span className="text-2xl font-bold text-gray-900">250K+</span>
              </div>
              <small className="text-gray-600">Trusted Users</small>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <FiCode className="text-green-600 mr-2" size={24} />
                <span className="text-2xl font-bold text-gray-900">100%</span>
              </div>
              <small className="text-gray-600">Open Source Core</small>
            </div>
          </div>
        </div>
        <div>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
              alt="Security visualization"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Security Principles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every architectural decision begins with security first. Here's what
            makes SecureCloud different:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center h-full"
            >
              <div className="mb-4">{feature.icon}</div>
              <h5 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h5>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-12 mb-20 bg-gray-50 rounded-2xl">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted Technologies
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage industry-standard cryptographic libraries and
              protocols
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { name: "AES-256", description: "Encryption standard" },
              { name: "RSA-4096", description: "Key exchange" },
              { name: "TLS 1.3", description: "Secure transport" },
              { name: "OAuth 2.0", description: "Authentication" },
              { name: "SHA-3", description: "Hashing algorithm" },
            ].map((tech, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center min-w-fit"
              >
                <div className="font-bold text-primary-600 text-lg">
                  {tech.name}
                </div>
                <small className="text-gray-600">{tech.description}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Security Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experts in cryptography, distributed systems, and privacy-preserving
            technologies
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h5>
                <p className="text-primary-600 text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                <div className="flex items-center">
                  <FiShield className="mr-2 text-gray-400" size={14} />
                  <small className="text-gray-600">{member.expertise}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 mb-12 bg-primary-50 rounded-2xl">
        <div className="text-center px-6 py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Experience True Security?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of security-conscious users who trust their data with
            SecureCloud
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium rounded-lg transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
