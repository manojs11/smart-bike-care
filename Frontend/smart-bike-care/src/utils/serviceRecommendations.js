// =========================================
// SMART SERVICE RECOMMENDATION ENGINE
// =========================================

const SERVICE_INTERVALS = {

  // Common maintenance profile
  default: {
    engineOil: 3000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },

  // Honda
  honda: {
    engineOil: 3000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },

  // Yamaha
  yamaha: {
    engineOil: 3000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },

  // Royal Enfield
  "royal enfield": {
    engineOil: 5000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },

  // TVS
  tvs: {
    engineOil: 3000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },

  // Bajaj
  bajaj: {
    engineOil: 3000,
    chain: 5000,
    brake: 5000,
    airFilter: 10000,
    generalService: 5000,
  },
};


// =========================================
// GET MAINTENANCE PROFILE
// =========================================

function getMaintenanceProfile(brand) {

  const brandName =
    (brand || "")
      .trim()
      .toLowerCase();

  return (
    SERVICE_INTERVALS[brandName] ||
    SERVICE_INTERVALS.default
  );
}


// =========================================
// FIND LAST SERVICE OF TYPE
// =========================================

function getLastService(
  serviceHistory,
  keywords
) {

  if (!Array.isArray(serviceHistory)) {
    return null;
  }

  return serviceHistory.find((service) => {

    const serviceName =
      (service.service || "")
        .toLowerCase();

    return keywords.some((keyword) =>
      serviceName.includes(keyword)
    );
  });
}


// =========================================
// CREATE RECOMMENDATION
// =========================================

function createRecommendation({
  title,
  description,
  icon,
  priority,
  currentKm,
  lastServiceKm,
  interval,
}) {

  const baseKm =
    lastServiceKm !== null
      ? lastServiceKm
      : 0;

  const dueKm =
    baseKm + interval;

  const remainingKm =
    dueKm - currentKm;


  let status = "Not Due";


  if (currentKm >= dueKm) {
    status = "Due";
  }

  else if (remainingKm <= 500) {
    status = "Due Soon";
  }


  return {

    title,

    description,

    icon,

    priority,

    status,

    currentKm,

    dueKm,

    remainingKm,

    interval,

    lastServiceKm,
  };
}


// =========================================
// MAIN RECOMMENDATION FUNCTION
// =========================================

export function getServiceRecommendations(
  bike
) {

  if (!bike) {
    return [];
  }


  const currentKm =
    Number(bike.odometer) || 0;


  const profile =
    getMaintenanceProfile(
      bike.brand
    );


  const history =
    bike.serviceHistory || [];


  // Engine Oil
  const oilService =
    getLastService(
      history,
      [
        "engine oil",
        "oil change",
        "oil",
      ]
    );


  // Chain
  const chainService =
    getLastService(
      history,
      [
        "chain",
      ]
    );


  // Brake
  const brakeService =
    getLastService(
      history,
      [
        "brake",
      ]
    );


  // Air Filter
  const airFilterService =
    getLastService(
      history,
      [
        "air filter",
      ]
    );


  // General Service
  const generalService =
    getLastService(
      history,
      [
        "general service",
      ]
    );


  return [

    createRecommendation({
      title: "Engine Oil Change",

      description:
        "Replace the engine oil to maintain smooth engine performance.",

      icon: "🛢️",

      priority: "High",

      currentKm,

      lastServiceKm:
        oilService
          ? Number(oilService.kilometers)
          : null,

      interval:
        profile.engineOil,
    }),


    createRecommendation({
      title: "Chain Maintenance",

      description:
        "Inspect, clean and lubricate the drive chain.",

      icon: "⛓️",

      priority: "Medium",

      currentKm,

      lastServiceKm:
        chainService
          ? Number(chainService.kilometers)
          : null,

      interval:
        profile.chain,
    }),


    createRecommendation({
      title: "Brake Inspection",

      description:
        "Check brake pads, discs and braking performance.",

      icon: "🛑",

      priority: "High",

      currentKm,

      lastServiceKm:
        brakeService
          ? Number(brakeService.kilometers)
          : null,

      interval:
        profile.brake,
    }),


    createRecommendation({
      title: "Air Filter",

      description:
        "Inspect and replace the air filter when required.",

      icon: "🌬️",

      priority: "Medium",

      currentKm,

      lastServiceKm:
        airFilterService
          ? Number(airFilterService.kilometers)
          : null,

      interval:
        profile.airFilter,
    }),


    createRecommendation({
      title: "General Service",

      description:
        "Perform a general inspection of your bike.",

      icon: "🔧",

      priority: "High",

      currentKm,

      lastServiceKm:
        generalService
          ? Number(generalService.kilometers)
          : null,

      interval:
        profile.generalService,
    }),

  ];
}