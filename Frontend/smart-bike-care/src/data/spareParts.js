const spareParts = {
  Honda: {
    Unicorn: [
      {
        id: 1,
        name: "Engine Oil",
        category: "Engine",
        replacementKm: 3000,
        estimatedPrice: 650,
        description:
          "Engine oil suitable for regular motorcycle maintenance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Oil Filter",
        category: "Engine",
        replacementKm: 6000,
        estimatedPrice: 180,
        description:
          "Helps keep engine oil clean and protects the engine.",
        icon: "🔩",
      },
      {
        id: 3,
        name: "Air Filter",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 350,
        description:
          "Filters dust and particles before air enters the engine.",
        icon: "🌬️",
      },
      {
        id: 4,
        name: "Brake Pads",
        category: "Brakes",
        replacementKm: 15000,
        estimatedPrice: 750,
        description:
          "Replace when brake pad thickness becomes low.",
        icon: "🛑",
      },
      {
        id: 5,
        name: "Spark Plug",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 180,
        description:
          "Provides ignition for efficient engine combustion.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "Chain & Sprocket Kit",
        category: "Transmission",
        replacementKm: 20000,
        estimatedPrice: 1800,
        description:
          "Replace when chain or sprocket wear becomes excessive.",
        icon: "⛓️",
      },
    ],
  },

  Yamaha: {
    "MT-15": [
      {
        id: 1,
        name: "Engine Oil",
        category: "Engine",
        replacementKm: 3000,
        estimatedPrice: 700,
        description:
          "Engine oil for regular MT-15 maintenance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Oil Filter",
        category: "Engine",
        replacementKm: 6000,
        estimatedPrice: 200,
        description:
          "Filters contaminants from engine oil.",
        icon: "🔩",
      },
      {
        id: 3,
        name: "Air Filter",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 500,
        description:
          "Filters incoming air and protects engine components.",
        icon: "🌬️",
      },
      {
        id: 4,
        name: "Brake Pads",
        category: "Brakes",
        replacementKm: 15000,
        estimatedPrice: 900,
        description:
          "Replace when brake pad wear reaches its limit.",
        icon: "🛑",
      },
      {
        id: 5,
        name: "Spark Plug",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 250,
        description:
          "Maintains reliable ignition performance.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "Chain & Sprocket Kit",
        category: "Transmission",
        replacementKm: 20000,
        estimatedPrice: 2500,
        description:
          "Replacement kit for worn chain and sprockets.",
        icon: "⛓️",
      },
    ],
  },

  "Royal Enfield": {
    Classic: [
      {
        id: 1,
        name: "Engine Oil",
        category: "Engine",
        replacementKm: 5000,
        estimatedPrice: 900,
        description:
          "Engine oil for regular Classic maintenance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Oil Filter",
        category: "Engine",
        replacementKm: 5000,
        estimatedPrice: 250,
        description:
          "Helps remove contaminants from engine oil.",
        icon: "🔩",
      },
      {
        id: 3,
        name: "Air Filter",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 550,
        description:
          "Filters air entering the engine.",
        icon: "🌬️",
      },
      {
        id: 4,
        name: "Brake Pads",
        category: "Brakes",
        replacementKm: 15000,
        estimatedPrice: 1000,
        description:
          "Replace worn brake pads for safe braking.",
        icon: "🛑",
      },
      {
        id: 5,
        name: "Spark Plug",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 250,
        description:
          "Maintains reliable ignition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "Chain & Sprocket Kit",
        category: "Transmission",
        replacementKm: 20000,
        estimatedPrice: 2800,
        description:
          "Replace worn chain and sprocket components.",
        icon: "⛓️",
      },
    ],
  },

  TVS: {
    Apache: [
      {
        id: 1,
        name: "Engine Oil",
        category: "Engine",
        replacementKm: 3000,
        estimatedPrice: 650,
        description:
          "Engine oil for regular Apache maintenance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Oil Filter",
        category: "Engine",
        replacementKm: 6000,
        estimatedPrice: 200,
        description:
          "Filters contaminants from engine oil.",
        icon: "🔩",
      },
      {
        id: 3,
        name: "Air Filter",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 400,
        description:
          "Protects the engine by filtering incoming air.",
        icon: "🌬️",
      },
      {
        id: 4,
        name: "Brake Pads",
        category: "Brakes",
        replacementKm: 15000,
        estimatedPrice: 800,
        description:
          "Replace when brake pads become worn.",
        icon: "🛑",
      },
      {
        id: 5,
        name: "Spark Plug",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 200,
        description:
          "Maintains reliable engine ignition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "Chain & Sprocket Kit",
        category: "Transmission",
        replacementKm: 20000,
        estimatedPrice: 2200,
        description:
          "Replacement kit for chain and sprocket wear.",
        icon: "⛓️",
      },
    ],
  },

  Bajaj: {
    Pulsar: [
      {
        id: 1,
        name: "Engine Oil",
        category: "Engine",
        replacementKm: 3000,
        estimatedPrice: 650,
        description:
          "Engine oil for regular Pulsar maintenance.",
        icon: "🛢️",
      },
      {
        id: 2,
        name: "Oil Filter",
        category: "Engine",
        replacementKm: 6000,
        estimatedPrice: 180,
        description:
          "Keeps engine oil clean.",
        icon: "🔩",
      },
      {
        id: 3,
        name: "Air Filter",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 350,
        description:
          "Filters dust from incoming engine air.",
        icon: "🌬️",
      },
      {
        id: 4,
        name: "Brake Pads",
        category: "Brakes",
        replacementKm: 15000,
        estimatedPrice: 750,
        description:
          "Replace worn brake pads.",
        icon: "🛑",
      },
      {
        id: 5,
        name: "Spark Plug",
        category: "Engine",
        replacementKm: 10000,
        estimatedPrice: 180,
        description:
          "Maintains proper engine ignition.",
        icon: "⚡",
      },
      {
        id: 6,
        name: "Chain & Sprocket Kit",
        category: "Transmission",
        replacementKm: 20000,
        estimatedPrice: 2000,
        description:
          "Replacement kit for worn chain and sprockets.",
        icon: "⛓️",
      },
    ],
  },
};

export default spareParts;