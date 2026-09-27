package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.*;
import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class BikeService {

    private final BikeRepository bikes;
    private final ServiceRecordRepository serviceRecords;

    public BikeService(
            BikeRepository b,
            ServiceRecordRepository serviceRecords) {

        bikes = b;
        this.serviceRecords = serviceRecords;
    }

    // =========================================================
    // GET ALL BIKES
    // =========================================================

    public List<Bike> all(User u) {
        return bikes.findByUserOrderByIdDesc(u);
    }

    // =========================================================
    // GET BIKE
    // =========================================================

    public Bike get(User u, Long id) {

        return bikes.findByIdAndUser(id, u)
                .orElseThrow(
                        () -> new NoSuchElementException("Bike not found")
                );
    }

    // =========================================================
    // CREATE BIKE
    // =========================================================

    public Bike create(User u, BikeRequest r) {

        String reg = r.registrationNumber()
                .trim()
                .toUpperCase();

        if (bikes.existsByUserAndRegistrationNumberIgnoreCase(u, reg)) {
            throw new IllegalArgumentException(
                    "Registration number already exists"
            );
        }

        Bike b = new Bike();

        b.setUser(u);

        apply(b, r);

        b.setRegistrationNumber(reg);

        b.setNextService(r.odometer() + 5000);

        refreshStatus(b);

        return bikes.save(b);
    }

    // =========================================================
    // UPDATE BIKE
    // =========================================================

    public Bike update(
            User u,
            Long id,
            BikeRequest r) {

        Bike b = get(u, id);

        String reg = r.registrationNumber()
                .trim()
                .toUpperCase();

        if (bikes.existsByUserAndRegistrationNumberIgnoreCaseAndIdNot(
                u,
                reg,
                id)) {

            throw new IllegalArgumentException(
                    "Registration number already exists"
            );
        }

        if (r.odometer() < b.getOdometer()) {

            throw new IllegalArgumentException(
                    "Odometer cannot be reduced"
            );
        }

        apply(b, r);

        b.setRegistrationNumber(reg);

        refreshStatus(b);

        return bikes.save(b);
    }

    // =========================================================
    // UPDATE ODOMETER
    // =========================================================

    public Bike updateOdometer(
            User u,
            Long id,
            int km) {

        Bike b = get(u, id);

        if (km < b.getOdometer()) {

            throw new IllegalArgumentException(
                    "Odometer cannot be reduced"
            );
        }

        b.setOdometer(km);

        refreshStatus(b);

        return bikes.save(b);
    }

    // =========================================================
    // DELETE BIKE
    // =========================================================

    public void delete(User u, Long id) {

        bikes.delete(get(u, id));
    }

    // =========================================================
    // REFRESH BIKE STATUS
    // =========================================================

    public void refreshStatus(Bike b) {

        int km = b.getOdometer() == null
                ? 0
                : b.getOdometer();

        int next = b.getNextService() == null
                ? km + 5000
                : b.getNextService();

        if (km >= next) {

            b.setStatus("Service Due");

        } else if (next - km <= 500) {

            b.setStatus("Service Soon");

        } else {

            b.setStatus("Good");
        }

        if (b.getHealth() == null) {
            b.setHealth(100);
        }

        b.setHealth(
                Math.max(
                        0,
                        Math.min(
                                100,
                                b.getHealth()
                        )
                )
        );
    }

    // =========================================================
    // BIKE HEALTH
    // =========================================================

    public Map<String, Object> getHealth(
            User u,
            Long bikeId) {

        Bike bike = get(u, bikeId);

        List<ServiceRecord> records =
                serviceRecords.findByBikeOrderByDateDescIdDesc(bike);

        int odometer = bike.getOdometer() == null
                ? 0
                : bike.getOdometer();

        int nextService = bike.getNextService() == null
                ? odometer + 5000
                : bike.getNextService();

        int remainingKm = nextService - odometer;

        // -----------------------------------------------------
        // Component scores
        // -----------------------------------------------------

        int engineScore = calculateEngineScore(
                records,
                remainingKm
        );

        int brakeScore = calculateComponentScore(
                records,
                "brake",
                odometer,
                5000,
                95
        );

        int tyreScore = calculateComponentScore(
                records,
                "tyre",
                odometer,
                3000,
                95
        );

        int batteryScore = calculateComponentScore(
                records,
                "battery",
                odometer,
                5000,
                95
        );

        int chainScore = calculateComponentScore(
                records,
                "chain",
                odometer,
                1000,
                95
        );

        int oilScore = calculateOilScore(
                records,
                odometer,
                remainingKm
        );

        int overallScore = Math.round(
                (
                        engineScore
                                + brakeScore
                                + tyreScore
                                + batteryScore
                                + chainScore
                                + oilScore
                ) / 6.0f
        );

        // -----------------------------------------------------
        // Overall status
        // -----------------------------------------------------

        String overallStatus;

        if (overallScore >= 90) {

            overallStatus = "Excellent";

        } else if (overallScore >= 75) {

            overallStatus = "Good";

        } else if (overallScore >= 60) {

            overallStatus = "Needs Attention";

        } else {

            overallStatus = "Critical";
        }

        // -----------------------------------------------------
        // Service status
        // -----------------------------------------------------

        String serviceStatus;

        if (remainingKm <= 0) {

            serviceStatus = "Service Due";

        } else if (remainingKm <= 500) {

            serviceStatus = "Service Soon";

        } else {

            serviceStatus = "Good";
        }

        // -----------------------------------------------------
        // Last service
        // -----------------------------------------------------

        LocalDate lastService = null;

        if (!records.isEmpty()) {

            lastService = records.get(0).getDate();
        }

        // -----------------------------------------------------
        // Health alerts
        // -----------------------------------------------------

        List<Map<String, Object>> alerts =
                new ArrayList<>();

        if (remainingKm <= 0) {

            alerts.add(
                    createAlert(
                            "Service Due",
                            "Your bike has reached the recommended service interval.",
                            "high"
                    )
            );

        } else if (remainingKm <= 500) {

            alerts.add(
                    createAlert(
                            "Service Soon",
                            remainingKm
                                    + " km remaining before the next service.",
                            "medium"
                    )
            );
        }

        if (oilScore <= 60) {

            alerts.add(
                    createAlert(
                            "Engine Oil",
                            "Engine oil service should be checked.",
                            "high"
                    )
            );
        }

        if (chainScore <= 60) {

            alerts.add(
                    createAlert(
                            "Chain",
                            "Chain maintenance should be checked.",
                            "medium"
                    )
            );
        }

        if (brakeScore <= 60) {

            alerts.add(
                    createAlert(
                            "Brakes",
                            "Brake inspection is recommended.",
                            "high"
                    )
            );
        }

        if (tyreScore <= 60) {

            alerts.add(
                    createAlert(
                            "Tyres",
                            "Tyre condition should be inspected.",
                            "medium"
                    )
            );
        }

        // -----------------------------------------------------
        // Component response
        // -----------------------------------------------------

        List<Map<String, Object>> components =
                new ArrayList<>();

        components.add(
                component(
                        "Engine",
                        engineScore,
                        "Engine condition"
                )
        );

        components.add(
                component(
                        "Brakes",
                        brakeScore,
                        "Brake system"
                )
        );

        components.add(
                component(
                        "Tyres",
                        tyreScore,
                        "Tyre condition"
                )
        );

        components.add(
                component(
                        "Battery",
                        batteryScore,
                        "Battery condition"
                )
        );

        components.add(
                component(
                        "Chain",
                        chainScore,
                        "Chain condition"
                )
        );

        components.add(
                component(
                        "Oil",
                        oilScore,
                        "Engine oil condition"
                )
        );

        // -----------------------------------------------------
        // Response
        // -----------------------------------------------------

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("bikeId", bike.getId());
        response.put("brand", bike.getBrand());
        response.put("model", bike.getModel());
        response.put(
                "registrationNumber",
                bike.getRegistrationNumber()
        );

        response.put("odometer", odometer);

        response.put(
                "nextService",
                nextService
        );

        response.put(
                "remainingKm",
                remainingKm
        );

        response.put(
                "lastService",
                lastService
        );

        response.put(
                "bikeStatus",
                bike.getStatus()
        );

        response.put(
                "storedHealth",
                bike.getHealth()
        );

        response.put(
                "healthScore",
                overallScore
        );

        response.put(
                "healthStatus",
                overallStatus
        );

        response.put(
                "serviceStatus",
                serviceStatus
        );

        response.put(
                "components",
                components
        );

        response.put(
                "alerts",
                alerts
        );

        response.put(
                "serviceHistory",
                records
        );

        response.put(
                "imageData",
                bike.getImageData()
        );

        return response;
    }

    // =========================================================
    // ENGINE SCORE
    // =========================================================

    private int calculateEngineScore(
            List<ServiceRecord> records,
            int remainingKm) {

        boolean engineService =
                hasService(
                        records,
                        "oil",
                        "engine",
                        "general",
                        "full"
                );

        if (remainingKm <= 0) {
            return engineService ? 70 : 65;
        }

        if (remainingKm <= 500) {
            return engineService ? 88 : 85;
        }

        return engineService ? 100 : 95;
    }

    // =========================================================
    // OIL SCORE
    // =========================================================

    private int calculateOilScore(
            List<ServiceRecord> records,
            int odometer,
            int remainingKm) {

        ServiceRecord oil =
                findLatestService(
                        records,
                        "oil"
                );

        if (oil == null) {

            if (remainingKm <= 0) {
                return 60;
            }

            if (remainingKm <= 500) {
                return 82;
            }

            return 96;
        }

        int kmSinceOil =
                odometer - oil.getKilometers();

        if (kmSinceOil >= 3000) {
            return 60;
        }

        if (kmSinceOil >= 2500) {
            return 82;
        }

        return 96;
    }

    // =========================================================
    // GENERIC COMPONENT SCORE
    // =========================================================

    private int calculateComponentScore(
            List<ServiceRecord> records,
            String keyword,
            int odometer,
            int interval,
            int defaultScore) {

        ServiceRecord latest =
                findLatestService(
                        records,
                        keyword
                );

        if (latest == null) {

            return defaultScore;
        }

        int kmSinceService =
                odometer - latest.getKilometers();

        if (kmSinceService >= interval) {
            return 60;
        }

        if (kmSinceService >= interval - 500) {
            return 80;
        }

        return defaultScore;
    }

    // =========================================================
    // FIND SERVICE
    // =========================================================

    private ServiceRecord findLatestService(
            List<ServiceRecord> records,
            String keyword) {

        for (ServiceRecord record : records) {

            String service = record.getService();

            if (service == null) {
                continue;
            }

            String value =
                    service.toLowerCase();

            if (value.contains(keyword.toLowerCase())) {
                return record;
            }
        }

        return null;
    }

    // =========================================================
    // CHECK SERVICE
    // =========================================================

    private boolean hasService(
            List<ServiceRecord> records,
            String... keywords) {

        for (ServiceRecord record : records) {

            if (record.getService() == null) {
                continue;
            }

            String service =
                    record.getService().toLowerCase();

            for (String keyword : keywords) {

                if (service.contains(
                        keyword.toLowerCase())) {

                    return true;
                }
            }
        }

        return false;
    }

    // =========================================================
    // COMPONENT MAP
    // =========================================================

    private Map<String, Object> component(
            String name,
            int score,
            String description) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put("name", name);
        map.put("score", score);
        map.put(
                "status",
                getComponentStatus(score)
        );
        map.put("description", description);

        return map;
    }

    // =========================================================
    // COMPONENT STATUS
    // =========================================================

    private String getComponentStatus(int score) {

        if (score >= 90) {
            return "Excellent";
        }

        if (score >= 75) {
            return "Good";
        }

        if (score >= 60) {
            return "Needs Attention";
        }

        return "Critical";
    }

    // =========================================================
    // ALERT MAP
    // =========================================================

    private Map<String, Object> createAlert(
            String title,
            String message,
            String severity) {

        Map<String, Object> alert =
                new LinkedHashMap<>();

        alert.put("title", title);
        alert.put("message", message);
        alert.put("severity", severity);

        return alert;
    }

    // =========================================================
    // APPLY BIKE REQUEST
    // =========================================================

    private void apply(
            Bike b,
            BikeRequest r) {

        b.setBrand(r.brand().trim());
        b.setModel(r.model().trim());
        b.setYear(r.year());
        b.setPurchaseDate(r.purchaseDate());
        b.setOdometer(r.odometer());
        b.setImageData(r.imageData());

        if (
                b.getNextService() == null
                        || b.getNextService() < r.odometer()
        ) {

            b.setNextService(
                    r.odometer() + 5000
            );
        }
    }
}