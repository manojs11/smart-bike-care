import { Link, useNavigate } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const navigate = useNavigate();

  const handleHomeSection = (sectionId) => {
    navigate("/");

    setTimeout(() => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 150);
  };

  return (
    <footer className="footer">

      <div className="footer-cta">

        <div className="footer-cta-left">

          <div className="footer-shield">
            🛡️
          </div>

          <div>
            <h3>
              Ready To Take Better Care Of Your Bike?
            </h3>

            <p>
              Join riders who trust Smart Bike Care.
            </p>
          </div>

        </div>

        <Link
          to="/register"
          className="footer-cta-button"
        >
          Get Started Now →
        </Link>

      </div>


      <div className="footer-container">

        <div className="footer-brand">

          <Link
            to="/"
            className="footer-logo"
          >

            <div className="footer-logo-icon">
              🛡️
            </div>

            <div>
              <strong>
                SMART
              </strong>

              <span>
                BIKE CARE
              </span>
            </div>

          </Link>

          <p>
            Smarter care for every ride.
            Keep your bike healthy and ready
            for every journey.
          </p>

          <div className="footer-social">
            <span>f</span>
            <span>◎</span>
            <span>𝕏</span>
            <span>▶</span>
          </div>

        </div>


        <FooterColumn title="Product">

          <Link to="/bikes">
            My Bikes
          </Link>

          <Link to="/bikes/add">
            Add Bike
          </Link>

          <Link to="/service">
            Service
          </Link>

          <Link to="/service-history">
            Service History
          </Link>

        </FooterColumn>


        <FooterColumn title="Bike Care">

          <Link to="/health">
            Bike Health
          </Link>

          <Link to="/reminders">
            Smart Reminders
          </Link>

          <Link to="/documents">
            Documents
          </Link>

          <Link to="/emergency">
            Emergency
          </Link>

        </FooterColumn>


        <FooterColumn title="Dashboard">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/garage">
            Garage Near Me
          </Link>

          <Link to="/profile">
            Profile
          </Link>

          <Link to="/settings">
            Settings
          </Link>

        </FooterColumn>


        <FooterColumn title="Support">

          <button
            type="button"
            onClick={() => handleHomeSection("how-it-works")}
          >
            How It Works
          </button>

          <button
            type="button"
            onClick={() => handleHomeSection("bike-care")}
          >
            Bike Care
          </button>

          <Link to="/contact">
            Contact Us
          </Link>

          <Link to="/help">
            Help Center
          </Link>

        </FooterColumn>


        <FooterColumn title="Contact">

          <a href="mailto:support@smartbikecare.com">
            support@smartbikecare.com
          </a>

          <a href="tel:+919876543210">
            +91 98765 43210
          </a>

          <p>
            Chennai, Tamil Nadu, India
          </p>

        </FooterColumn>

      </div>


      <div className="footer-bottom">
        © 2026 Smart Bike Care System. All rights reserved.
      </div>

    </footer>
  );
}


function FooterColumn({
  title,
  children,
}) {
  return (
    <div className="footer-column">

      <h4>
        {title}
      </h4>

      {children}

    </div>
  );
}


export default Footer;