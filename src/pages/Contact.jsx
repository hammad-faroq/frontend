import React, { useState } from "react";
import { Link } from "react-router-dom";
import ReactLogo from "../assets/react-logo.svg"; // ensure this path is correct
import { BriefcaseIcon, ChartBarIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `Message sent!\n\nName: ${form.name}\nEmail: ${form.email}\nMessage: ${form.message}`
    );
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* ---------- Header ---------- */}
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">
            TalentMatch AI
          </h1>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-indigo-600">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-indigo-600">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600">
              Contact
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-indigo-600">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- Animated Background + Form ---------- */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16 pt-28">
        <img
          src={ReactLogo}
          alt="React Logo"
          className="absolute inset-0 m-auto w-[500px] h-[500px] opacity-10 animate-spin-slow pointer-events-none select-none"
        />

        <div className="max-w-xl w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-8 relative z-10">
          <h1 className="text-4xl font-bold text-indigo-600 mb-8 text-center">
            Contact Us
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded hover:bg-indigo-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} TalentMatch AI. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/about" className="hover:text-indigo-600">About</Link>
            <a href="mailto:contact@talentmatch.ai" className="hover:text-indigo-600">
              Email Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
