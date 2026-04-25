// src/pages/Pricing.jsx
import { CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function Pricing() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Starter",
      price: "Free",
      subtitle: "Perfect for individuals and fresh graduates",
      popular: false,
      button: "Get Started Free",
      features: [
        "Create professional profile",
        "Apply to up to 10 jobs / month",
        "Basic AI job recommendations",
        "Resume upload & parsing",
        "Application tracking dashboard",
        "Email notifications",
        "Community support",
      ],
    },
    {
      name: "Professional",
      price: "$19/mo",
      subtitle: "Best for active job seekers & freelancers",
      popular: true,
      button: "Start 14-Day Trial",
      features: [
        "Unlimited job applications",
        "Advanced AI matching system",
        "Priority job recommendations",
        "Resume score analysis",
        "Skill gap suggestions",
        "Interview preparation tools",
        "Application insights & analytics",
        "Priority support",
        "Cover letter generator",
      ],
    },
    {
      name: "Enterprise",
      price: "$99/mo",
      subtitle: "Designed for recruiters and companies",
      popular: false,
      button: "Contact Sales",
      features: [
        "Unlimited job postings",
        "AI candidate screening",
        "Smart shortlisting system",
        "Team collaboration tools",
        "Interview scheduling",
        "Hiring analytics dashboard",
        "Role-based team access",
        "Dedicated account manager",
        "API integrations",
        "Custom onboarding",
      ],
    },
  ];

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes. You can cancel your subscription anytime without hidden charges.",
    },
    {
      q: "Do you offer refunds?",
      a: "Eligible refund requests are reviewed based on billing cycle and usage.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. Our Professional plan includes a 14-day free trial.",
    },
    {
      q: "Can companies get custom pricing?",
      a: "Yes. Enterprise customers can request custom packages based on hiring volume.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-5">
            <SparklesIcon className="w-4 h-4" />
            Flexible Pricing for Everyone
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5">
            Simple Pricing for Smarter Hiring
          </h1>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you are a student searching for your first opportunity,
            a professional looking for growth, or a company hiring top talent,
            TalentMatch AI has a plan built for you.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl border bg-white shadow-sm p-8 relative hover:shadow-xl transition-all duration-300 ${
                plan.popular
                  ? "border-indigo-500 scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm px-4 py-1 rounded-full font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              <p className="text-gray-500 mb-5">{plan.subtitle}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
              </div>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  plan.popular
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {plan.button}
              </button>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose TalentMatch AI?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                AI Matching
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our smart algorithms match candidates and companies based on
                skills, goals, and culture fit.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Faster Hiring
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reduce screening time, automate tasks, and hire faster with
                intelligent workflows.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Scalable Growth
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Start free and upgrade anytime as your career or company grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="bg-white border rounded-2xl p-6 shadow-sm"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of candidates and employers already using
            TalentMatch AI to transform recruitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-gray-100 transition">
              Start Free
            </button>

            <button 
            onClick={() => navigate("/contact")}
            className="px-8 py-3 border border-white rounded-xl font-bold hover:bg-white/10 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Pricing;