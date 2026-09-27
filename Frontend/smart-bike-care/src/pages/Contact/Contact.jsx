import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || !message) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (message.length < 10) {
      setError("Message must contain at least 10 characters.");
      return;
    }

    setSuccess(
      "Your message has been submitted successfully. We will get back to you soon."
    );

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-label">CONTACT US</span>

          <h1>
            How Can We
            <span> Help You?</span>
          </h1>

          <p>
            Have a question about Smart Bike Care? Send us a message
            and our support team will help you.
          </p>
        </div>
      </section>


      <section className="contact-section">

        <div className="contact-container">

          <div className="contact-info">

            <span className="contact-section-label">
              GET IN TOUCH
            </span>

            <h2>
              We are here to help.
            </h2>

            <p>
              Whether you need help managing your bike, understanding
              your service records, or using any Smart Bike Care feature,
              you can contact us.
            </p>


            <div className="contact-info-list">

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  ✉
                </div>

                <div>
                  <h3>Email</h3>
                  <a href="mailto:support@smartbikecare.com">
                    support@smartbikecare.com
                  </a>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  ☎
                </div>

                <div>
                  <h3>Phone</h3>
                  <a href="tel:+919876543210">
                    +91 98765 43210
                  </a>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  📍
                </div>

                <div>
                  <h3>Location</h3>
                  <p>
                    Chennai, Tamil Nadu, India
                  </p>
                </div>

              </div>

            </div>

          </div>


          <div className="contact-form-card">

            <h2>
              Send Us A Message
            </h2>

            <p>
              Fill in the form and we will get back to you.
            </p>


            <form onSubmit={handleSubmit}>

              <div className="contact-form-row">

                <div className="contact-form-group">
                  <label htmlFor="name">
                    Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                  />
                </div>


                <div className="contact-form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

              </div>


              <div className="contact-form-group">

                <label htmlFor="subject">
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What do you need help with?"
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="message">
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  rows="6"
                />

              </div>


              {error && (
                <div className="contact-message contact-error">
                  <span>!</span>
                  <p>{error}</p>
                </div>
              )}


              {success && (
                <div className="contact-message contact-success">
                  <span>✓</span>
                  <p>{success}</p>
                </div>
              )}


              <button
                type="submit"
                className="contact-submit-button"
              >
                Send Message →
              </button>

            </form>

          </div>

        </div>

      </section>


      <section className="contact-bottom">

        <div className="contact-bottom-card">

          <h2>
            Need quick assistance?
          </h2>

          <p>
            Visit our Help Center for answers to common Smart Bike Care
            questions.
          </p>

          <Link
            to="/help"
            className="contact-help-button"
          >
            Visit Help Center →
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Contact;