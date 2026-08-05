import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import logo from "../assets/phish-logo-transparent.png";
import { getAuthUser } from "../lib/api";

import {
  Mail,
  Send,
  Activity,
  GraduationCap,
  ArrowRight,
  LayoutTemplate,
  Gauge
} from "lucide-react";

const steps = [
  {
    icon: Mail,
    title: "Create Campaign",
    description:
      "Pick a target group, set goals, and choose your attack scenario.",
    color: "bg-sky-500",
  },
  {
    icon: Send,
    title: "Send Simulated Emails",
    description:
      "Deliver realistic lures with safe payloads and tracked links.",
    color: "bg-orange-500",
    featured: true,
  },
  {
    icon: Activity,
    title: "Track Behavior",
    description:
      "See opens, clicks, credential submissions, and reports in real time.",
    color: "bg-sky-500",
  },
  {
    icon: GraduationCap,
    title: "Auto-Enroll in Training",
    description:
      "Failed the test? They're enrolled in a 5-minute training instantly.",
    color: "bg-sky-500",
  },
];

const Home = () => {
  const { data: authUser, isPending } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const elements = document.querySelectorAll(".landing-page [data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page relative min-h-[150vh] overflow-hidden bg-[#cfe1ff]">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#95baf4] via-[#bfd7ff] to-[#d9e8ff]" />

        {/* Clouds */}
        <div className="absolute top-0 left-0 w-full h-full opacity-70">
          <div className="absolute w-80 h-28 bg-white rounded-full blur-2xl top-12 left-16" />
          <div className="absolute w-72 h-24 bg-white rounded-full blur-2xl top-24 right-20" />
          <div className="absolute w-96 h-28 bg-white rounded-full blur-3xl top-56 left-1/2 -translate-x-1/2" />
          <div className="absolute w-80 h-28 bg-white rounded-full blur-3xl bottom-56 left-24" />
        </div>
      </div>

      <Navbar />

      <section className="relative z-10 pt-40">

        <div className="max-w-5xl mx-auto px-4 text-center">

          <h1 data-reveal className="text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight text-neutral">
            Simulate phishing attacks.
            <br />
           Train your team. Reduce human risk.
          </h1>

          <p data-reveal className="mt-8 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
           PhishGuard sends realistic phishing simulations to your employees, measures who clicks and auto-enrolls them in bite-size training that actually sticks.
          </p>

          <div data-reveal className="flex justify-center gap-5 mt-10">
            {isPending ? (
              <span className="loading loading-spinner loading-md text-primary" />
            ) : authUser ? (
              <Link to="/dashboard" className="btn btn-neutral rounded-full px-8">
                Open Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-neutral rounded-full px-8">
                  Get Started
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/login"
                  className="btn border-0 bg-white px-8 rounded-full shadow-md"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Dashboard */}
          <div data-reveal="scale" className="relative mt-20 flex justify-center">

            {/* Shadow */}
            <div className="absolute top-10 h-full w-[92%] rounded-[36px] bg-black/20 blur-3xl"></div>

            {/* Dashboard Image */}
<img
  src="/dash.png"
  alt="PhishGuard security overview dashboard"
  className="relative w-full mx-auto rounded-[24px] border border-white/40 shadow-2xl"
/>

          </div>

        </div>

      </section>

      {/* Stats Section */}
<section id="results" className="relative z-20 bg-white py-24 -mt-20">
  <div className="max-w-7xl mx-auto px-6">

    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">

      <div data-reveal className="text-center px-8">
        <h2 className="text-5xl font-bold text-sky-500">70%</h2>
        <p className="mt-3 text-gray-500 text-lg">
          reduction in click rates
        </p>
      </div>

      <div data-reveal style={{ "--reveal-delay": "80ms" }} className="text-center px-8">
        <h2 className="text-5xl font-bold text-sky-500">500+</h2>
        <p className="mt-3 text-gray-500 text-lg">
          phishing templates
        </p>
      </div>

      <div data-reveal style={{ "--reveal-delay": "160ms" }} className="text-center px-8">
        <h2 className="text-5xl font-bold text-sky-500">4M+</h2>
        <p className="mt-3 text-gray-500 text-lg">
          simulations sent
        </p>
      </div>

      <div data-reveal style={{ "--reveal-delay": "240ms" }} className="text-center px-8">
        <h2 className="text-5xl font-bold text-sky-500">1,200+</h2>
        <p className="mt-3 text-gray-500 text-lg">
          security teams
        </p>
      </div>

    </div>

  </div>
</section>

{/* Features Section */}
<section id="how-it-works" className="relative z-20 bg-white py-24 -mt-20">
  <div className="max-w-7xl mx-auto px-6">

    {/* Heading Row */}
    <div data-reveal className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
      <div>
        <h2 className="text-4xl md:text-5xl font-bold text-neutral leading-tight">
          Realistic simulations.
          <br />
          Real behavior change.
        </h2>
        <button className="btn btn-neutral rounded-full px-6 mt-6">
          Get Started
          <ArrowRight size={18} />
        </button>
      </div>

      <p className="text-gray-500 text-lg max-w-sm">
        PhishGuard runs the full loop — from launching a campaign to
        closing the gap with targeted training — so your team gets
        safer with every simulation.
      </p>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const featured = step.featured;

        return (
          <div
            key={i}
            data-reveal
            style={{ "--reveal-delay": `${i * 90}ms` }}
            className={`rounded-3xl p-7 flex flex-col justify-between min-h-[320px] transition-transform hover:-translate-y-1 ${
              featured
                ? "bg-sky-500 text-white shadow-xl shadow-sky-500/30"
                : "bg-gray-50 text-neutral shadow-sm"
            }`}
          >
            <div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                  featured ? "bg-white/20" : "bg-white shadow-sm"
                }`}
              >
                <Icon
                  size={22}
                  className={featured ? "text-white" : "text-sky-500"}
                />
              </div>

              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
            </div>

            <p
              className={`text-sm leading-relaxed ${
                featured ? "text-white/90" : "text-gray-500"
              }`}
            >
              {step.description}
            </p>
          </div>
        );
      })}
    </div>

  </div>
</section>

{/* Everything Section */}
<section id="features" className="relative z-20 bg-white py-24">
  <div className="max-w-7xl mx-auto px-6">

    {/* Heading */}
    <div data-reveal className="text-center mb-14">
      <h2 className="text-4xl md:text-5xl font-bold text-neutral leading-tight">
        Everything security teams need
      </h2>
      <p className="mt-4 text-gray-500 text-lg">
        Enterprise-grade simulation, education, and reporting in one place.
      </p>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          icon: Activity,
          title: "Campaign Analytics",
          description:
            "Funnels, cohorts, and department-level breakdowns updated live.",
        },
        {
          icon: LayoutTemplate,
          title: "Template Library",
          description:
            "500+ curated lures across BEC, credential, malware, and social.",
        },
        {
          icon: Gauge,
          title: "Risk Scoring",
          description:
            "Every employee gets a rolling risk score based on real behavior.",
        },
        {
          icon: GraduationCap,
          title: "Automated Training",
          description:
            "Micro-lessons trigger automatically the moment someone clicks.",
        },
      ].map((item, i) => {
        const Icon = item.icon;
        return (
          <div
            key={i}
            data-reveal
            style={{ "--reveal-delay": `${i * 90}ms` }}
            className="rounded-2xl p-6 bg-gray-50 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center mb-5">
              <Icon size={20} className="text-sky-500" />
            </div>

            <h3 className="text-lg font-bold text-neutral mb-2">
              {item.title}
            </h3>

            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description}
            </p>
          </div>
        );
      })}
    </div>

  </div>
</section>

{/* CTA Section */}
<section className="relative z-20 bg-white py-24">
  <div className="max-w-6xl mx-auto px-6">

    <div data-reveal="scale" className="relative rounded-[40px] overflow-hidden px-8 py-20 md:px-20 md:py-24 text-center">

      {/* Gradient background - echoes hero */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#95baf4] via-[#bfd7ff] to-[#d9e8ff]" />

      {/* Clouds - same motif as hero, smaller/quieter */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute w-72 h-24 bg-white rounded-full blur-2xl -top-6 left-10" />
        <div className="absolute w-64 h-20 bg-white rounded-full blur-2xl top-10 right-10" />
        <div className="absolute w-80 h-24 bg-white rounded-full blur-3xl bottom-0 left-1/2 -translate-x-1/2" />
      </div>

      <div className="relative">

        <div className="inline-flex items-center gap-2 bg-white/60 border border-white/80 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
          <span className="text-sm text-neutral font-medium">
            Trusted by 1,200+ security teams
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-neutral leading-[1.1] tracking-tight">
          Your team's next click
          <br />
          shouldn't cost you.
        </h2>

        <p className="mt-6 text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
          Launch your first phishing simulation in minutes. No credit card,
          no setup calls, no risk to your real inbox.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
          <button className="btn btn-neutral rounded-full px-8">
            Get Started Free
            <ArrowRight size={18} />
          </button>

          <button className="btn bg-white border-0 rounded-full shadow-md px-8">
            Talk to Sales
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Free for teams up to 25 · Cancel anytime
        </p>

      </div>
    </div>

  </div>
</section>

{/* Footer */}
<footer className="relative z-20 bg-gray-100 border-t border-gray-100 py-10">
  <div className="max-w-7xl mx-auto px-6">
    <div data-reveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

      {/* Logo + copyright */}
      <div>
        <div>
          <img
            src={logo}
            alt="PhishGuard"
            className="theme-logo h-11 w-auto object-contain"
          />
          <p className="mt-1 text-[11px] tracking-wider text-gray-400 font-medium">
            SECURITY AWARENESS
          </p>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          © 2026 PhishGuard By Marizu Inc. All rights reserved.
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-gray-600">
        <a href="#" className="hover:text-sky-500 transition-colors">Product</a>
        <a href="#" className="hover:text-sky-500 transition-colors">Pricing</a>
        <a href="#" className="hover:text-sky-500 transition-colors">Docs</a>
        <a href="#" className="hover:text-sky-500 transition-colors">Security</a>
        <a href="#" className="hover:text-sky-500 transition-colors">Contact</a>
      </nav>

      {/* Social icons */}
      {/* Social icons */}
<div className="flex items-center gap-4">
  <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
    </svg>
  </a>
  <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.556-1.113-4.556-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.34-.012 2.42-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  </a>
  <a href="#" className="text-gray-400 hover:text-sky-500 transition-colors">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  </a>
</div>

    </div>
  </div>
</footer>
    </div>
  );
};

export default Home;
