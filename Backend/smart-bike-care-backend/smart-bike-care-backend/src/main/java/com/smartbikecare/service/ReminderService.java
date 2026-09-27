package com.smartbikecare.service;

import com.smartbikecare.entity.Bike;
import com.smartbikecare.entity.ServiceRecord;
import com.smartbikecare.entity.User;
import com.smartbikecare.repository.BikeRepository;
import com.smartbikecare.repository.ServiceRecordRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReminderService {

    private final BikeRepository bikes;
    private final ServiceRecordRepository records;

    public ReminderService(BikeRepository bikes,
                           ServiceRecordRepository records) {
        this.bikes = bikes;
        this.records = records;
    }

    public List<Map<String, Object>> reminders(User user, Long bikeId) {

        Bike bike = bikes.findByIdAndUser(bikeId, user)
                .orElseThrow(() ->
                        new NoSuchElementException("Bike not found"));

        List<ServiceRecord> history =
                records.findByBikeOrderByDateDescIdDesc(bike);

        List<Map<String, Object>> reminders = new ArrayList<>();

        addReminder(
                reminders,
                "Engine Oil Change",
                "Engine",
                3000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Brake Inspection",
                "Brakes",
                5000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Chain Cleaning & Lubrication",
                "Chain",
                1000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Tyre Inspection",
                "Tyres",
                3000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Battery Check",
                "Electrical",
                5000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Air Filter Cleaning",
                "Engine",
                5000,
                bike,
                history
        );

        addReminder(
                reminders,
                "Spark Plug Inspection",
                "Engine",
                8000,
                bike,
                history
        );

        addReminder(
                reminders,
                "General Service",
                "Maintenance",
                5000,
                bike,
                history
        );

        return reminders;
    }

    private void addReminder(
            List<Map<String, Object>> reminders,
            String serviceName,
            String category,
            int interval,
            Bike bike,
            List<ServiceRecord> history) {

        int lastServiceKm = findLastServiceKm(
                serviceName,
                history
        );

        int currentKm = bike.getOdometer();

        /*
         * If service was previously recorded:
         *
         * due = last service KM + interval
         *
         * If service was never recorded:
         *
         * due = current KM + interval
         */
        int dueKm;

        if (lastServiceKm > 0) {
            dueKm = lastServiceKm + interval;
        } else {
            dueKm = currentKm + interval;
        }

        int remainingKm = dueKm - currentKm;

        String status;

        if (remainingKm <= 0) {
            status = "Due";
        } else if (remainingKm <= 500) {
            status = "Due Soon";
        } else {
            status = "Upcoming";
        }

        Map<String, Object> reminder =
                new LinkedHashMap<>();

        reminder.put("serviceName", serviceName);
        reminder.put("category", category);
        reminder.put("currentKm", currentKm);

        reminder.put(
                "lastServiceKm",
                lastServiceKm == 0
                        ? null
                        : lastServiceKm
        );

        reminder.put("interval", interval);
        reminder.put("dueKm", dueKm);
        reminder.put(
                "remainingKm",
                Math.max(0, remainingKm)
        );

        reminder.put("status", status);

        reminder.put(
                "description",
                getDescription(serviceName)
        );

        reminders.add(reminder);
    }

    private int findLastServiceKm(
            String serviceName,
            List<ServiceRecord> history) {

        int lastKm = 0;

        for (ServiceRecord record : history) {

            if (record.getService() == null ||
                record.getKilometers() == null) {
                continue;
            }

            String recordedService =
                    record.getService().toLowerCase();

            if (matchesService(
                    serviceName,
                    recordedService)) {

                lastKm = Math.max(
                        lastKm,
                        record.getKilometers()
                );
            }
        }

        return lastKm;
    }

    private boolean matchesService(
            String serviceName,
            String recordedService) {

        String name = serviceName.toLowerCase();

        if (name.contains("oil")) {
            return recordedService.contains("oil");
        }

        if (name.contains("brake")) {
            return recordedService.contains("brake");
        }

        if (name.contains("chain")) {
            return recordedService.contains("chain");
        }

        if (name.contains("tyre")) {
            return recordedService.contains("tyre")
                    || recordedService.contains("tire");
        }

        if (name.contains("battery")) {
            return recordedService.contains("battery");
        }

        if (name.contains("air filter")) {
            return recordedService.contains("air filter");
        }

        if (name.contains("spark")) {
            return recordedService.contains("spark");
        }

        if (name.contains("general")) {
            return recordedService.contains("general")
                    || recordedService.contains("full service");
        }

        return recordedService.contains(name);
    }

    private String getDescription(String serviceName) {

        if (serviceName.contains("Oil")) {
            return "Replace engine oil at the recommended interval.";
        }

        if (serviceName.contains("Brake")) {
            return "Inspect brake pads, discs and braking performance.";
        }

        if (serviceName.contains("Chain")) {
            return "Clean, inspect and lubricate the drive chain.";
        }

        if (serviceName.contains("Tyre")) {
            return "Check tyre pressure, tread and overall condition.";
        }

        if (serviceName.contains("Battery")) {
            return "Check battery condition, terminals and voltage.";
        }

        if (serviceName.contains("Air Filter")) {
            return "Inspect and clean or replace the air filter.";
        }

        if (serviceName.contains("Spark")) {
            return "Inspect the spark plug and replace if required.";
        }

        if (serviceName.contains("General")) {
            return "Perform a complete motorcycle maintenance check.";
        }

        return "Recommended maintenance service.";
    }
}