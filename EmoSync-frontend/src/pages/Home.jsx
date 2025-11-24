import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faPenFancy,
  faComments,
  faSeedling,
  faArrowRight,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";


// Mock user state - in real app, you'd get this from Redux/Context/Zustand
const useUserStore = () => {
  // Simulate logged in (true) or not logged in (false)
  const isLoggedIn = true; // Change to false to simulate not logged in state
  return { isLoggedIn };
};

// Mock Link component - using regular <a> tag instead of router Link
const Link = ({ to, className, children }) => (
  <a href={to} className={className}>
    {children}
  </a>
);


const Home = () => {
  const { isLoggedIn } = useUserStore();

  const getActionLink = (path) => (isLoggedIn ? path : "/auth/login");

  return (
    <div className="home font-sans">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h2 className="text-h1 font-heading py-2">
                A Warm Conversation
                <br />
                <span className="highlight-text">
                  Turning Loneliness into Comfort
                </span>
              </h2>
              <p className="text-body-lg py-2 max-w-3xl mx-auto">
                In every late night, in every anxious moment, we are here. No
                need to bear it alone, let heart-to-heart connection warm your
                every day
              </p>
              <div className="flex flex-wrap gap-4 hero-actions py-4">
                {/* Primary Button */}
                <button
                  onClick={() =>
                    (window.location.href = getActionLink("/auth/login"))
                  }
                  className="primary-btn bg-white w-full py-4 text-blue-600 text-lg rounded-full shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md"
                >
                  <FontAwesomeIcon icon={faHeart} /> Start Sharing, Find Support
                </button>
                {/* Secondary Button */}
                <button
                  onClick={() =>
                    (window.location.href = getActionLink("/auth/login"))
                  }
                  className="secondary-btn border border-white w-full py-4 text-white text-lg rounded-full bg-white/10  backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-lg hover:bg-white/20 active:translate-y-0 active:shadow-md"
                >
                  <FontAwesomeIcon icon={faPenFancy} /> Record Emotions, Release
                  Feelings
                </button>
              </div>
            </div>

            {/* Robot Icon Area (Glassmorphism) */}
            <div className="text-center flex justify-center items-center hero-image">
              <div className="icon-wrapper">
                <div className="hero-icon">
                  <FontAwesomeIcon
                    icon={faRobot}
                    className="text-9xl text-white/90 relative z-10 drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}

      {/* --------------------- FEATURES SECTION --------------------- */}
      <section className="features-section px-8">
        <div className="features-container">
          {/* Section Header */}
          <div className="text-center mb-16 py-4">
            <h2 className="section-title font-heading text-gray-800 mb-4">
              Our Services
            </h2>
            <p className="section-description font-body text-gray-500 max-w-xl mx-auto">
              Listening to every story with heart, warming every soul with love
            </p>
          </div>

          {/* === 3 FEATURE CARDS === */}
          <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            {/* ---------- CARD 1：Heart-to-Heart Chat (AI Counseling)---------- */}
            <button
              onClick={() =>
                (window.location.href = getActionLink("/auth/login"))
              }
              className="group block p-8 rounded-2xl bg-white shadow-md 
                         hover:shadow-xl hover:-translate-y-1 
                         transition-all duration-300 text-center cursor-pointer"
            >
              <div
                className="mx-auto mb-5 h-14 w-14 flex items-center justify-center 
                           rounded-full bg-gradient-to-br from-purple-500 to-blue-500 
                           text-white text-2xl shadow-sm"
              >
                <FontAwesomeIcon icon={faComments} />
              </div>

              <h4 className="feature-title font-heading text-gray-800 mb-3">
                Heart-to-Heart Chat
              </h4>

              <p className="feature-description font-body text-gray-500 leading-relaxed mb-6">
                Wherever you are, whenever you need, there's always a warm heart
                listening. Share your troubles and receive understanding and
                support
              </p>

              <span
                className="link-text font-body text-blue-600 font-medium inline-flex items-center gap-1
                               group-hover:gap-2 transition-all duration-300"
              >
                Start Chatting <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>

            {/* ---------- CARD 2：Emotional Recording (Mood Tracking) ---------- */}
            <button
              onClick={() =>
                (window.location.href = getActionLink("/auth/login"))
              }
              className="group block p-8 rounded-2xl bg-white shadow-md 
                         hover:shadow-xl hover:-translate-y-1 
                         transition-all duration-300 text-center cursor-pointer"
            >
              <div
                className="mx-auto mb-5 h-14 w-14 flex items-center justify-center 
                           rounded-full bg-gradient-to-br from-green-400 to-yellow-400 
                           text-white text-2xl shadow-sm"
              >
                <FontAwesomeIcon icon={faHeart} />
              </div>

              <h4 className="feature-title font-heading text-gray-800 mb-3">
                Emotional Recording
              </h4>

              <p className="feature-description font-body text-gray-500 leading-relaxed mb-6">
                Every emotion deserves to be recorded and cherished. Let us
                accompany you to observe your inner self and embrace the real
                you
              </p>

              <span
                className="link-text font-body text-blue-600 font-medium inline-flex items-center gap-1
                               group-hover:gap-2 transition-all duration-300"
              >
                Record Mood <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>

            {/* ---------- CARD 3：Soul Growth (Knowledge Learning)  ---------- */}
            <button
              onClick={() =>
                (window.location.href = getActionLink("/knowledge"))
              }
              className="group block p-8 rounded-2xl bg-white shadow-md 
                         hover:shadow-xl hover:-translate-y-1 
                         transition-all duration-300 text-center cursor-pointer"
            >
              <div
                className="mx-auto mb-5 h-14 w-14 flex items-center justify-center 
                           rounded-full bg-gradient-to-br from-purple-500 to-orange-400 
                           text-white text-2xl shadow-sm"
              >
                <FontAwesomeIcon icon={faSeedling} />
              </div>

              <h4 className="feature-title font-heading text-gray-800 mb-3">
                Soul Growth
              </h4>

              <p className="feature-description font-body text-gray-500 leading-relaxed mb-6">
                Stroll through the garden of knowledge, discover your inner
                strength. Every article is a path to a better you
              </p>

              <span
                className="link-text font-body text-blue-600 font-medium inline-flex items-center gap-1
                               group-hover:gap-2 transition-all duration-300"
              >
                Start Exploring <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
