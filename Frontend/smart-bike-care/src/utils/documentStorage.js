const DOCUMENT_STORAGE_KEY = "smartBikeCare_documents";

export const getAllDocuments = () => {
  try {
    const storedDocuments = localStorage.getItem(DOCUMENT_STORAGE_KEY);

    if (!storedDocuments) {
      return {};
    }

    return JSON.parse(storedDocuments);
  } catch (error) {
    console.error("Failed to load documents:", error);
    return {};
  }
};

export const getBikeDocuments = (bikeId) => {
  const allDocuments = getAllDocuments();

  return allDocuments[String(bikeId)] || {};
};

export const saveBikeDocument = (bikeId, documentType, documentData) => {
  try {
    const allDocuments = getAllDocuments();
    const bikeKey = String(bikeId);

    if (!allDocuments[bikeKey]) {
      allDocuments[bikeKey] = {};
    }

    allDocuments[bikeKey][documentType] = {
      ...documentData,
      type: documentType,
      bikeId,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      JSON.stringify(allDocuments)
    );

    return allDocuments[bikeKey][documentType];
  } catch (error) {
    console.error("Failed to save document:", error);
    return null;
  }
};

export const deleteBikeDocument = (bikeId, documentType) => {
  try {
    const allDocuments = getAllDocuments();
    const bikeKey = String(bikeId);

    if (allDocuments[bikeKey]) {
      delete allDocuments[bikeKey][documentType];

      if (Object.keys(allDocuments[bikeKey]).length === 0) {
        delete allDocuments[bikeKey];
      }
    }

    localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      JSON.stringify(allDocuments)
    );

    return true;
  } catch (error) {
    console.error("Failed to delete document:", error);
    return false;
  }
};

export const clearBikeDocuments = (bikeId) => {
  try {
    const allDocuments = getAllDocuments();

    delete allDocuments[String(bikeId)];

    localStorage.setItem(
      DOCUMENT_STORAGE_KEY,
      JSON.stringify(allDocuments)
    );

    return true;
  } catch (error) {
    console.error("Failed to clear bike documents:", error);
    return false;
  }
};

export const clearAllDocuments = () => {
  try {
    localStorage.removeItem(DOCUMENT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear documents:", error);
    return false;
  }
};

export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) {
    return {
      status: "none",
      label: "No Expiry",
      daysRemaining: null,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${expiryDate}T00:00:00`);

  if (Number.isNaN(expiry.getTime())) {
    return {
      status: "none",
      label: "Invalid Date",
      daysRemaining: null,
    };
  }

  const difference =
    expiry.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      status: "expired",
      label: "Expired",
      daysRemaining,
    };
  }

  if (daysRemaining === 0) {
    return {
      status: "today",
      label: "Expires Today",
      daysRemaining: 0,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "soon",
      label: "Expiring Soon",
      daysRemaining,
    };
  }

  return {
    status: "active",
    label: "Active",
    daysRemaining,
  };
};

export const formatExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return "-";
  }

  const date = new Date(`${expiryDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};