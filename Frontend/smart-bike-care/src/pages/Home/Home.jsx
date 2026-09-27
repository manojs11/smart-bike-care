import { Link } from "react-router-dom";

import heroBike from "../../assets/images/hero-bike.png";

import hondaLogo from "../../assets/images/honda_logo.jpg";
import yamahaLogo from "../../assets/images/yamaha_logo.jpg";
import tvsLogo from "../../assets/images/tvs_logo.jpg";
import bajajLogo from "../../assets/images/bajaj_logo.jpg";
import heroLogo from "../../assets/images/hero_logo.jpg";
import reLogo from "../../assets/images/re_logo.jpg";
import suzukiLogo from "../../assets/images/suzuki_logo.jpg";
import ktmLogo from "../../assets/images/ktm_logo.jpg";

import createAccountImage from "../../assets/images/create-account.png";
import addBikeImage from "../../assets/images/add-bike.png";
import remainderImage from "../../assets/images/remainder.png";
import garageImage from "../../assets/images/garage.png";

import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      <section className="hero">

        <div className="hero-background"></div>

        <div className="hero-container">

          <div className="hero-content">

            <span className="hero-small-title">
              SMART BIKE CARE SYSTEM
            </span>

            <h1>
              Ride More.
              <br />
              <span>Worry Less.</span>
            </h1>

            <p className="hero-description">
              Smart Bike Care keeps your bike's service,
              maintenance and important reminders
              organized in one place.
            </p>

            <div className="hero-features">

              <div className="hero-feature">
                <span>✓</span>
                Service Tracking
              </div>

              <div className="hero-feature">
                <span>✓</span>
                Smart Reminders
              </div>

              <div className="hero-feature">
                <span>✓</span>
                Digital Records
              </div>

            </div>

            <div className="hero-buttons">

              <Link
                to="/register"
                className="primary-btn"
              >
                Get Started
                <span>→</span>
              </Link>

              <a
                href="#services"
                className="secondary-btn"
              >
                Explore Services
              </a>

            </div>

          </div>

          <div className="hero-bike-container">

            <img
              src={heroBike}
              alt="Motorcycle"
              className="hero-bike"
            />

          </div>

        </div>

      </section>


      <section className="quick-features">

        <div className="quick-feature-container">

          <QuickFeature
            icon="🔧"
            title="Service Tracking"
            text="Track all your bike services in one place."
          />

          <QuickFeature
            icon="📄"
            title="Digital Records"
            text="Store bills, documents and service history digitally."
          />

          <QuickFeature
            icon="🔔"
            title="Smart Reminders"
            text="Get notified for due services and renewals."
          />

          <QuickFeature
            icon="📍"
            title="Garage Near You"
            text="Find trusted garages and service centers."
          />

        </div>

      </section>


      <section
        className="services-section"
        id="services"
      >

        <SectionHeading
          label="BIKE CARE MADE SIMPLE"
          title="Everything Your Bike Needs"
          description="Keep your bike healthy with smart maintenance tracking and timely service recommendations."
        />

        <div className="services-container">

          <ServiceCard
            icon="🛢️"
            title="Engine Oil"
            text="Track oil changes and keep your engine ready."
          />

          <ServiceCard
            icon="⛓️"
            title="Chain"
            text="Maintain chain health and performance."
          />

          <ServiceCard
            icon="🛑"
            title="Brakes"
            text="Stay safe with regular brake inspections."
          />

          <ServiceCard
            icon="🛞"
            title="Tyres"
            text="Monitor tyre condition and replacements."
          />

          <ServiceCard
            icon="🔋"
            title="Battery"
            text="Check battery health and replacement."
          />

          <ServiceCard
            icon="💨"
            title="Air Filter"
            text="Clean air filter for a smoother ride."
          />

          <ServiceCard
            icon="⚡"
            title="Spark Plug"
            text="Track spark plug inspections."
          />

          <ServiceCard
            icon="⚙️"
            title="General Service"
            text="Keep your bike in top shape always."
          />

        </div>

        <div className="view-services">

          <Link to="/services">
            View All Services →
          </Link>

        </div>

      </section>


      <section className="smart-care">

        <div className="smart-care-container">

          <div className="smart-care-content">

            <span className="section-label">
              SMART BIKE CARE
            </span>

            <h2>
              Take Better Care
              <br />
              Of Your Bike.
            </h2>

            <p>
              Enter your current odometer reading and
              get smart service recommendations based
              on your bike model, mileage and previous
              service history.
            </p>

            <div className="smart-points">

              <div>
                <span>✓</span>
                Kilometer-based service recommendations
              </div>

              <div>
                <span>✓</span>
                Bike-specific spare parts information
              </div>

              <div>
                <span>✓</span>
                Digital service history
              </div>

              <div>
                <span>✓</span>
                Automatic maintenance reminders
              </div>

            </div>

            <Link
              to="/register"
              className="primary-btn"
            >
              Start Caring For Your Bike →
            </Link>

          </div>


          <div className="health-card">

            <div className="health-bike-header">

              <div className="mini-bike">
                🏍️
              </div>

              <div>

                <span>
                  YOUR BIKE
                </span>

                <h3>
                  Yamaha R15 V4
                </h3>

              </div>

            </div>


            <div className="health-score-section">

              <div className="health-circle">
                <strong>86%</strong>
              </div>

              <div>

                <span>
                  BIKE HEALTH
                </span>

                <h3>
                  Good Condition
                </h3>

                <p>
                  Keep it up!
                </p>

              </div>

            </div>


            <div className="health-list">

              <HealthItem
                icon="🛢️"
                name="Engine Oil"
                status="Service Soon"
                warning
              />

              <HealthItem
                icon="⛓️"
                name="Chain"
                status="Good"
              />

              <HealthItem
                icon="🛑"
                name="Brakes"
                status="Good"
              />

              <HealthItem
                icon="🛞"
                name="Tyres"
                status="Check Soon"
                warning
              />

            </div>

          </div>

        </div>

      </section>


      <section className="brands-section">

        <SectionHeading
          label="BUILT FOR EVERY RIDER"
          title="Popular Bike Brands"
          description="Choose your bike brand and get maintenance information specific to your bike."
        />

        <div className="brands-container">

          <Brand
            name="HONDA"
            logo={hondaLogo}
          />

          <Brand
            name="YAMAHA"
            logo={yamahaLogo}
          />

          <Brand
            name="TVS"
            logo={tvsLogo}
          />

          <Brand
            name="BAJAJ"
            logo={bajajLogo}
          />

          <Brand
            name="HERO"
            logo={heroLogo}
          />

          <Brand
            name="ROYAL ENFIELD"
            logo={reLogo}
          />

          <Brand
            name="SUZUKI"
            logo={suzukiLogo}
          />

          <Brand
            name="KTM"
            logo={ktmLogo}
          />

        </div>

      </section>


      <section
        className="how-it-works"
        id="how-it-works"
      >

        <SectionHeading
          label="HOW IT WORKS"
          title="Get Started In 3 Simple Steps"
          description="Managing your bike maintenance is simple."
          dark
        />

        <div className="steps-container">

          <Step
            image={createAccountImage}
            title="Create Your Account"
            text="Sign up in seconds and create your profile."
          />

          <Step
            image={addBikeImage}
            title="Add Your Bike"
            text="Add your bike details and service history."
          />

          <Step
            image={remainderImage}
            title="Stay Updated"
            text="Get smart reminders and keep your bike healthy."
          />

        </div>

      </section>


      <section
        className="garage-section"
        id="garage"
      >

        <div className="garage-container">

          <div className="garage-image">

            <img
              src={garageImage}
              alt="Find a bike garage near you"
            />

          </div>


          <div className="garage-content">

            <span className="section-label">
              NEED A SERVICE?
            </span>

            <h2>
              Find a Garage
              <br />
              Near You
            </h2>

            <p>
              Find nearby showrooms, service centers
              and trusted mechanics for your bike.
            </p>

            <Link
              to="/garage"
              className="primary-btn"
            >
              Find Garage Near Me →
            </Link>

          </div>

        </div>

      </section>


      <section className="final-cta">

        <div className="final-cta-content">

          <span>
            SMARTER MAINTENANCE STARTS HERE
          </span>

          <h2>
            Ready To Take Better
            <br />
            Care Of Your Bike?
          </h2>

          <p>
            Keep your bike healthy. Track every service.
            Never miss important maintenance.
          </p>

          <Link
            to="/register"
            className="primary-btn"
          >
            Get Started Now →
          </Link>

        </div>

      </section>

    </div>
  );
}


function QuickFeature({
  icon,
  title,
  text
}) {
  return (
    <div className="quick-feature">

      <div className="quick-feature-icon">
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {text}
        </p>

      </div>

    </div>
  );
}


function SectionHeading({
  label,
  title,
  description,
  dark = false
}) {
  return (
    <div
      className={`section-heading ${
        dark ? "dark" : ""
      }`}
    >

      <span>
        {label}
      </span>

      <h2>
        {title}
      </h2>

      {description && (
        <p>
          {description}
        </p>
      )}

    </div>
  );
}


function ServiceCard({
  icon,
  title,
  text
}) {
  return (
    <div className="service-card">

      <div className="service-icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


function HealthItem({
  icon,
  name,
  status,
  warning = false
}) {
  return (
    <div className="health-item">

      <span className="health-item-icon">
        {icon}
      </span>

      <div className="health-item-name">
        {name}
      </div>

      <div
        className={
          warning
            ? "health-status warning"
            : "health-status good"
        }
      >
        {status}
      </div>

    </div>
  );
}


function Brand({
  name,
  logo
}) {
  return (
    <div className="brand">

      <div className="brand-logo">

        <img
          src={logo}
          alt={`${name} logo`}
          className="brand-logo-image"
        />

      </div>

      <strong>
        {name}
      </strong>

    </div>
  );
}


function Step({
  image,
  title,
  text
}) {
  return (
    <div className="step">

      <div className="step-image-wrapper">

        <img
          src={image}
          alt={title}
          className="step-image"
        />

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}


export default Home;