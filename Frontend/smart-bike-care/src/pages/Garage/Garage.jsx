import React from "react";
import { APIProvider } from "@vis.gl/react-google-maps";

import GarageMap from "../../components/GarageMap/GarageMap";

import "./Garage.css";

const API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function Garage() {
  return (
    <div className="garage-page">

      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <div className="garage-page-header">

        <div className="garage-header-content">

          <span className="garage-page-label">
            SMART BIKE CARE
          </span>

          <h1>
            Find Bike Service Centers
          </h1>

          <p>
            Locate trusted bike service centers,
            repair shops and showrooms near you.
          </p>

        </div>

        <div className="garage-header-illustration">
          🏍️
        </div>

      </div>


      {/* ============================================
          API KEY CHECK
      ============================================ */}

      {!API_KEY ? (

        <div className="garage-api-error">

          <div className="garage-api-error-icon">
            🗺️
          </div>

          <h2>
            Google Maps API Key Missing
          </h2>

          <p>
            Add your Google Maps API key to
            the <strong>.env</strong> file.
          </p>

          <code>
            VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
          </code>

        </div>

      ) : (

        /* ============================================
           GOOGLE MAP PROVIDER
        ============================================ */

        <APIProvider
          apiKey={API_KEY}
        >

          <GarageMap />

        </APIProvider>

      )}

    </div>
  );
}

export default Garage;