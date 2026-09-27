const bikeServices = {
  Honda: {
    Unicorn: [
      {
        id: 1,
        name: "Engine Oil Change",
        category: "Engine",
        interval: 3000,
        description:
          "Replace engine oil to maintain smooth engine performance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Chain Cleaning & Lubrication",
        category: "Transmission",
        interval: 5000,
        description:
          "Clean and lubricate the drive chain for smooth power delivery.",
        icon: "⛓️",
      },
      {
        id: 3,
        name: "Brake Inspection",
        category: "Brakes",
        interval: 5000,
        description:
          "Inspect brake pads, discs and overall braking performance.",
        icon: "🛑",
      },
      {
        id: 4,
        name: "Air Filter Replacement",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect and replace the air filter when required.",
        icon: "🌬️",
      },
      {
        id: 5,
        name: "Spark Plug Inspection",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect the spark plug for proper ignition and engine performance.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "General Service",
        category: "General",
        interval: 5000,
        description:
          "Perform a complete inspection of the motorcycle.",
        icon: "🔧",
      },
    ],
  },

  Yamaha: {
    "MT-15": [
      {
        id: 1,
        name: "Engine Oil Change",
        category: "Engine",
        interval: 3000,
        description:
          "Replace engine oil to maintain engine performance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Chain Cleaning & Lubrication",
        category: "Transmission",
        interval: 5000,
        description:
          "Clean and lubricate the chain for smooth riding.",
        icon: "⛓️",
      },
      {
        id: 3,
        name: "Brake Inspection",
        category: "Brakes",
        interval: 5000,
        description:
          "Inspect brake pads and braking components.",
        icon: "🛑",
      },
      {
        id: 4,
        name: "Air Filter Replacement",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect and replace the air filter when required.",
        icon: "🌬️",
      },
      {
        id: 5,
        name: "Spark Plug Inspection",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect spark plug condition and ignition performance.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "General Service",
        category: "General",
        interval: 5000,
        description:
          "Perform a complete motorcycle inspection.",
        icon: "🔧",
      },
    ],
  },

  "Royal Enfield": {
    Classic: [
      {
        id: 1,
        name: "Engine Oil Change",
        category: "Engine",
        interval: 5000,
        description:
          "Replace engine oil for reliable engine lubrication.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Chain Cleaning & Lubrication",
        category: "Transmission",
        interval: 5000,
        description:
          "Clean and lubricate the chain regularly.",
        icon: "⛓️",
      },
      {
        id: 3,
        name: "Brake Inspection",
        category: "Brakes",
        interval: 5000,
        description:
          "Inspect brake pads and braking performance.",
        icon: "🛑",
      },
      {
        id: 4,
        name: "Air Filter Replacement",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect and replace the air filter.",
        icon: "🌬️",
      },
      {
        id: 5,
        name: "Spark Plug Inspection",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect spark plug condition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "General Service",
        category: "General",
        interval: 5000,
        description:
          "Perform a complete inspection of the motorcycle.",
        icon: "🔧",
      },
    ],
  },

  TVS: {
    Apache: [
      {
        id: 1,
        name: "Engine Oil Change",
        category: "Engine",
        interval: 3000,
        description:
          "Replace engine oil to maintain smooth engine operation.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Chain Cleaning & Lubrication",
        category: "Transmission",
        interval: 5000,
        description:
          "Clean and lubricate the drive chain.",
        icon: "⛓️",
      },
      {
        id: 3,
        name: "Brake Inspection",
        category: "Brakes",
        interval: 5000,
        description:
          "Inspect brake pads and braking components.",
        icon: "🛑",
      },
      {
        id: 4,
        name: "Air Filter Replacement",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect and replace the air filter.",
        icon: "🌬️",
      },
      {
        id: 5,
        name: "Spark Plug Inspection",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect spark plug condition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "General Service",
        category: "General",
        interval: 5000,
        description:
          "Perform a complete motorcycle inspection.",
        icon: "🔧",
      },
    ],
  },

  Bajaj: {
    Pulsar: [
      {
        id: 1,
        name: "Engine Oil Change",
        category: "Engine",
        interval: 3000,
        description:
          "Replace engine oil for smooth engine operation.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Chain Cleaning & Lubrication",
        category: "Transmission",
        interval: 5000,
        description:
          "Clean and lubricate the drive chain.",
        icon: "⛓️",
      },
      {
        id: 3,
        name: "Brake Inspection",
        category: "Brakes",
        interval: 5000,
        description:
          "Inspect brake pads and braking performance.",
        icon: "🛑",
      },
      {
        id: 4,
        name: "Air Filter Replacement",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect and replace the air filter.",
        icon: "🌬️",
      },
      {
        id: 5,
        name: "Spark Plug Inspection",
        category: "Engine",
        interval: 10000,
        description:
          "Inspect spark plug condition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "General Service",
        category: "General",
        interval: 5000,
        description:
          "Perform a complete motorcycle inspection.",
        icon: "🔧",
      },
    ],
  },
};

export default bikeServices;