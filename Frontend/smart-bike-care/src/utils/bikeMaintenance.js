const DEFAULT_SERVICE_INTERVAL = 5000;

const bikeServiceData = {
  default: [
    {
      id: 1,
      name: "Engine Oil Change",
      category: "Engine",
      icon: "🛢️",
      description: "Replace engine oil to keep the engine running smoothly.",
      interval: "Every 3,000 - 5,000 KM",
      intervalKm: 5000,
      estimatedCost: 800,
    },
    {
      id: 2,
      name: "Brake Inspection",
      category: "Brakes",
      icon: "🛑",
      description: "Inspect brake pads, discs and brake fluid.",
      interval: "Every 5,000 KM",
      intervalKm: 5000,
      estimatedCost: 500,
    },
    {
      id: 3,
      name: "Chain Cleaning & Lubrication",
      category: "Chain",
      icon: "⛓️",
      description: "Clean and lubricate the chain for smooth power transfer.",
      interval: "Every 1,000 KM",
      intervalKm: 1000,
      estimatedCost: 300,
    },
    {
      id: 4,
      name: "Tyre Inspection",
      category: "Tyres",
      icon: "🛞",
      description: "Check tyre pressure, tread and overall tyre condition.",
      interval: "Every 3,000 KM",
      intervalKm: 3000,
      estimatedCost: 300,
    },
    {
      id: 5,
      name: "Battery Check",
      category: "Electrical",
      icon: "🔋",
      description: "Check battery voltage, terminals and charging condition.",
      interval: "Every 5,000 KM",
      intervalKm: 5000,
      estimatedCost: 250,
    },
    {
      id: 6,
      name: "Air Filter Cleaning",
      category: "Engine",
      icon: "🌬️",
      description: "Clean the air filter to maintain proper engine airflow.",
      interval: "Every 5,000 KM",
      intervalKm: 5000,
      estimatedCost: 400,
    },
    {
      id: 7,
      name: "Spark Plug Inspection",
      category: "Engine",
      icon: "⚡",
      description: "Inspect the spark plug for proper ignition and performance.",
      interval: "Every 8,000 KM",
      intervalKm: 8000,
      estimatedCost: 350,
    },
    {
      id: 8,
      name: "General Service",
      category: "Maintenance",
      icon: "🔧",
      description: "Complete inspection of important bike components.",
      interval: "Every 5,000 KM",
      intervalKm: 5000,
      estimatedCost: 1200,
    },
  ],
};

const bikeSparePartData = {
  default: [
    {
      id: 1,
      name: "Brake Pads",
      category: "Brakes",
      icon: "🛑",
      description: "Replace brake pads when the friction material becomes thin.",
      replacementInterval: 10000,
      estimatedPrice: 900,
    },
    {
      id: 2,
      name: "Drive Chain",
      category: "Chain",
      icon: "⛓️",
      description: "Inspect chain wear and replace when necessary.",
      replacementInterval: 20000,
      estimatedPrice: 1800,
    },
    {
      id: 3,
      name: "Air Filter",
      category: "Engine",
      icon: "🌬️",
      description: "Replace the air filter when it becomes damaged or heavily clogged.",
      replacementInterval: 15000,
      estimatedPrice: 500,
    },
    {
      id: 4,
      name: "Spark Plug",
      category: "Engine",
      icon: "⚡",
      description: "Replace the spark plug when performance or ignition becomes poor.",
      replacementInterval: 12000,
      estimatedPrice: 400,
    },
    {
      id: 5,
      name: "Battery",
      category: "Electrical",
      icon: "🔋",
      description: "Check battery health and replace it when capacity becomes weak.",
      replacementInterval: 30000,
      estimatedPrice: 1800,
    },
  ],
};

// get bike services
export const getBikeServices = (bike) => {
  if (!bike) {
    return [];
  }

  return bikeServiceData.default;
};

// get bike spare parts
export const getBikeSpareParts = (bike) => {
  if (!bike) {
    return [];
  }

  const currentKm = Number(bike.odometer || 0);

  return bikeSparePartData.default.map((part) => {
    const previousReplacement = getLastServiceKm(
      bike,
      getPartServiceNames(part.name)
    );

    let replacementKm;

    if (previousReplacement > 0) {
      replacementKm =
        previousReplacement + part.replacementInterval;
    } else {
      replacementKm = part.replacementInterval;
    }

    if (replacementKm < currentKm) {
      const cyclesPassed = Math.ceil(
        (currentKm - replacementKm + 1) /
          part.replacementInterval
      );

      replacementKm +=
        cyclesPassed * part.replacementInterval;
    }

    return {
      ...part,
      replacementKm,
    };
  });
};

// get maintenance recommendations
export const getBikeMaintenanceRecommendations = (bike) => {
  if (!bike) {
    return [];
  }

  const currentKm = Number(bike.odometer || 0);
  const services = bikeServiceData.default;
  const history = Array.isArray(bike.serviceHistory)
    ? bike.serviceHistory
    : [];

  const recommendations = services.map((service) => {
    const serviceHistory = history
      .filter(
        (item) =>
          normalizeName(item.service) ===
          normalizeName(service.name)
      )
      .sort((a, b) => {
        return (
          Number(b.kilometers || 0) -
          Number(a.kilometers || 0)
        );
      });

    const lastServiceKm =
      serviceHistory.length > 0
        ? Number(serviceHistory[0].kilometers || 0)
        : 0;

    let dueKm;

    if (lastServiceKm > 0) {
      dueKm = lastServiceKm + service.intervalKm;
    } else {
      dueKm = service.intervalKm;
    }

    if (dueKm <= currentKm) {
      while (dueKm <= currentKm) {
        dueKm += service.intervalKm;
      }

      if (
        currentKm >= dueKm - service.intervalKm
      ) {
        dueKm -= service.intervalKm;
      }
    }

    const remainingKm = dueKm - currentKm;

    let status = "Not Due";

    if (remainingKm <= 0) {
      status = "Due";
    } else if (remainingKm <= 500) {
      status = "Due Soon";
    }

    const description = getRecommendationDescription(
      service,
      status,
      remainingKm
    );

    return {
      id: service.id,
      title: service.name,
      name: service.name,
      icon: service.icon,
      category: service.category,
      description,
      status,
      currentKm,
      dueKm,
      remainingKm: Math.max(remainingKm, 0),
      intervalKm: service.intervalKm,
      interval: service.interval,
      estimatedCost: service.estimatedCost,
      lastServiceKm,
    };
  });

  return recommendations
    .sort((a, b) => {
      const statusOrder = {
        Due: 1,
        "Due Soon": 2,
        "Not Due": 3,
      };

      if (
        statusOrder[a.status] !==
        statusOrder[b.status]
      ) {
        return (
          statusOrder[a.status] -
          statusOrder[b.status]
        );
      }

      return a.remainingKm - b.remainingKm;
    })
    .slice(0, 6);
};

// recommendation description
const getRecommendationDescription = (
  service,
  status,
  remainingKm
) => {
  if (status === "Due") {
    return `${service.name} is due based on your current odometer reading.`;
  }

  if (status === "Due Soon") {
    return `${service.name} is due soon. Only ${remainingKm.toLocaleString()} KM remaining.`;
  }

  return `${service.name} is not due yet. Regular maintenance helps keep your bike reliable.`;
};

// get last service KM
const getLastServiceKm = (bike, serviceNames) => {
  const history = Array.isArray(bike?.serviceHistory)
    ? bike.serviceHistory
    : [];

  const matchingServices = history
    .filter((item) =>
      serviceNames.some(
        (name) =>
          normalizeName(item.service) ===
          normalizeName(name)
      )
    )
    .sort(
      (a, b) =>
        Number(b.kilometers || 0) -
        Number(a.kilometers || 0)
    );

  if (matchingServices.length === 0) {
    return 0;
  }

  return Number(
    matchingServices[0].kilometers || 0
  );
};

// service names for spare parts
const getPartServiceNames = (partName) => {
  const names = {
    "Brake Pads": [
      "Brake Inspection",
      "Brake Pad Replacement",
    ],
    "Drive Chain": [
      "Chain Cleaning & Lubrication",
      "Chain Replacement",
    ],
    "Air Filter": [
      "Air Filter Cleaning",
      "Air Filter Replacement",
    ],
    "Spark Plug": [
      "Spark Plug Inspection",
      "Spark Plug Replacement",
    ],
    Battery: [
      "Battery Check",
      "Battery Replacement",
    ],
  };

  return names[partName] || [];
};

// normalize service name
const normalizeName = (name) => {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

// get service by name
export const getServiceByName = (serviceName) => {
  return (
    bikeServiceData.default.find(
      (service) =>
        normalizeName(service.name) ===
        normalizeName(serviceName)
    ) || null
  );
};

// get service estimated cost
export const getServiceEstimatedCost = (
  serviceName
) => {
  const service = getServiceByName(serviceName);

  return service?.estimatedCost || 0;
};

// get next service KM
export const getNextServiceKm = (bike) => {
  if (!bike) {
    return 0;
  }

  const currentKm = Number(bike.odometer || 0);
  const nextService = Number(
    bike.nextService || 0
  );

  if (nextService > currentKm) {
    return nextService;
  }

  return currentKm + DEFAULT_SERVICE_INTERVAL;
};

// get recommendation status
export const getRecommendationStatus = (
  currentKm,
  dueKm
) => {
  const current = Number(currentKm || 0);
  const due = Number(dueKm || 0);
  const remaining = due - current;

  if (remaining <= 0) {
    return "Due";
  }

  if (remaining <= 500) {
    return "Due Soon";
  }

  return "Not Due";
};