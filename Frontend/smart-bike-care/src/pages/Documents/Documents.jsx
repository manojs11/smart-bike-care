import React, { useEffect, useMemo, useState } from "react";
import { useBikes } from "../../context/BikeContext";
import {
  getDocuments,
  saveDocument as saveDocumentApi,
  deleteDocument as deleteDocumentApi,
} from "../../services/documentApi";
import "./Documents.css";

const documentTypes = [
  {
    id: "rc",
    title: "Registration Certificate",
    shortTitle: "RC",
    description: "Official registration document for your bike.",
    icon: "📄",
    color: "orange",
    required: true,
  },
  {
    id: "insurance",
    title: "Bike Insurance",
    shortTitle: "Insurance",
    description: "Keep your active bike insurance policy available.",
    icon: "🛡️",
    color: "green",
    required: true,
  },
  {
    id: "pollution",
    title: "Pollution Certificate",
    shortTitle: "PUC",
    description: "Store your Pollution Under Control certificate.",
    icon: "🌱",
    color: "blue",
    required: false,
  },
  {
    id: "licence",
    title: "Driving Licence",
    shortTitle: "Licence",
    description: "Keep your driving licence information available.",
    icon: "🪪",
    color: "purple",
    required: true,
  },
];

const emptyFormData = {
  registrationNumber: "",
  ownerName: "",
  registrationDate: "",
  vehicleDetails: "",
  policyNumber: "",
  insuranceProvider: "",
  startDate: "",
  insuranceExpiryDate: "",
  certificateNumber: "",
  testDate: "",
  pollutionExpiryDate: "",
  emissionDetails: "",
  licenceNumber: "",
  holderName: "",
  issueDate: "",
  licenceExpiryDate: "",
};

const getExpiryStatus = (dateString) => {
  if (!dateString) {
    return {
      status: "none",
      daysRemaining: null,
      label: "No expiry",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${dateString}T00:00:00`);
  expiry.setHours(0, 0, 0, 0);

  const daysRemaining = Math.ceil(
    (expiry.getTime() - today.getTime()) / 86400000
  );

  if (daysRemaining < 0) {
    return {
      status: "expired",
      daysRemaining,
      label: `Expired ${Math.abs(daysRemaining)} days ago`,
    };
  }

  if (daysRemaining === 0) {
    return {
      status: "today",
      daysRemaining: 0,
      label: "Expires today",
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: "soon",
      daysRemaining,
      label: `${daysRemaining} days left`,
    };
  }

  return {
    status: "active",
    daysRemaining,
    label: `${daysRemaining} days left`,
  };
};

const formatExpiryDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDateValue = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.substring(0, 10);
  }

  return "";
};

function Documents() {
  const {
    bikes,
    selectedBike,
    selectedBikeId,
    setSelectedBike,
  } = useBikes();

  const [documents, setDocuments] = useState({});
  const [activeDocument, setActiveDocument] = useState(null);

  const [formData, setFormData] = useState({
    ...emptyFormData,
  });

  const [documentFile, setDocumentFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ---------------------------------------------------------
   * DOCUMENT HELPERS
   * ---------------------------------------------------------
   */

  const getDocumentExpiryDate = (document) => {
    if (!document) {
      return "";
    }

    if (document.type === "insurance") {
      return getDateValue(document.insuranceExpiryDate);
    }

    if (document.type === "pollution") {
      return getDateValue(document.pollutionExpiryDate);
    }

    if (document.type === "licence") {
      return getDateValue(document.licenceExpiryDate);
    }

    return "";
  };

  const getDocumentExpiry = (document) => {
    return getExpiryStatus(getDocumentExpiryDate(document));
  };

  const getExpiryText = (document) => {
    const expiryDate = getDocumentExpiryDate(document);

    if (!expiryDate) {
      return "No expiry date";
    }

    return formatExpiryDate(expiryDate);
  };

  /*
   * ---------------------------------------------------------
   * LOAD DOCUMENTS FROM SPRING BOOT
   * ---------------------------------------------------------
   */

  const loadDocuments = async (bikeId) => {
    if (!bikeId) {
      setDocuments({});
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getDocuments(Number(bikeId));

      const list = Array.isArray(response?.data)
        ? response.data
        : [];

      const documentMap = {};

      list.forEach((document) => {
        if (document?.type) {
          documentMap[document.type] = document;
        }
      });

      setDocuments(documentMap);
    } catch (err) {
      console.error("Load documents error:", err);

      setDocuments({});

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load documents. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedBikeId) {
      setDocuments({});
      return;
    }

    loadDocuments(selectedBikeId);
  }, [selectedBikeId]);

  /*
   * ---------------------------------------------------------
   * EXPIRY SUMMARY
   * ---------------------------------------------------------
   */

  const expirySummary = useMemo(() => {
    const result = {
      expired: [],
      today: [],
      soon: [],
    };

    Object.values(documents).forEach((document) => {
      const expiryDate = getDocumentExpiryDate(document);

      if (!expiryDate) {
        return;
      }

      const status = getExpiryStatus(expiryDate);

      if (status.status === "expired") {
        result.expired.push({
          document,
          status,
        });
      }

      if (status.status === "today") {
        result.today.push({
          document,
          status,
        });
      }

      if (status.status === "soon") {
        result.soon.push({
          document,
          status,
        });
      }
    });

    return result;
  }, [documents]);

  /*
   * ---------------------------------------------------------
   * FORM
   * ---------------------------------------------------------
   */

  const resetForm = () => {
    setFormData({
      ...emptyFormData,
    });

    setDocumentFile(null);
    setFilePreview("");
    setError("");
  };

  const closeModal = () => {
    setActiveDocument(null);
    resetForm();
  };

  const handleBikeChange = (event) => {
    const bikeId = event.target.value;

    setSelectedBike(bikeId);

    closeModal();

    setSuccess("");
    setError("");
  };

  const handleAddDocument = (type) => {
    resetForm();

    const existingDocument = documents[type];

    if (existingDocument) {
      setFormData({
        registrationNumber:
          existingDocument.registrationNumber || "",

        ownerName:
          existingDocument.ownerName || "",

        registrationDate:
          getDateValue(existingDocument.registrationDate),

        vehicleDetails:
          existingDocument.vehicleDetails || "",

        policyNumber:
          existingDocument.policyNumber || "",

        insuranceProvider:
          existingDocument.insuranceProvider || "",

        startDate:
          getDateValue(existingDocument.startDate),

        insuranceExpiryDate:
          getDateValue(
            existingDocument.insuranceExpiryDate
          ),

        certificateNumber:
          existingDocument.certificateNumber || "",

        testDate:
          getDateValue(existingDocument.testDate),

        pollutionExpiryDate:
          getDateValue(
            existingDocument.pollutionExpiryDate
          ),

        emissionDetails:
          existingDocument.emissionDetails || "",

        licenceNumber:
          existingDocument.licenceNumber || "",

        holderName:
          existingDocument.holderName || "",

        issueDate:
          getDateValue(existingDocument.issueDate),

        licenceExpiryDate:
          getDateValue(
            existingDocument.licenceExpiryDate
          ),
      });

      /*
       * Existing file from backend.
       *
       * Backend fields:
       * fileName
       * fileType
       * fileSize
       * fileData
       */

      if (existingDocument.fileData) {
        setDocumentFile({
          name:
            existingDocument.fileName ||
            "existing-document",

          type:
            existingDocument.fileType ||
            "",

          size:
            existingDocument.fileSize ||
            0,

          dataUrl:
            existingDocument.fileData,
        });

        if (
          existingDocument.fileType?.startsWith(
            "image/"
          )
        ) {
          setFilePreview(
            existingDocument.fileData
          );
        }
      }
    }

    setActiveDocument(type);
    setSuccess("");
    setError("");
  };

  const handleInputChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  /*
   * ---------------------------------------------------------
   * FILE UPLOAD
   * ---------------------------------------------------------
   */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a PDF, JPG, JPEG, or PNG file."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError(
        "File size must be less than 2MB."
      );

      event.target.value = "";
      return;
    }

    setDocumentFile(file);
    setError("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();

      reader.onload = (readerEvent) => {
        setFilePreview(
          readerEvent.target.result
        );
      };

      reader.readAsDataURL(file);
    } else {
      setFilePreview("");
    }
  };

  /*
   * Convert selected File to Base64.
   *
   * Backend expects:
   *
   * fileData = "data:image/png;base64,..."
   */

  const createFileData = () => {
    return new Promise((resolve, reject) => {
      if (!documentFile) {
        resolve(null);
        return;
      }

      /*
       * Existing backend file.
       */

      if (documentFile.dataUrl) {
        resolve({
          name:
            documentFile.name ||
            "existing-document",

          type:
            documentFile.type ||
            "application/octet-stream",

          size:
            documentFile.size ||
            0,

          dataUrl:
            documentFile.dataUrl,
        });

        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        resolve({
          name: documentFile.name,
          type: documentFile.type,
          size: documentFile.size,
          dataUrl: event.target.result,
        });
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Unable to read the selected file."
          )
        );
      };

      reader.readAsDataURL(documentFile);
    });
  };

  /*
   * ---------------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------------
   */

  const validateDocument = () => {
    if (!selectedBike) {
      setError("Please select a bike.");
      return false;
    }

    if (!activeDocument) {
      setError(
        "Please select a document type."
      );
      return false;
    }

    if (activeDocument === "rc") {
      if (
        !formData.registrationNumber.trim()
      ) {
        setError(
          "Please enter the registration number."
        );
        return false;
      }

      if (!formData.ownerName.trim()) {
        setError(
          "Please enter the owner name."
        );
        return false;
      }

      if (!formData.registrationDate) {
        setError(
          "Please select the registration date."
        );
        return false;
      }

      if (!formData.vehicleDetails.trim()) {
        setError(
          "Please enter the vehicle details."
        );
        return false;
      }
    }

    if (activeDocument === "insurance") {
      if (!formData.policyNumber.trim()) {
        setError(
          "Please enter the policy number."
        );
        return false;
      }

      if (
        !formData.insuranceProvider.trim()
      ) {
        setError(
          "Please enter the insurance provider."
        );
        return false;
      }

      if (!formData.startDate) {
        setError(
          "Please select the insurance start date."
        );
        return false;
      }

      if (
        !formData.insuranceExpiryDate
      ) {
        setError(
          "Please select the insurance expiry date."
        );
        return false;
      }

      if (
        formData.insuranceExpiryDate <
        formData.startDate
      ) {
        setError(
          "Insurance expiry date cannot be before the start date."
        );
        return false;
      }
    }

    if (activeDocument === "pollution") {
      if (
        !formData.certificateNumber.trim()
      ) {
        setError(
          "Please enter the certificate number."
        );
        return false;
      }

      if (!formData.testDate) {
        setError(
          "Please select the test date."
        );
        return false;
      }

      if (
        !formData.pollutionExpiryDate
      ) {
        setError(
          "Please select the pollution certificate expiry date."
        );
        return false;
      }

      if (
        !formData.emissionDetails.trim()
      ) {
        setError(
          "Please enter the emission details."
        );
        return false;
      }

      if (
        formData.pollutionExpiryDate <
        formData.testDate
      ) {
        setError(
          "Expiry date cannot be before the test date."
        );
        return false;
      }
    }

    if (activeDocument === "licence") {
      if (!formData.licenceNumber.trim()) {
        setError(
          "Please enter the licence number."
        );
        return false;
      }

      if (!formData.holderName.trim()) {
        setError(
          "Please enter the holder name."
        );
        return false;
      }

      if (!formData.issueDate) {
        setError(
          "Please select the issue date."
        );
        return false;
      }

      if (!formData.licenceExpiryDate) {
        setError(
          "Please select the licence expiry date."
        );
        return false;
      }

      if (
        formData.licenceExpiryDate <
        formData.issueDate
      ) {
        setError(
          "Expiry date cannot be before the issue date."
        );
        return false;
      }
    }

    /*
     * Existing backend file is acceptable.
     *
     * IMPORTANT:
     * Use fileData, NOT fileDataData.
     */

    const hasExistingFile =
      Boolean(
        documents[activeDocument]?.fileData
      );

    if (
      !documentFile &&
      !hasExistingFile
    ) {
      setError(
        "Please upload the document file."
      );
      return false;
    }

    return true;
  };

  /*
   * ---------------------------------------------------------
   * SAVE DOCUMENT
   * ---------------------------------------------------------
   */

  const saveDocument = async () => {
    if (!validateDocument()) {
      return;
    }

    if (!selectedBikeId) {
      setError("Please select a bike.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const currentType = activeDocument;

      const existingDocument =
        documents[currentType];

      const fileData =
        await createFileData();

      /*
       * IMPORTANT:
       * This object exactly matches DocumentRequest.java
       */

      const documentData = {
        type: currentType,

        registrationNumber:
          formData.registrationNumber.trim() ||
          null,

        ownerName:
          formData.ownerName.trim() ||
          null,

        registrationDate:
          formData.registrationDate ||
          null,

        vehicleDetails:
          formData.vehicleDetails.trim() ||
          null,

        policyNumber:
          formData.policyNumber.trim() ||
          null,

        insuranceProvider:
          formData.insuranceProvider.trim() ||
          null,

        startDate:
          formData.startDate ||
          null,

        insuranceExpiryDate:
          formData.insuranceExpiryDate ||
          null,

        certificateNumber:
          formData.certificateNumber.trim() ||
          null,

        testDate:
          formData.testDate ||
          null,

        pollutionExpiryDate:
          formData.pollutionExpiryDate ||
          null,

        emissionDetails:
          formData.emissionDetails.trim() ||
          null,

        licenceNumber:
          formData.licenceNumber.trim() ||
          null,

        holderName:
          formData.holderName.trim() ||
          null,

        issueDate:
          formData.issueDate ||
          null,

        licenceExpiryDate:
          formData.licenceExpiryDate ||
          null,

        /*
         * Backend file fields
         */

        fileName:
          fileData?.name ||
          existingDocument?.fileName ||
          null,

        fileType:
          fileData?.type ||
          existingDocument?.fileType ||
          null,

        fileSize:
          fileData?.size ??
          existingDocument?.fileSize ??
          null,

        fileData:
          fileData?.dataUrl ||
          existingDocument?.fileData ||
          null,
      };

      console.log(
        "Saving document:",
        {
          ...documentData,
          fileData:
            documentData.fileData
              ? "[BASE64 DATA]"
              : null,
        }
      );

      const response =
        await saveDocumentApi(
          Number(selectedBikeId),
          documentData
        );

      /*
       * Update immediately from POST response.
       */

      if (response?.data) {
        setDocuments((previous) => ({
          ...previous,
          [currentType]: response.data,
        }));
      }

      /*
       * Reload from backend to make sure
       * database state is reflected.
       */

      await loadDocuments(
        selectedBikeId
      );

      const documentName =
        documentTypes.find(
          (item) =>
            item.id === currentType
        )?.title || "Document";

      closeModal();

      setSuccess(
        `${documentName} saved successfully.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (saveError) {
      console.error(
        "Save document error:",
        saveError
      );

      const message =
        saveError?.response?.data?.message ||
        saveError?.response?.data?.error ||
        "Unable to save the document. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE DOCUMENT
   * ---------------------------------------------------------
   */

  const handleDeleteDocument = async (
    type
  ) => {
    const documentType =
      documentTypes.find(
        (item) => item.id === type
      );

    if (!documentType) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${documentType.title}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteDocumentApi(
        Number(selectedBikeId),
        type
      );

      setDocuments((previous) => {
        const updated = {
          ...previous,
        };

        delete updated[type];

        return updated;
      });

      setSuccess(
        `${documentType.title} deleted successfully.`
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (deleteError) {
      console.error(
        "Delete document error:",
        deleteError
      );

      const message =
        deleteError?.response?.data?.message ||
        deleteError?.response?.data?.error ||
        "Unable to delete the document.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * OPEN FILE
   * ---------------------------------------------------------
   */

  const dataUrlToBlob = async (
    dataUrl
  ) => {
    const response =
      await fetch(dataUrl);

    if (!response.ok) {
      throw new Error(
        "Unable to read document data."
      );
    }

    return response.blob();
  };

  const handleOpenFile = async (
    document
  ) => {
    setError("");

    if (!document?.fileData) {
      setError(
        "No file is available for this document."
      );
      return;
    }

    let fileUrl = null;

    try {
      const blob =
        await dataUrlToBlob(
          document.fileData
        );

      fileUrl =
        URL.createObjectURL(blob);

      const newWindow =
        window.open(
          fileUrl,
          "_blank",
          "noopener,noreferrer"
        );

      if (!newWindow) {
        URL.revokeObjectURL(
          fileUrl
        );

        setError(
          "The browser blocked the file window. Please allow pop-ups for this site."
        );

        return;
      }

      /*
       * Keep object URL alive for a while.
       * Some browsers need it while loading PDFs.
       */

      setTimeout(() => {
        URL.revokeObjectURL(
          fileUrl
        );
      }, 60000);
    } catch (openError) {
      console.error(
        "Open document error:",
        openError
      );

      if (fileUrl) {
        URL.revokeObjectURL(
          fileUrl
        );
      }

      setError(
        "Unable to open the document."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * DOWNLOAD FILE
   * ---------------------------------------------------------
   */

  const handleDownloadFile = async (
    document
  ) => {
    setError("");

    if (!document?.fileData) {
      setError(
        "No file is available for this document."
      );
      return;
    }

    let fileUrl = null;

    try {
      const blob =
        await dataUrlToBlob(
          document.fileData
        );

      fileUrl =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a"
        );

      link.href = fileUrl;

      link.download =
        document.fileName ||
        "bike-document";

      window.document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(
          fileUrl
        );
      }, 1000);
    } catch (downloadError) {
      console.error(
        "Download document error:",
        downloadError
      );

      if (fileUrl) {
        URL.revokeObjectURL(
          fileUrl
        );
      }

      setError(
        "Unable to download the document."
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * DISPLAY HELPERS
   * ---------------------------------------------------------
   */

  const getPrimaryDetails = (
    document,
    type
  ) => {
    if (!document) {
      return "Not added";
    }

    if (type === "rc") {
      return (
        document.registrationNumber ||
        "Registration number not added"
      );
    }

    if (type === "insurance") {
      return (
        document.insuranceProvider ||
        "Provider not added"
      );
    }

    if (type === "pollution") {
      return (
        document.certificateNumber ||
        "Certificate number not added"
      );
    }

    if (type === "licence") {
      return (
        document.holderName ||
        "Holder name not added"
      );
    }

    return "Not added";
  };

  const getSecondaryDetails = (
    document,
    type
  ) => {
    if (!document) {
      return "";
    }

    if (type === "rc") {
      return document.ownerName || "";
    }

    if (type === "insurance") {
      return document.policyNumber || "";
    }

    if (type === "pollution") {
      return (
        document.emissionDetails || ""
      );
    }

    if (type === "licence") {
      return (
        document.licenceNumber || ""
      );
    }

    return "";
  };

  const getExpiryClass = (
    status
  ) => {
    if (status === "expired") {
      return "document-expiry expired";
    }

    if (status === "today") {
      return "document-expiry today";
    }

    if (status === "soon") {
      return "document-expiry soon";
    }

    if (status === "active") {
      return "document-expiry active";
    }

    return "document-expiry none";
  };

  const getExpiryLabel = (
    document
  ) => {
    if (!document) {
      return "Not added";
    }

    const expiry =
      getDocumentExpiry(
        document
      );

    if (expiry.status === "expired") {
      return `Expired ${Math.abs(
        expiry.daysRemaining
      )} days ago`;
    }

    if (expiry.status === "today") {
      return "Expires today";
    }

    if (expiry.status === "soon") {
      return `${expiry.daysRemaining} days left`;
    }

    if (expiry.status === "active") {
      return `${expiry.daysRemaining} days left`;
    }

    return "No expiry";
  };

  const savedCount =
    Object.keys(documents).length;

  const alertCount =
    expirySummary.expired.length +
    expirySummary.today.length +
    expirySummary.soon.length;

  /*
   * ---------------------------------------------------------
   * NO BIKES
   * ---------------------------------------------------------
   */

  if (bikes.length === 0) {
    return (
      <div className="documents-page">
        <div className="documents-empty-page">
          <div className="documents-empty-icon">
            📁
          </div>

          <h2>No Bikes Added</h2>

          <p>
            Add your bike first to manage
            registration, insurance, PUC
            and licence documents.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * BIKE NOT SELECTED
   * ---------------------------------------------------------
   */

  if (!selectedBike) {
    return (
      <div className="documents-page">
        <div className="documents-empty-page">
          <div className="documents-empty-icon">
            🏍️
          </div>

          <h2>Select a Bike</h2>

          <p>
            Please select a bike to manage
            its documents.
          </p>

          <select
            value={
              selectedBikeId || ""
            }
            onChange={handleBikeChange}
          >
            <option
              value=""
              disabled
            >
              Select a bike
            </option>

            {bikes.map((bike) => (
              <option
                key={bike.id}
                value={bike.id}
              >
                {bike.brand} {bike.model} -{" "}
                {bike.registrationNumber}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="documents-page">

      {/* HEADER */}

      <div className="documents-header">
        <div>
          <div className="documents-label">
            DOCUMENT MANAGEMENT
          </div>

          <h1>Documents</h1>

          <p>
            Keep your important bike
            documents organized and ready
            when you need them.
          </p>
        </div>

        <div className="documents-header-actions">
          <div className="documents-bike-select">
            <span>Bike</span>

            <select
              value={
                selectedBikeId || ""
              }
              onChange={handleBikeChange}
            >
              {bikes.map((bike) => (
                <option
                  key={bike.id}
                  value={bike.id}
                >
                  {bike.brand} {bike.model} -{" "}
                  {bike.registrationNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="documents-message documents-success">
          <span>✓</span>
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && !activeDocument && (
        <div className="documents-message documents-error">
          <span>!</span>
          {error}
        </div>
      )}

      {/* BIKE BAR */}

      <div className="documents-bike-bar">
        <div className="documents-bike-bar-left">
          <div className="documents-bike-avatar">
            🏍️
          </div>

          <div>
            <h2>
              {selectedBike.brand}{" "}
              {selectedBike.model}
            </h2>

            <p>
              {selectedBike.registrationNumber ||
                "No registration number"}{" "}
              •{" "}
              {selectedBike.year ||
                "Year not available"}
            </p>
          </div>
        </div>

        <div className="documents-bike-stat">
          <strong>
            {savedCount}/4
          </strong>

          <span>
            Documents saved
          </span>
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="documents-message">
          <span>⏳</span>
          Loading documents...
        </div>
      )}

      {/* STATUS */}

      <section className="documents-status-section">
        <div className="documents-section-heading">
          <div>
            <h2>
              Document Status
            </h2>

            <p>
              Quick overview of all required
              documents.
            </p>
          </div>

          <span className="documents-status-count">
            {savedCount} of 4 saved
          </span>
        </div>

        <div className="documents-status-grid">
          {documentTypes.map(
            (type) => {
              const document =
                documents[type.id];

              const expiry =
                document
                  ? getDocumentExpiry(
                      document
                    )
                  : null;

              return (
                <div
                  className={`document-status-card document-status-${type.color}`}
                  key={type.id}
                >
                  <div className="document-status-top">
                    <div className="document-type-icon">
                      {type.icon}
                    </div>

                    <span
                      className={`document-required ${
                        type.required
                          ? "required"
                          : "optional"
                      }`}
                    >
                      {type.required
                        ? "Required"
                        : "Optional"}
                    </span>
                  </div>

                  <h3>
                    {type.shortTitle}
                  </h3>

                  <p className="document-status-title">
                    {type.title}
                  </p>

                  {document ? (
                    <>
                      <div className="document-saved-state">
                        <span>✓</span>
                        Saved
                      </div>

                      {expiry && (
                        <div
                          className={getExpiryClass(
                            expiry.status
                          )}
                        >
                          {expiry.label}
                        </div>
                      )}

                      <button
                        type="button"
                        className="document-card-open"
                        onClick={() =>
                          handleOpenFile(
                            document
                          )
                        }
                      >
                        Open File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="document-missing-state">
                        Not added yet
                      </div>

                      <button
                        type="button"
                        className="document-card-add"
                        onClick={() =>
                          handleAddDocument(
                            type.id
                          )
                        }
                      >
                        + Add Document
                      </button>
                    </>
                  )}
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* ALERTS */}

      {alertCount > 0 && (
        <section className="documents-alert-section">
          <div className="documents-section-heading">
            <div>
              <h2>
                Expiry Alerts
              </h2>

              <p>
                Documents that need your
                attention.
              </p>
            </div>

            <span className="documents-alert-count">
              {alertCount} alert
              {alertCount !== 1
                ? "s"
                : ""}
            </span>
          </div>

          <div className="documents-alert-list">
            {[
              ...expirySummary.expired,
              ...expirySummary.today,
              ...expirySummary.soon,
            ].map(
              ({
                document,
                status,
              }) => {
                const type =
                  documentTypes.find(
                    (item) =>
                      item.id ===
                      document.type
                  );

                return (
                  <div
                    className={`document-alert-item ${status.status}`}
                    key={document.type}
                  >
                    <div className="document-alert-icon">
                      {type?.icon}
                    </div>

                    <div className="document-alert-content">
                      <strong>
                        {type?.title}
                      </strong>

                      <span>
                        {status.status ===
                        "expired"
                          ? `Expired on ${formatExpiryDate(
                              getDocumentExpiryDate(
                                document
                              )
                            )}`
                          : status.status ===
                            "today"
                          ? "This document expires today."
                          : `Expires on ${formatExpiryDate(
                              getDocumentExpiryDate(
                                document
                              )
                            )}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddDocument(
                          document.type
                        )
                      }
                    >
                      Update
                    </button>
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* ALL DOCUMENTS */}

      <section className="documents-list-section">
        <div className="documents-section-heading">
          <div>
            <h2>
              All Documents
            </h2>

            <p>
              Manage files and document
              information from one place.
            </p>
          </div>

          <span className="documents-list-count">
            {savedCount} saved
          </span>
        </div>

        <div className="documents-table">
          <div className="documents-table-header">
            <span>DOCUMENT</span>
            <span>DETAILS</span>
            <span>FILE</span>
            <span>EXPIRY</span>
            <span>ACTIONS</span>
          </div>

          {documentTypes.map(
            (type) => {
              const document =
                documents[type.id];

              const expiry =
                document
                  ? getDocumentExpiry(
                      document
                    )
                  : null;

              return (
                <div
                  className="documents-table-row"
                  key={type.id}
                >
                  <div className="documents-table-document">
                    <div
                      className={`document-row-icon ${type.color}`}
                    >
                      {type.icon}
                    </div>

                    <div>
                      <strong>
                        {type.title}
                      </strong>

                      <span>
                        {type.required
                          ? "Required"
                          : "Optional"}
                      </span>
                    </div>
                  </div>

                  <div className="documents-table-details">
                    {document ? (
                      <>
                        <strong>
                          {getPrimaryDetails(
                            document,
                            type.id
                          )}
                        </strong>

                        <span>
                          {getSecondaryDetails(
                            document,
                            type.id
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="documents-not-added">
                        Not added yet
                      </span>
                    )}
                  </div>

                  <div className="documents-table-file">
                    {document?.fileData ? (
                      <>
                        <span className="file-type">
                          {document.fileType ===
                          "application/pdf"
                            ? "PDF"
                            : "IMAGE"}
                        </span>

                        <span
                          className="file-name"
                          title={
                            document.fileName
                          }
                        >
                          {document.fileName ||
                            "Document"}
                        </span>
                      </>
                    ) : (
                      <span className="documents-not-added">
                        No file
                      </span>
                    )}
                  </div>

                  <div className="documents-table-expiry">
                    {document ? (
                      <>
                        <strong
                          className={getExpiryClass(
                            expiry.status
                          )}
                        >
                          {getExpiryLabel(
                            document
                          )}
                        </strong>

                        <span>
                          {getExpiryText(
                            document
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="documents-not-added">
                        -
                      </span>
                    )}
                  </div>

                  <div className="documents-table-actions">
                    {document ? (
                      <>
                        <button
                          type="button"
                          className="action-button open"
                          onClick={() =>
                            handleOpenFile(
                              document
                            )
                          }
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          className="action-button download"
                          onClick={() =>
                            handleDownloadFile(
                              document
                            )
                          }
                        >
                          Download
                        </button>

                        <button
                          type="button"
                          className="action-button edit"
                          onClick={() =>
                            handleAddDocument(
                              type.id
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-button delete"
                          disabled={deleting}
                          onClick={() =>
                            handleDeleteDocument(
                              type.id
                            )
                          }
                        >
                          {deleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="action-button add"
                        onClick={() =>
                          handleAddDocument(
                            type.id
                          )
                        }
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* SECURITY NOTE */}

      <div className="documents-note">
        <span>🔒</span>

        <div>
          <strong>
            Your documents are stored securely
          </strong>

          <p>
            Documents are stored in your
            Smart Bike Care backend and
            associated with your selected bike.
          </p>
        </div>
      </div>

      {/* MODAL */}

      {activeDocument && (
        <div
          className="documents-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="documents-modal">

            {/* MODAL HEADER */}

            <div className="documents-modal-header">
              <div>
                <span className="documents-modal-label">
                  {documents[
                    activeDocument
                  ]
                    ? "EDIT DOCUMENT"
                    : "ADD DOCUMENT"}
                </span>

                <h2>
                  {
                    documentTypes.find(
                      (item) =>
                        item.id ===
                        activeDocument
                    )?.title
                  }
                </h2>
              </div>

              <button
                type="button"
                className="documents-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="documents-modal-body">

              {error && (
                <div className="documents-message documents-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              {/* RC */}

              {activeDocument ===
                "rc" && (
                <div className="document-form-grid">

                  <div className="document-form-field">
                    <label>
                      Registration Number *
                    </label>

                    <input
                      type="text"
                      name="registrationNumber"
                      value={
                        formData.registrationNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="TN 00 AB 0000"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Owner Name *
                    </label>

                    <input
                      type="text"
                      name="ownerName"
                      value={
                        formData.ownerName
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter owner name"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Registration Date *
                    </label>

                    <input
                      type="date"
                      name="registrationDate"
                      value={
                        formData.registrationDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>

                  <div className="document-form-field full-width">
                    <label>
                      Vehicle Details *
                    </label>

                    <textarea
                      name="vehicleDetails"
                      value={
                        formData.vehicleDetails
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Example: Honda Unicorn 2014, Black, Petrol"
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {/* INSURANCE */}

              {activeDocument ===
                "insurance" && (
                <div className="document-form-grid">

                  <div className="document-form-field">
                    <label>
                      Policy Number *
                    </label>

                    <input
                      type="text"
                      name="policyNumber"
                      value={
                        formData.policyNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter policy number"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Insurance Provider *
                    </label>

                    <input
                      type="text"
                      name="insuranceProvider"
                      value={
                        formData.insuranceProvider
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter provider"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={
                        formData.startDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Expiry Date *
                    </label>

                    <input
                      type="date"
                      name="insuranceExpiryDate"
                      value={
                        formData.insuranceExpiryDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>
                </div>
              )}

              {/* POLLUTION */}

              {activeDocument ===
                "pollution" && (
                <div className="document-form-grid">

                  <div className="document-form-field">
                    <label>
                      Certificate Number *
                    </label>

                    <input
                      type="text"
                      name="certificateNumber"
                      value={
                        formData.certificateNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter certificate number"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Test Date *
                    </label>

                    <input
                      type="date"
                      name="testDate"
                      value={
                        formData.testDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Expiry Date *
                    </label>

                    <input
                      type="date"
                      name="pollutionExpiryDate"
                      value={
                        formData.pollutionExpiryDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Emission Details *
                    </label>

                    <input
                      type="text"
                      name="emissionDetails"
                      value={
                        formData.emissionDetails
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Example: CO 0.2%, HC 150 ppm"
                    />
                  </div>
                </div>
              )}

              {/* LICENCE */}

              {activeDocument ===
                "licence" && (
                <div className="document-form-grid">

                  <div className="document-form-field">
                    <label>
                      Licence Number *
                    </label>

                    <input
                      type="text"
                      name="licenceNumber"
                      value={
                        formData.licenceNumber
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter licence number"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Holder Name *
                    </label>

                    <input
                      type="text"
                      name="holderName"
                      value={
                        formData.holderName
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Enter holder name"
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Issue Date *
                    </label>

                    <input
                      type="date"
                      name="issueDate"
                      value={
                        formData.issueDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>

                  <div className="document-form-field">
                    <label>
                      Expiry Date *
                    </label>

                    <input
                      type="date"
                      name="licenceExpiryDate"
                      value={
                        formData.licenceExpiryDate
                      }
                      onChange={
                        handleInputChange
                      }
                    />
                  </div>
                </div>
              )}

              {/* FILE UPLOAD */}

              <div className="document-upload-section">

                <div className="document-upload-heading">
                  <div>
                    <h3>
                      Document File
                    </h3>

                    <p>
                      PDF, JPG, JPEG or PNG •
                      Maximum 2MB
                    </p>
                  </div>

                  {documents[
                    activeDocument
                  ]?.fileData &&
                    documentFile?.dataUrl && (
                      <span className="existing-file-badge">
                        Existing file saved
                      </span>
                    )}
                </div>

                <label className="document-upload-box">

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleFileChange
                    }
                  />

                  {filePreview ? (
                    <div className="upload-image-preview">
                      <img
                        src={filePreview}
                        alt="Document preview"
                      />
                    </div>
                  ) : documentFile ? (
                    <div className="upload-file-selected">

                      <span className="upload-file-icon">
                        {documentFile.type ===
                        "application/pdf"
                          ? "📕"
                          : "🖼️"}
                      </span>

                      <div>
                        <strong>
                          {
                            documentFile.name
                          }
                        </strong>

                        <span>
                          {documentFile.size
                            ? (
                                documentFile.size /
                                1024
                              ).toFixed(1)
                            : "0"}{" "}
                          KB
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span>
                        📎
                      </span>

                      <strong>
                        Choose document file
                      </strong>

                      <small>
                        Click to browse files
                      </small>
                    </div>
                  )}
                </label>

                {documentFile && (
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => {
                      setDocumentFile(
                        null
                      );
                      setFilePreview(
                        ""
                      );
                    }}
                  >
                    Remove selected file
                  </button>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="documents-modal-footer">

              <button
                type="button"
                className="modal-cancel-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-save-button"
                onClick={
                  saveDocument
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Document"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;