import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import "./GarageMap.css";

const SEARCH_RADIUS = 10000;

const PLACE_FIELDS = [
  "id",
  "displayName",
  "location",
  "formattedAddress",
  "googleMapsURI",
  "nationalPhoneNumber",
  "rating",
  "userRatingCount",
  "businessStatus",
  "regularOpeningHours",
  "currentOpeningHours",
  "websiteURI",
  "primaryTypeDisplayName",
  "types",
  "photos",
];

const DEFAULT_LOCATION = {
  lat: 12.8465,
  lng: 80.0607,
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function getGarageType(place) {
  const types = place.types || [];

  const text =
    `${place.displayName || ""} ${
      place.primaryTypeDisplayName || ""
    } ${types.join(" ")}`.toLowerCase();

  if (
    text.includes("showroom") ||
    text.includes("dealer") ||
    text.includes("dealership")
  ) {
    return "Showroom";
  }

  if (
    text.includes("repair") ||
    text.includes("service") ||
    text.includes("garage")
  ) {
    return "Service Center";
  }

  return "Bike Shop";
}

function getPlacePhoto(place) {
  try {
    if (place.photos && place.photos.length > 0) {
      return place.photos[0].getURI({
        maxWidth: 600,
        maxHeight: 400,
      });
    }
  } catch (error) {
    console.log("Photo error:", error);
  }

  return null;
}

function getPlacePhotos(place) {
  try {
    if (!place.photos) return [];

    return place.photos.slice(0, 8).map((photo) =>
      photo.getURI({
        maxWidth: 1000,
        maxHeight: 700,
      })
    );
  } catch (error) {
    console.log("Photos error:", error);
    return [];
  }
}

function getOpeningHours(place) {
  if (place.currentOpeningHours?.weekdayDescriptions) {
    return place.currentOpeningHours.weekdayDescriptions;
  }

  if (place.regularOpeningHours?.weekdayDescriptions) {
    return place.regularOpeningHours.weekdayDescriptions;
  }

  return [];
}

export default function GarageMap() {
  const places = useMapsLibrary("places");
  const map = useMap();

  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);

  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingGarages, setLoadingGarages] = useState(false);

  const [locationError, setLocationError] = useState("");
  const [garageError, setGarageError] = useState("");

  const [searchText, setSearchText] = useState("");

  const [serviceType, setServiceType] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("10");
  const [ratingFilter, setRatingFilter] = useState("0");
  const [openFilter, setOpenFilter] = useState("all");
  const [sortBy, setSortBy] = useState("nearest");

  const [showFilters, setShowFilters] = useState(false);

  const [actionMessage, setActionMessage] = useState("");

  const [photoIndex, setPhotoIndex] = useState(0);

  /* ==================================================
     CURRENT LOCATION
  ================================================== */

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLoadingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setMapCenter(location);

        if (map) {
          map.panTo(location);
          map.setZoom(14);
        }

        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);

        if (error.code === 1) {
          setLocationError(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          setLocationError(
            "Unable to determine your current location."
          );
        } else if (error.code === 3) {
          setLocationError(
            "Location request timed out."
          );
        } else {
          setLocationError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [map]);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  /* ==================================================
     SEARCH GOOGLE PLACES
  ================================================== */

  const searchNearbyGarages = useCallback(async () => {
    if (!places || !userLocation) {
      return;
    }

    setLoadingGarages(true);
    setGarageError("");

    try {
      const searchQueries = [
        "bike service center",
        "motorcycle service center",
        "two wheeler service center",
        "bike repair shop",
      ];

      const allPlaces = [];

      for (const query of searchQueries) {
        const request = {
          textQuery: query,
          fields: PLACE_FIELDS,
          locationBias: {
            center: userLocation,
            radius: SEARCH_RADIUS,
          },
          maxResultCount: 20,
          rankPreference: "DISTANCE",
          region: "IN",
        };

        const { places: results = [] } =
          await places.Place.searchByText(request);

        allPlaces.push(...results);
      }

      const uniquePlaces = new globalThis.Map();

      allPlaces.forEach((place) => {
        if (place.id) {
          uniquePlaces.set(place.id, place);
        }
      });

      const convertedGarages = Array.from(
        uniquePlaces.values()
      )
        .filter((place) => place.location)
        .map((place) => {
          const lat = place.location.lat();
          const lng = place.location.lng();

          return {
            id: place.id,
            name:
              place.displayName ||
              "Bike Service Center",
            type: getGarageType(place),
            rating: place.rating || 0,
            reviews: place.userRatingCount || 0,
            address:
              place.formattedAddress ||
              "Address unavailable",
            phone:
              place.nationalPhoneNumber || "",
            status:
              place.businessStatus || "",
            openingHours:
              getOpeningHours(place),
            currentOpeningHours:
              place.currentOpeningHours,
            websiteURI:
              place.websiteURI || "",
            googleMapsURI:
              place.googleMapsURI || "",
            primaryTypeDisplayName:
              place.primaryTypeDisplayName || "",
            types: place.types || [],
            image: getPlacePhoto(place),
            photos: getPlacePhotos(place),
            lat,
            lng,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lat,
              lng
            ),
          };
        });

      setGarages(convertedGarages);

      setSelectedGarage((previous) => {
        if (!previous) return null;

        return (
          convertedGarages.find(
            (garage) =>
              garage.id === previous.id
          ) || null
        );
      });
    } catch (error) {
      console.error(
        "Google Places error:",
        error
      );

      setGarageError(
        "Unable to load nearby service centers. Please try again."
      );
    } finally {
      setLoadingGarages(false);
    }
  }, [places, userLocation]);

  useEffect(() => {
    if (places && userLocation) {
      searchNearbyGarages();
    }
  }, [
    places,
    userLocation,
    searchNearbyGarages,
  ]);

  /* ==================================================
     FILTERING
  ================================================== */

  const filteredGarages = useMemo(() => {
    let result = [...garages];

    const search =
      searchText.trim().toLowerCase();

    if (search) {
      result = result.filter((garage) => {
        const searchableText = `
          ${garage.name}
          ${garage.address}
          ${garage.type}
          ${garage.primaryTypeDisplayName}
          ${(garage.types || []).join(" ")}
        `.toLowerCase();

        return searchableText.includes(search);
      });
    }

    if (serviceType !== "all") {
      result = result.filter((garage) => {
        if (serviceType === "service") {
          return garage.type === "Service Center";
        }

        if (serviceType === "repair") {
          const text = `
            ${garage.name}
            ${garage.address}
            ${garage.type}
            ${(garage.types || []).join(" ")}
          `.toLowerCase();

          return (
            text.includes("repair") ||
            text.includes("garage") ||
            text.includes("service")
          );
        }

        if (serviceType === "showroom") {
          return garage.type === "Showroom";
        }

        return true;
      });
    }

    const maxDistance =
      Number(distanceFilter);

    if (maxDistance > 0) {
      result = result.filter(
        (garage) =>
          garage.distance <= maxDistance
      );
    }

    const minimumRating =
      Number(ratingFilter);

    if (minimumRating > 0) {
      result = result.filter(
        (garage) =>
          garage.rating >= minimumRating
      );
    }

    if (openFilter === "operational") {
      result = result.filter(
        (garage) =>
          garage.status === "OPERATIONAL" ||
          garage.status === "OPEN"
      );
    }

    if (sortBy === "nearest") {
      result.sort(
        (a, b) => a.distance - b.distance
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (sortBy === "reviews") {
      result.sort(
        (a, b) => b.reviews - a.reviews
      );
    }

    return result;
  }, [
    garages,
    searchText,
    serviceType,
    distanceFilter,
    ratingFilter,
    openFilter,
    sortBy,
  ]);

  /* ==================================================
     CLEAR FILTERS
  ================================================== */

  const clearFilters = () => {
    setSearchText("");
    setServiceType("all");
    setDistanceFilter("10");
    setRatingFilter("0");
    setOpenFilter("all");
    setSortBy("nearest");
  };

  const hasActiveFilters =
    searchText.trim() !== "" ||
    serviceType !== "all" ||
    distanceFilter !== "10" ||
    ratingFilter !== "0" ||
    openFilter !== "all" ||
    sortBy !== "nearest";

  /* ==================================================
     FOCUS GARAGE
  ================================================== */

  const focusGarageOnMap = (garage) => {
    setSelectedGarage(garage);
    setPhotoIndex(0);

    if (map) {
      map.panTo({
        lat: garage.lat,
        lng: garage.lng,
      });

      map.setZoom(16);
    }

    setTimeout(() => {
      const element =
        document.getElementById(
          `garage-result-${garage.id}`
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  /* ==================================================
     DIRECTIONS
  ================================================== */

  const openDirections = (garage) => {
    const destination = `${garage.lat},${garage.lng}`;

    let url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${encodeURIComponent(
        destination
      )}`;

    if (userLocation) {
      url +=
        `&origin=${encodeURIComponent(
          `${userLocation.lat},${userLocation.lng}`
        )}`;
    }

    window.open(url, "_blank");
  };

  /* ==================================================
     GOOGLE MAPS
  ================================================== */

  const openGoogleMaps = (garage) => {
    if (garage.googleMapsURI) {
      window.open(
        garage.googleMapsURI,
        "_blank"
      );
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${garage.lat},${garage.lng}`
      )}`,
      "_blank"
    );
  };

  /* ==================================================
     COPY ADDRESS
  ================================================== */

  const copyAddress = async (garage) => {
    try {
      await navigator.clipboard.writeText(
        garage.address
      );

      setActionMessage(
        "Address copied successfully."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2500);
    } catch (error) {
      setActionMessage(
        "Unable to copy address."
      );
    }
  };

  /* ==================================================
     SHARE
  ================================================== */

  const shareGarage = async (garage) => {
    const shareUrl =
      garage.googleMapsURI ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${garage.lat},${garage.lng}`
      )}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: garage.name,
          text: `${garage.name}\n${garage.address}`,
          url: shareUrl,
        });

        return;
      }

      await navigator.clipboard.writeText(
        shareUrl
      );

      setActionMessage(
        "Google Maps link copied."
      );

      setTimeout(() => {
        setActionMessage("");
      }, 2500);
    } catch (error) {
      console.log("Share cancelled.");
    }
  };

  /* ==================================================
     WEBSITE
  ================================================== */

  const openWebsite = (garage) => {
    if (!garage.websiteURI) return;

    window.open(
      garage.websiteURI,
      "_blank"
    );
  };

  /* ==================================================
     PHOTOS
  ================================================== */

  const nextPhoto = () => {
    if (!selectedGarage?.photos?.length) {
      return;
    }

    setPhotoIndex(
      (previous) =>
        (previous + 1) %
        selectedGarage.photos.length
    );
  };

  const previousPhoto = () => {
    if (!selectedGarage?.photos?.length) {
      return;
    }

    setPhotoIndex(
      (previous) =>
        (previous -
          1 +
          selectedGarage.photos.length) %
        selectedGarage.photos.length
    );
  };

  /* ==================================================
     MARKER CLICK
  ================================================== */

  const handleMarkerClick = (garage) => {
    focusGarageOnMap(garage);
  };

  return (
    <div className="garage-map-wrapper">

      {/* TOOLBAR */}
      <div className="garage-map-toolbar">

        <div className="garage-search-box">

          <span className="garage-search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search service center, repair shop..."
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />

          {searchText && (
            <button
              className="garage-search-clear"
              onClick={() =>
                setSearchText("")
              }
            >
              ✕
            </button>
          )}

        </div>

        <button
          className={`garage-filter-toggle ${
            showFilters ? "active" : ""
          }`}
          onClick={() =>
            setShowFilters(
              (previous) => !previous
            )
          }
        >
          ⚙ Filters
        </button>

        <button
          className="garage-location-button"
          onClick={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation
            ? "Getting Location..."
            : "📍 Update Location"}
        </button>

      </div>

      {/* FILTERS */}
      {showFilters && (
        <div className="garage-advanced-filters">

          <div className="garage-filter-group">
            <label>Service Type</label>

            <select
              value={serviceType}
              onChange={(e) =>
                setServiceType(
                  e.target.value
                )
              }
            >
              <option value="all">
                All
              </option>

              <option value="service">
                Service Centers
              </option>

              <option value="repair">
                Repair Shops
              </option>

              <option value="showroom">
                Showrooms
              </option>
            </select>
          </div>

          <div className="garage-filter-group">
            <label>Distance</label>

            <select
              value={distanceFilter}
              onChange={(e) =>
                setDistanceFilter(
                  e.target.value
                )
              }
            >
              <option value="2">
                Within 2 km
              </option>

              <option value="5">
                Within 5 km
              </option>

              <option value="10">
                Within 10 km
              </option>
            </select>
          </div>

          <div className="garage-filter-group">
            <label>Minimum Rating</label>

            <select
              value={ratingFilter}
              onChange={(e) =>
                setRatingFilter(
                  e.target.value
                )
              }
            >
              <option value="0">
                Any Rating
              </option>

              <option value="3">
                3+ ⭐
              </option>

              <option value="3.5">
                3.5+ ⭐
              </option>

              <option value="4">
                4+ ⭐
              </option>

              <option value="4.5">
                4.5+ ⭐
              </option>
            </select>
          </div>

          <div className="garage-filter-group">
            <label>Status</label>

            <select
              value={openFilter}
              onChange={(e) =>
                setOpenFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Places
              </option>

              <option value="operational">
                Operational
              </option>
            </select>
          </div>

          <div className="garage-filter-group">
            <label>Sort By</label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
            >
              <option value="nearest">
                Nearest
              </option>

              <option value="rating">
                Highest Rating
              </option>

              <option value="reviews">
                Most Reviews
              </option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="garage-clear-filters"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>
      )}

      {/* LOCATION ERROR */}
      {locationError && (
        <div className="garage-warning">
          ⚠ {locationError}
        </div>
      )}

      {/* GARAGE ERROR */}
      {garageError && (
        <div className="garage-warning">
          ⚠ {garageError}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="garage-map-content">

        {/* MAP */}
        <div className="garage-real-map">

          {/* CURRENT LOCATION BUTTON */}
          <button
            type="button"
            className="garage-map-current-location"
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            title="Go to current location"
            aria-label="Go to current location"
          >
            {loadingLocation ? "⏳" : "📍"}
          </button>

          <Map
            center={mapCenter}
            defaultZoom={13}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            fullscreenControl={true}
            streetViewControl={true}
            mapTypeControl={false}
            mapId="DEMO_MAP_ID"
            style={{
              width: "100%",
              height: "100%",
            }}
          >

            {/* USER LOCATION */}
            {userLocation && (
              <AdvancedMarker
                position={userLocation}
                title="Your Current Location"
              >
                <div className="garage-user-marker">
                  <div className="garage-user-marker-dot"></div>
                </div>
              </AdvancedMarker>
            )}

            {/* GARAGE MARKERS */}
            {filteredGarages.map((garage) => (
              <AdvancedMarker
                key={garage.id}
                position={{
                  lat: garage.lat,
                  lng: garage.lng,
                }}
                title={garage.name}
                onClick={() =>
                  handleMarkerClick(garage)
                }
              >
                <div
                  className={`garage-map-marker ${
                    selectedGarage?.id ===
                    garage.id
                      ? "selected"
                      : ""
                  }`}
                >
                  🛠️
                </div>
              </AdvancedMarker>
            ))}

            {/* INFO WINDOW */}
            {selectedGarage && (
              <InfoWindow
                position={{
                  lat: selectedGarage.lat,
                  lng: selectedGarage.lng,
                }}
                onCloseClick={() =>
                  setSelectedGarage(null)
                }
              >
                <div className="garage-info-window">

                  <strong>
                    {selectedGarage.name}
                  </strong>

                  <div className="garage-info-rating">
                    ⭐{" "}
                    {selectedGarage.rating
                      ? selectedGarage.rating.toFixed(
                          1
                        )
                      : "N/A"}

                    {selectedGarage.reviews >
                      0 &&
                      ` (${selectedGarage.reviews})`}
                  </div>

                  <div className="garage-info-address">
                    {selectedGarage.address}
                  </div>

                  <div className="garage-info-distance">
                    📍{" "}
                    {selectedGarage.distance.toFixed(
                      1
                    )}{" "}
                    km away
                  </div>

                  <div className="garage-info-buttons">

                    <button
                      onClick={() =>
                        focusGarageOnMap(
                          selectedGarage
                        )
                      }
                    >
                      View Details
                    </button>

                    <button
                      onClick={() =>
                        openDirections(
                          selectedGarage
                        )
                      }
                    >
                      Directions
                    </button>

                  </div>

                </div>
              </InfoWindow>
            )}

          </Map>
        </div>

        {/* RESULTS */}
        <div className="garage-results-panel">

          <div className="garage-results-header">

            <div>
              <h3>
                Nearby Bike Service Centers
              </h3>

              <p>
                {filteredGarages.length} result
                {filteredGarages.length !== 1
                  ? "s"
                  : ""}

                {garages.length !==
                  filteredGarages.length &&
                  ` of ${garages.length}`}
              </p>
            </div>

            {loadingGarages && (
              <div className="garage-loading-small">
                Loading...
              </div>
            )}

          </div>

          {/* ACTIVE FILTERS */}
          {hasActiveFilters && (
            <div className="garage-active-filters">

              {searchText && (
                <span className="garage-filter-chip">
                  Search: {searchText}
                </span>
              )}

              {serviceType !== "all" && (
                <span className="garage-filter-chip">
                  {serviceType === "service"
                    ? "Service Center"
                    : serviceType === "repair"
                    ? "Repair Shop"
                    : "Showroom"}
                </span>
              )}

              {distanceFilter !== "10" && (
                <span className="garage-filter-chip">
                  ≤ {distanceFilter} km
                </span>
              )}

              {ratingFilter !== "0" && (
                <span className="garage-filter-chip">
                  ⭐ {ratingFilter}+
                </span>
              )}

              {openFilter ===
                "operational" && (
                <span className="garage-filter-chip">
                  Operational
                </span>
              )}

              <button
                onClick={clearFilters}
                className="garage-clear-chip"
              >
                Clear all
              </button>

            </div>
          )}

          {/* LOADING */}
          {loadingGarages &&
            garages.length === 0 && (
              <div className="garage-loading-card">

                <div className="garage-loading-spinner"></div>

                <h4>
                  Finding nearby service centers...
                </h4>

                <p>
                  Searching Google Maps for bike
                  service centers near you.
                </p>

              </div>
            )}

          {/* EMPTY */}
          {!loadingGarages &&
            filteredGarages.length ===
              0 && (
              <div className="garage-empty-card">

                <div className="garage-empty-icon">
                  🔍
                </div>

                <h4>
                  No service centers found
                </h4>

                <p>
                  Try changing your search or
                  filters.
                </p>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="garage-empty-clear"
                  >
                    Clear Filters
                  </button>
                )}

              </div>
            )}

          {/* GARAGE LIST */}
          <div className="garage-results-list">

            {filteredGarages.map(
              (garage, index) => (
                <div
                  key={garage.id}
                  id={`garage-result-${garage.id}`}
                  className={`garage-result-card ${
                    selectedGarage?.id ===
                    garage.id
                      ? "garage-result-card-selected"
                      : ""
                  }`}
                  onClick={() =>
                    focusGarageOnMap(garage)
                  }
                >

                  {/* IMAGE */}
                  <div className="garage-result-card-image">

                    {garage.image ? (
                      <img
                        src={garage.image}
                        alt={garage.name}
                      />
                    ) : (
                      <div className="garage-result-card-placeholder">
                        🛠️
                      </div>
                    )}

                    {index === 0 &&
                      sortBy ===
                        "nearest" && (
                        <span className="garage-nearest-badge">
                          Nearest
                        </span>
                      )}

                  </div>

                  {/* BODY */}
                  <div className="garage-result-card-body">

                    <div className="garage-result-card-top">

                      <div>

                        <h4>
                          {garage.name}
                        </h4>

                        <span className="garage-result-type">
                          {garage.type}
                        </span>

                      </div>

                      {garage.status ===
                        "OPERATIONAL" && (
                        <span className="garage-operational">
                          Operational
                        </span>
                      )}

                    </div>

                    <div className="garage-result-rating">
                      ⭐{" "}
                      {garage.rating
                        ? garage.rating.toFixed(
                            1
                          )
                        : "N/A"}

                      {garage.reviews > 0 && (
                        <span>
                          {" "}
                          ({garage.reviews})
                        </span>
                      )}
                    </div>

                    <p className="garage-result-address">
                      📍 {garage.address}
                    </p>

                    <p className="garage-result-distance">
                      {garage.distance.toFixed(
                        1
                      )}{" "}
                      km away
                    </p>

                    <div
                      className="garage-result-card-actions"
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        className="garage-call-button"
                        onClick={() => {
                          if (garage.phone) {
                            window.location.href =
                              `tel:${garage.phone}`;
                          }
                        }}
                        disabled={!garage.phone}
                      >
                        📞 Call
                      </button>

                      <button
                        className="garage-direction-button"
                        onClick={() =>
                          openDirections(
                            garage
                          )
                        }
                      >
                        🧭 Directions
                      </button>

                      <button
                        className="garage-details-button"
                        onClick={() =>
                          focusGarageOnMap(
                            garage
                          )
                        }
                      >
                        View Details
                      </button>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      </div>

      {/* DETAILS MODAL */}
      {selectedGarage && (
        <div
          className="garage-details-overlay"
          onClick={() =>
            setSelectedGarage(null)
          }
        >

          <div
            className="garage-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="garage-details-close"
              onClick={() =>
                setSelectedGarage(null)
              }
            >
              ✕
            </button>

            {/* PHOTO */}
            <div className="garage-details-photo">

              {selectedGarage.photos?.length >
              0 ? (
                <img
                  src={
                    selectedGarage.photos[
                      photoIndex
                    ]
                  }
                  alt={selectedGarage.name}
                />
              ) : selectedGarage.image ? (
                <img
                  src={selectedGarage.image}
                  alt={selectedGarage.name}
                />
              ) : (
                <div className="garage-details-photo-placeholder">
                  🛠️
                </div>
              )}

              {selectedGarage.photos?.length >
                1 && (
                <>
                  <button
                    className="garage-photo-prev"
                    onClick={
                      previousPhoto
                    }
                  >
                    ‹
                  </button>

                  <button
                    className="garage-photo-next"
                    onClick={nextPhoto}
                  >
                    ›
                  </button>
                </>
              )}

            </div>

            {/* THUMBNAILS */}
            {selectedGarage.photos?.length >
              1 && (
              <div className="garage-photo-thumbnails">

                {selectedGarage.photos.map(
                  (photo, index) => (
                    <button
                      key={index}
                      className={
                        photoIndex ===
                        index
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setPhotoIndex(index)
                      }
                    >
                      <img
                        src={photo}
                        alt=""
                      />
                    </button>
                  )
                )}

              </div>
            )}

            {/* DETAILS */}
            <div className="garage-details-content">

              <div className="garage-details-title-row">

                <div>

                  <h2>
                    {selectedGarage.name}
                  </h2>

                  <span>
                    {selectedGarage.type}
                  </span>

                </div>

                {selectedGarage.status ===
                  "OPERATIONAL" && (
                  <span className="garage-details-status">
                    Operational
                  </span>
                )}

              </div>

              {/* RATING */}
              <div className="garage-details-rating">

                ⭐{" "}
                {selectedGarage.rating
                  ? selectedGarage.rating.toFixed(
                      1
                    )
                  : "No rating"}

                {selectedGarage.reviews >
                  0 && (
                  <span>
                    {" "}
                    ·{" "}
                    {
                      selectedGarage.reviews
                    }{" "}
                    reviews
                  </span>
                )}

              </div>

              {/* ADDRESS */}
              <div className="garage-details-section">

                <h4>📍 Address</h4>

                <p>
                  {selectedGarage.address}
                </p>

                <small>
                  {selectedGarage.distance.toFixed(
                    1
                  )}{" "}
                  km from your location
                </small>

              </div>

              {/* PHONE */}
              {selectedGarage.phone && (
                <div className="garage-details-section">

                  <h4>📞 Phone</h4>

                  <a
                    href={`tel:${selectedGarage.phone}`}
                  >
                    {selectedGarage.phone}
                  </a>

                </div>
              )}

              {/* OPENING HOURS */}
              <div className="garage-details-section">

                <div className="garage-hours-heading">

                  <h4>
                    🕒 Opening Hours
                  </h4>

                  <span>
                    Google Maps
                  </span>

                </div>

                {selectedGarage.openingHours
                  ?.length > 0 ? (
                  <div className="garage-opening-hours">

                    {selectedGarage.openingHours.map(
                      (day, index) => (
                        <div
                          key={index}
                          className="garage-opening-hour-row"
                        >
                          {day}
                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="garage-no-hours">
                    Opening hours are not
                    available.
                  </p>
                )}

              </div>

              {/* ACTION MESSAGE */}
              {actionMessage && (
                <div className="garage-action-message">
                  ✓ {actionMessage}
                </div>
              )}

              {/* ACTIONS */}
              <div className="garage-details-actions">

                {selectedGarage.phone && (
                  <a
                    className="garage-action-primary"
                    href={`tel:${selectedGarage.phone}`}
                  >
                    📞 Call
                  </a>
                )}

                <button
                  className="garage-action-primary"
                  onClick={() =>
                    openDirections(
                      selectedGarage
                    )
                  }
                >
                  🧭 Directions
                </button>

                <button
                  className="garage-action-primary"
                  onClick={() =>
                    openGoogleMaps(
                      selectedGarage
                    )
                  }
                >
                  🗺 Google Maps
                </button>

              </div>

              {/* SECONDARY ACTIONS */}
              <div className="garage-secondary-actions">

                <button
                  onClick={() =>
                    copyAddress(
                      selectedGarage
                    )
                  }
                >
                  📋 Copy Address
                </button>

                <button
                  onClick={() =>
                    shareGarage(
                      selectedGarage
                    )
                  }
                >
                  ↗ Share
                </button>

                {selectedGarage.websiteURI && (
                  <button
                    onClick={() =>
                      openWebsite(
                        selectedGarage
                      )
                    }
                  >
                    🌐 Website
                  </button>
                )}

              </div>

              <p className="garage-details-note">
                Information is provided by
                Google Maps and may change.
                Verify details before visiting.
              </p>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}