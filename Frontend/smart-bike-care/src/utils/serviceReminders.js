// find the latest matching service
export function getLastService(
  serviceHistory,
  keywords = []
) {
  if (
    !Array.isArray(serviceHistory) ||
    serviceHistory.length === 0
  ) {
    return null;
  }

  const matchingServices =
    serviceHistory.filter((service) => {
      const serviceName = String(
        service?.service || ""
      ).toLowerCase();

      return keywords.some((keyword) =>
        serviceName.includes(
          String(keyword).toLowerCase()
        )
      );
    });

  if (matchingServices.length === 0) {
    return null;
  }

  const sortedServices =
    [...matchingServices].sort((a, b) => {
      const dateA = a?.date
        ? new Date(a.date).getTime()
        : 0;

      const dateB = b?.date
        ? new Date(b.date).getTime()
        : 0;

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      const kmA =
        Number(a?.kilometers) || 0;

      const kmB =
        Number(b?.kilometers) || 0;

      return kmB - kmA;
    });

  return sortedServices[0];
}

// calculate reminder status
export function getReminderStatus(
  currentKm,
  dueKm
) {
  const current =
    Number(currentKm) || 0;

  const due =
    Number(dueKm) || 0;

  const remainingKm =
    due - current;

  if (remainingKm <= 0) {
    return {
      status: "Due",
      remainingKm: 0,
      className: "due",
    };
  }

  if (remainingKm <= 500) {
    return {
      status: "Due Soon",
      remainingKm,
      className: "due-soon",
    };
  }

  return {
    status: "Upcoming",
    remainingKm,
    className: "upcoming",
  };
}

// create one service reminder
export function createServiceReminder({
  service,
  currentKm,
  interval,
  lastServiceKm,
}) {
  const current =
    Number(currentKm) || 0;

  const serviceInterval =
    Number(interval) || 0;

  let dueKm;

  if (
    lastServiceKm !== null &&
    lastServiceKm !== undefined &&
    Number.isFinite(
      Number(lastServiceKm)
    )
  ) {
    dueKm =
      Number(lastServiceKm) +
      serviceInterval;
  } else {
    dueKm = serviceInterval;
  }

  const reminderStatus =
    getReminderStatus(
      current,
      dueKm
    );

  return {
    serviceName:
      service?.name || "Service",

    category:
      service?.category || "",

    icon:
      service?.icon || "🔧",

    currentKm: current,

    lastServiceKm:
      lastServiceKm !== null &&
      lastServiceKm !== undefined
        ? Number(lastServiceKm)
        : null,

    interval: serviceInterval,

    dueKm,

    remainingKm:
      reminderStatus.remainingKm,

    status:
      reminderStatus.status,

    className:
      reminderStatus.className,

    description:
      service?.description || "",
  };
}

// get reminders for selected bike
export function getServiceReminders(
  bike,
  services
) {
  if (
    !bike ||
    !Array.isArray(services)
  ) {
    return [];
  }

  const history =
    Array.isArray(
      bike.serviceHistory
    )
      ? bike.serviceHistory
      : [];

  const currentKm =
    Number(bike.odometer) || 0;

  return services
    .filter(
      (service) =>
        service &&
        service.name
    )
    .map((service) => {
      const serviceName =
        String(
          service.name
        ).toLowerCase();

      let keywords = [];

      if (
        serviceName.includes("oil")
      ) {
        keywords = [
          "engine oil",
          "oil change",
          "oil",
        ];
      } else if (
        serviceName.includes("chain")
      ) {
        keywords = ["chain"];
      } else if (
        serviceName.includes("brake")
      ) {
        keywords = ["brake"];
      } else if (
        serviceName.includes(
          "air filter"
        )
      ) {
        keywords = [
          "air filter",
        ];
      } else if (
        serviceName.includes(
          "spark"
        )
      ) {
        keywords = [
          "spark plug",
        ];
      } else if (
        serviceName.includes(
          "general"
        )
      ) {
        keywords = [
          "general service",
        ];
      } else {
        keywords = [
          serviceName,
        ];
      }

      const lastService =
        getLastService(
          history,
          keywords
        );

      const lastServiceKm =
        lastService
          ? Number(
              lastService.kilometers
            )
          : null;

      return createServiceReminder({
        service,
        currentKm,
        interval:
          service.interval,
        lastServiceKm,
      });
    });
}

// get due reminders
export function getDueReminders(
  reminders
) {
  if (
    !Array.isArray(reminders)
  ) {
    return [];
  }

  return reminders.filter(
    (reminder) =>
      reminder.status === "Due"
  );
}

// get due soon reminders
export function getDueSoonReminders(
  reminders
) {
  if (
    !Array.isArray(reminders)
  ) {
    return [];
  }

  return reminders.filter(
    (reminder) =>
      reminder.status ===
      "Due Soon"
  );
}

// get upcoming reminders
export function getUpcomingReminders(
  reminders
) {
  if (
    !Array.isArray(reminders)
  ) {
    return [];
  }

  return reminders.filter(
    (reminder) =>
      reminder.status ===
      "Upcoming"
  );
}