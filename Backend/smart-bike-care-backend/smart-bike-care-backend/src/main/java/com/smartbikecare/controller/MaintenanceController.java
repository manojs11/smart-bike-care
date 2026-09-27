package com.smartbikecare.controller;

import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final BikeRepository bikes;
    private final ServiceRecordRepository records;

    public MaintenanceController(BikeRepository b, ServiceRecordRepository r) {
        bikes = b;
        records = r;
    }

    @GetMapping("/services")
    public List<Map<String, Object>> services() {
        return List.of(
                item(1, "Engine Oil Change", "Engine", "Every 3,000 - 5,000 KM", 5000, 800),
                item(2, "Brake Inspection", "Brakes", "Every 5,000 KM", 5000, 500),
                item(3, "Chain Cleaning & Lubrication", "Chain", "Every 1,000 KM", 1000, 300),
                item(4, "Tyre Inspection", "Tyres", "Every 3,000 KM", 3000, 300),
                item(5, "Battery Check", "Electrical", "Every 5,000 KM", 5000, 250),
                item(6, "Air Filter Cleaning", "Engine", "Every 5,000 KM", 5000, 400),
                item(7, "Spark Plug Inspection", "Engine", "Every 8,000 KM", 8000, 350),
                item(8, "General Service", "Maintenance", "Every 5,000 KM", 5000, 1200)
        );
    }

    @GetMapping("/spare-parts")
    public List<Map<String, Object>> parts() {
        return List.of(
                part(1, "Brake Pads", "Brakes", 10000, 900),
                part(2, "Drive Chain", "Chain", 20000, 1800),
                part(3, "Air Filter", "Engine", 15000, 500),
                part(4, "Spark Plug", "Engine", 12000, 400),
                part(5, "Battery", "Electrical", 30000, 1800)
        );
    }

    @GetMapping("/recommendations/{bikeId}")
    public List<Map<String, Object>> recommendations(
            @AuthenticationPrincipal User u,
            @PathVariable Long bikeId) {

        Bike b = bikes.findByIdAndUser(bikeId, u)
                .orElseThrow(() -> new NoSuchElementException("Bike not found"));

        List<ServiceRecord> h = records.findByBikeOrderByDateDescIdDesc(b);

        List<Map<String, Object>> out = new ArrayList<>();

        for (var x : services()) {

            String n = (String) x.get("name");
            int interval = (Integer) x.get("intervalKm");

            int last = 0;

            for (ServiceRecord s : h) {
                if (s.getService() != null &&
                        s.getService()
                                .toLowerCase()
                                .contains(n.split(" ")[0].toLowerCase())) {

                    last = Math.max(last, s.getKilometers());
                }
            }

            int due;

            if (last > 0) {
                due = last + interval;
            } else {
                due = b.getOdometer() + interval;
            }

            int remaining = due - b.getOdometer();

            String status;

            if (remaining <= 0) {
                status = "Due";
            } else if (remaining <= 500) {
                status = "Due Soon";
            } else {
                status = "Not Due";
            }

            Map<String, Object> m = new LinkedHashMap<>(x);

            m.put("currentKm", b.getOdometer());
            m.put("lastServiceKm", last == 0 ? null : last);
            m.put("dueKm", due);
            m.put("remainingKm", Math.max(0, remaining));
            m.put("status", status);

            out.add(m);
        }

        return out.stream()
                .sorted(
                        Comparator.comparingInt(
                                x -> statusOrder((String) x.get("status"))
                        )
                )
                .limit(6)
                .toList();
    }

    private int statusOrder(String s) {
        return "Due".equals(s)
                ? 1
                : "Due Soon".equals(s)
                ? 2
                : 3;
    }

    private Map<String, Object> item(
            int id,
            String name,
            String category,
            String interval,
            int intervalKm,
            int cost) {

        Map<String, Object> m = new LinkedHashMap<>();

        m.put("id", id);
        m.put("name", name);
        m.put("category", category);
        m.put("description", name + " to keep your bike reliable.");
        m.put("interval", interval);
        m.put("intervalKm", intervalKm);
        m.put("estimatedCost", cost);

        return m;
    }

    private Map<String, Object> part(
            int id,
            String name,
            String category,
            int interval,
            int price) {

        Map<String, Object> m = new LinkedHashMap<>();

        m.put("id", id);
        m.put("name", name);
        m.put("category", category);
        m.put("replacementInterval", interval);
        m.put("estimatedPrice", price);

        return m;
    }
}