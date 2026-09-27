import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  createBike,
  getAllBikes,
  updateBike as updateBikeApi,
  deleteBike as deleteBikeApi,
  updateOdometer as updateOdometerApi,
} from "../services/bikeApi";

import { getToken } from "../utils/auth";

const BikeContext = createContext(null);

const SELECTED_BIKE_KEY = "smartBikeCare_selectedBike";

const getStoredSelectedBike = () => {
  try {
    return localStorage.getItem(SELECTED_BIKE_KEY);
  } catch {
    return null;
  }
};

const saveSelectedBike = (bikeId) => {
  try {
    if (bikeId === null || bikeId === undefined) {
      localStorage.removeItem(SELECTED_BIKE_KEY);
    } else {
      localStorage.setItem(
        SELECTED_BIKE_KEY,
        String(bikeId)
      );
    }
  } catch {
    // Ignore localStorage errors
  }
};

const normalizeBike = (bike) => {
  if (!bike) {
    return null;
  }

  return {
    ...bike,

    id: bike.id,

    brand: bike.brand || "",

    model: bike.model || "",

    registrationNumber:
      bike.registrationNumber || "",

    year:
      bike.year !== null &&
      bike.year !== undefined
        ? Number(bike.year)
        : "",

    purchaseDate:
      bike.purchaseDate || "",

    odometer:
      bike.odometer !== null &&
      bike.odometer !== undefined
        ? Number(bike.odometer)
        : 0,

    health:
      bike.health !== null &&
      bike.health !== undefined
        ? Number(bike.health)
        : 100,

    status:
      bike.status || "Good",

    lastService:
      bike.lastService || null,

    nextService:
      bike.nextService !== null &&
      bike.nextService !== undefined
        ? Number(bike.nextService)
        : (Number(bike.odometer) || 0) + 5000,

    imageData:
      bike.imageData || null,

    serviceHistory:
      Array.isArray(bike.serviceHistory)
        ? bike.serviceHistory
        : [],
  };
};

export function BikeProvider({ children }) {
  const [bikes, setBikes] = useState([]);

  const [selectedBikeId, setSelectedBikeId] = useState(
    getStoredSelectedBike()
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * Load bikes only when the user has a token.
   *
   * This prevents the application from making
   * /api/bikes requests before authentication.
   *
   * It also listens for the authentication event
   * fired after login/logout.
   */
  useEffect(() => {
    const handleAuthChange = () => {
      const token = getToken();

      if (token) {
        loadBikes();
      } else {
        clearAllBikes();
        setLoading(false);
      }
    };

    // Check authentication when the application starts.
    handleAuthChange();

    // Listen for login/logout changes.
    window.addEventListener(
      "smartBikeCareAuthChange",
      handleAuthChange
    );

    return () => {
      window.removeEventListener(
        "smartBikeCareAuthChange",
        handleAuthChange
      );
    };
  }, []);

  useEffect(() => {
    if (
      selectedBikeId !== null &&
      selectedBikeId !== undefined
    ) {
      saveSelectedBike(selectedBikeId);
    }
  }, [selectedBikeId]);

  const loadBikes = async () => {
    /*
     * Extra protection:
     * Do not call the backend if there is no JWT.
     */
    if (!getToken()) {
      clearAllBikes();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getAllBikes();

      const backendBikes =
        Array.isArray(response.data)
          ? response.data.map(normalizeBike)
          : [];

      setBikes(backendBikes);

      const storedId =
        getStoredSelectedBike();

      if (
        storedId &&
        backendBikes.some(
          (bike) =>
            String(bike.id) ===
            String(storedId)
        )
      ) {
        setSelectedBikeId(storedId);
      } else if (
        backendBikes.length > 0
      ) {
        setSelectedBikeId(
          backendBikes[0].id
        );

        saveSelectedBike(
          backendBikes[0].id
        );
      } else {
        setSelectedBikeId(null);
        saveSelectedBike(null);
      }
    } catch (err) {
      console.error(
        "Load bikes error:",
        err
      );

      /*
       * If the backend rejected the token,
       * api.js will handle the 401/403 and
       * remove the authentication data.
       */
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load bikes."
      );

      setBikes([]);
    } finally {
      setLoading(false);
    }
  };

  const setSelectedBike = (bikeId) => {
    if (
      bikeId === null ||
      bikeId === undefined
    ) {
      setSelectedBikeId(null);
      saveSelectedBike(null);
      return;
    }

    const exists = bikes.some(
      (bike) =>
        String(bike.id) ===
        String(bikeId)
    );

    if (!exists) {
      return;
    }

    setSelectedBikeId(bikeId);
    saveSelectedBike(bikeId);
  };

  const selectedBike =
    bikes.find(
      (bike) =>
        String(bike.id) ===
        String(selectedBikeId)
    ) || null;

  const addBike = async (bikeData) => {
    setError("");

    const requestData = {
      brand: bikeData.brand?.trim(),

      model: bikeData.model?.trim(),

      registrationNumber:
        bikeData.registrationNumber
          ?.trim()
          .toUpperCase(),

      year: Number(bikeData.year),

      purchaseDate:
        bikeData.purchaseDate,

      odometer:
        Number(bikeData.odometer),

      imageData:
        bikeData.imageData || null,
    };

    console.log(
      "Sending Create Bike Request:",
      requestData
    );

    try {
      const response =
        await createBike(
          requestData
        );

      const newBike =
        normalizeBike(
          response.data
        );

      setBikes((previous) => [
        newBike,
        ...previous,
      ]);

      setSelectedBikeId(
        newBike.id
      );

      saveSelectedBike(
        newBike.id
      );

      return newBike;
    } catch (err) {
      console.error(
        "Create bike API error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to add bike."
      );

      throw err;
    }
  };

  const updateBike = async (
    bikeId,
    bikeData
  ) => {
    setError("");

    const existingBike =
      bikes.find(
        (bike) =>
          String(bike.id) ===
          String(bikeId)
      );

    const requestData = {
      brand:
        bikeData.brand?.trim(),

      model:
        bikeData.model?.trim(),

      registrationNumber:
        bikeData.registrationNumber
          ?.trim()
          .toUpperCase(),

      year: Number(
        bikeData.year ??
          existingBike?.year
      ),

      purchaseDate:
        bikeData.purchaseDate ??
        existingBike?.purchaseDate,

      odometer: Number(
        bikeData.odometer ??
          existingBike?.odometer
      ),

      imageData:
        bikeData.imageData ??
        existingBike?.imageData ??
        null,
    };

    try {
      const response =
        await updateBikeApi(
          bikeId,
          requestData
        );

      const updatedBike =
        normalizeBike(
          response.data
        );

      setBikes((previous) =>
        previous.map((bike) =>
          String(bike.id) ===
          String(bikeId)
            ? updatedBike
            : bike
        )
      );

      return updatedBike;
    } catch (err) {
      console.error(
        "Update bike API error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update bike."
      );

      throw err;
    }
  };

  const deleteBike = async (
    bikeId
  ) => {
    setError("");

    try {
      await deleteBikeApi(
        bikeId
      );

      const remainingBikes =
        bikes.filter(
          (bike) =>
            String(bike.id) !==
            String(bikeId)
        );

      setBikes(
        remainingBikes
      );

      if (
        String(selectedBikeId) ===
        String(bikeId)
      ) {
        if (
          remainingBikes.length > 0
        ) {
          setSelectedBikeId(
            remainingBikes[0].id
          );

          saveSelectedBike(
            remainingBikes[0].id
          );
        } else {
          setSelectedBikeId(
            null
          );

          saveSelectedBike(
            null
          );
        }
      }
    } catch (err) {
      console.error(
        "Delete bike API error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete bike."
      );

      throw err;
    }
  };

  const updateOdometer = async (
    bikeId,
    odometer
  ) => {
    setError("");

    const currentBike =
      bikes.find(
        (bike) =>
          String(bike.id) ===
          String(bikeId)
      );

    const newOdometer =
      Number(odometer);

    if (
      !Number.isFinite(
        newOdometer
      )
    ) {
      throw new Error(
        "Odometer must be a valid number."
      );
    }

    if (
      currentBike &&
      newOdometer <
        Number(
          currentBike.odometer
        )
    ) {
      throw new Error(
        "Odometer cannot be reduced."
      );
    }

    try {
      const response =
        await updateOdometerApi(
          bikeId,
          newOdometer
        );

      const updatedBike =
        normalizeBike(
          response.data
        );

      setBikes((previous) =>
        previous.map((bike) =>
          String(bike.id) ===
          String(bikeId)
            ? updatedBike
            : bike
        )
      );

      return updatedBike;
    } catch (err) {
      console.error(
        "Update odometer API error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update odometer."
      );

      throw err;
    }
  };

  const getBikeById = (
    bikeId
  ) => {
    return (
      bikes.find(
        (bike) =>
          String(bike.id) ===
          String(bikeId)
      ) || null
    );
  };

  const addServiceToBike =
    async () => {
      console.warn(
        "addServiceToBike is not connected yet. Use the Service API integration."
      );
    };

  const clearAllBikes = () => {
    setBikes([]);
    setSelectedBikeId(null);
    saveSelectedBike(null);
  };

  const value = {
    bikes,

    loading,

    error,

    selectedBikeId,

    selectedBike,

    setSelectedBike,

    loadBikes,

    addBike,

    updateBike,

    deleteBike,

    updateOdometer,

    getBikeById,

    addServiceToBike,

    clearAllBikes,
  };

  return (
    <BikeContext.Provider
      value={value}
    >
      {children}
    </BikeContext.Provider>
  );
}

export function useBikes() {
  const context =
    useContext(BikeContext);

  if (!context) {
    throw new Error(
      "useBikes must be used inside BikeProvider"
    );
  }

  return context;
}

export default BikeContext;

