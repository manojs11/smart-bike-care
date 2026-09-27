package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.*;
import com.smartbikecare.entity.*;
import com.smartbikecare.service.BikeService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/bikes")
public class BikeController {

    private final BikeService service;

    public BikeController(BikeService s) {
        service = s;
    }

    // =========================================================
    // CREATE BIKE
    // =========================================================

    @PostMapping
    public Bike create(
            @AuthenticationPrincipal User u,
            @Valid @RequestBody BikeRequest r) {

        return service.create(u, r);
    }

    // =========================================================
    // GET ALL BIKES
    // =========================================================

    @GetMapping
    public List<Bike> all(
            @AuthenticationPrincipal User u) {

        return service.all(u);
    }

    // =========================================================
    // GET BIKE
    // =========================================================

    @GetMapping("/{id}")
    public Bike get(
            @AuthenticationPrincipal User u,
            @PathVariable Long id) {

        return service.get(u, id);
    }

    // =========================================================
    // UPDATE BIKE
    // =========================================================

    @PutMapping("/{id}")
    public Bike update(
            @AuthenticationPrincipal User u,
            @PathVariable Long id,
            @Valid @RequestBody BikeRequest r) {

        return service.update(u, id, r);
    }

    // =========================================================
    // DELETE BIKE
    // =========================================================

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(
            @AuthenticationPrincipal User u,
            @PathVariable Long id) {

        service.delete(u, id);

        return Map.of(
                "success",
                true,
                "message",
                "Bike deleted successfully"
        );
    }

    // =========================================================
    // UPDATE ODOMETER
    // =========================================================

    @PutMapping("/{id}/odometer")
    public Bike odometer(
            @AuthenticationPrincipal User u,
            @PathVariable Long id,
            @Valid @RequestBody OdometerRequest r) {

        return service.updateOdometer(
                u,
                id,
                r.odometer()
        );
    }

    // =========================================================
    // BIKE HEALTH
    // =========================================================

    @GetMapping("/{id}/health")
    public Map<String, Object> health(
            @AuthenticationPrincipal User u,
            @PathVariable Long id) {

        return service.getHealth(u, id);
    }
}