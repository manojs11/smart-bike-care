import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Help.css";

const faqs = [
  {
    question: "How do I add my bike?",
    answer:
      "Open My Bikes from the dashboard and select Add Bike. Enter your bike details such as brand, model, registration number, purchase date, odometer reading, and image.",
  },
  {
    question: "How can I update my bike's odometer?",
    answer:
      "Open the required bike from My Bikes and update the current odometer reading. The system uses the odometer value to calculate service status.",
  },
  {
    question: "How do I add a service record?",
    answer:
      "Open Service from the dashboard, select your bike, enter the service details and service kilometers, and save the record. The service will then appear in Service History.",
  },
  {
    question: "Where can I see my service history?",
    answer:
      "Open Service History from the dashboard or the footer. You can view the service records associated with your bike.",
  },
  {
    question: "How do Smart Reminders work?",
    answer:
      "Smart Reminders help you keep track of upcoming bike maintenance. The reminder information is based on your bike and its maintenance requirements.",
  },
  {
    question: "Where can I store my bike documents?",
    answer:
      "Open Documents from the dashboard. You can manage your supported bike documents from there.",
  },
  {
    question: "How can I find nearby garages?",
    answer:
      "Open Garage Near Me from the dashboard. The garage feature uses the map service to help locate nearby garages.",
  },
  {
    question: "Where can I manage emergency contacts?",
    answer:
      "Open Emergency from the dashboard to add, update, or remove emergency contacts.",
  },
  {
    question: "How do I update my profile?",
    answer:
      "Open Profile from the dashboard. You can update your available profile information and save the changes.",
  },
  {
    question: "How do I change my application settings?",
    answer:
      "Open Settings from the dashboard to manage the available Smart Bike Care settings.",
  },
];

function Help() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex((currentIndex) =>
      currentIndex === index ? null : index
    );
  };

  return (
    <div className="help-page">

      <section className="help-hero">
        <div className="help-hero-content">

          <span className="help-label">
            HELP CENTER
          </span>

          <h1>
            How Can We
            <span> Help?</span>
          </h1>

          <p>
            Find answers to common questions about Smart Bike Care
            and learn how to use the main features.
          </p>

        </div>
      </section>


      <section className="help-section">

        <div className="help-container">

          <div className="help-intro">

            <span className="help-section-label">
              FREQUENTLY ASKED QUESTIONS
            </span>

            <h2>
              Common Questions
            </h2>

            <p>
              Browse the questions below to quickly understand
              how the Smart Bike Care system works.
            </p>

          </div>


          <div className="faq-list">

            {faqs.map((faq, index) => {

              const isOpen = openIndex === index;

              return (
                <div
                  className={`faq-item ${isOpen ? "open" : ""}`}
                  key={faq.question}
                >

                  <button
                    type="button"
                    className="faq-question"
                    onClick={() => toggleQuestion(index)}
                    aria-expanded={isOpen}
                  >

                    <span>
                      {faq.question}
                    </span>

                    <span className="faq-icon">
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>


                  {isOpen && (
                    <div className="faq-answer">
                      <p>
                        {faq.answer}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>

      </section>


      <section className="help-bottom">

        <div className="help-bottom-card">

          <h2>
            Still need help?
          </h2>

          <p>
            If you could not find the answer you were looking for,
            contact the Smart Bike Care support team.
          </p>

          <Link
            to="/contact"
            className="help-contact-button"
          >
            Contact Us →
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Help;