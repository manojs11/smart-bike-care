package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.ServiceRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ServiceRecordService {

    private final ServiceRecordRepository records;
    private final BikeRepository bikes;

    public ServiceRecordService(
            ServiceRecordRepository r,
            BikeRepository b) {

        records = r;
        bikes = b;
    }

    // =========================================================
    // GET ALL SERVICES
    // =========================================================

    public List<ServiceRecord> all(
            User u,
            Long bikeId) {

        Bike b =
                ownedBike(u, bikeId);

        return records.findByBikeOrderByDateDescIdDesc(b);
    }

    // =========================================================
    // GET ONE SERVICE
    // =========================================================

    public ServiceRecord get(
            User u,
            Long id) {

        ServiceRecord s =
                records.findById(id)
                        .orElseThrow(
                                () -> new NoSuchElementException(
                                        "Service record not found"
                                )
                        );

        // Verify ownership
        ownedBike(
                u,
                s.getBike().getId()
        );

        return s;
    }

    // =========================================================
    // CREATE SERVICE
    // =========================================================

    @Transactional
    public ServiceRecord create(
            User u,
            Long bikeId,
            ServiceRequest r) {

        Bike b =
                ownedBike(
                        u,
                        bikeId
                );

        // -----------------------------------------------------
        // Validate service kilometers
        // -----------------------------------------------------

        if (r.kilometers() < b.getOdometer()) {

            throw new IllegalArgumentException(
                    "Service kilometers cannot be below current odometer"
            );
        }

        ServiceRecord s =
                new ServiceRecord();

        s.setBike(b);

        s.setService(
                r.service()
                        .trim()
        );

        s.setDate(
                r.date()
        );

        s.setKilometers(
                r.kilometers()
        );

        s.setAmount(
                r.amount()
        );

        s.setStatus(
                r.status()
        );

        s.setBillName(
                r.billName()
        );

        s.setBillType(
                r.billType()
        );

        s.setBillSize(
                r.billSize()
        );

        s.setBillData(
                r.billData()
        );

        ServiceRecord saved =
                records.save(s);

        // -----------------------------------------------------
        // Update bike information
        // -----------------------------------------------------

        b.setOdometer(
                Math.max(
                        b.getOdometer(),
                        r.kilometers()
                )
        );

        synchronizeBikeFromLatestService(
                b
        );

        bikes.save(b);

        return saved;
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    @Transactional
    public ServiceRecord update(
            User u,
            Long id,
            ServiceRequest r) {

        ServiceRecord s =
                get(
                        u,
                        id
                );

        Bike b =
                s.getBike();

        // -----------------------------------------------------
        // Service kilometers cannot be below current odometer
        // -----------------------------------------------------

        if (r.kilometers() < b.getOdometer()) {

            throw new IllegalArgumentException(
                    "Service kilometers cannot be below current odometer"
            );
        }

        s.setService(
                r.service()
                        .trim()
        );

        s.setDate(
                r.date()
        );

        s.setKilometers(
                r.kilometers()
        );

        s.setAmount(
                r.amount()
        );

        s.setStatus(
                r.status()
        );

        s.setBillName(
                r.billName()
        );

        s.setBillType(
                r.billType()
        );

        s.setBillSize(
                r.billSize()
        );

        s.setBillData(
                r.billData()
        );

        ServiceRecord saved =
                records.save(s);

        // -----------------------------------------------------
        // Keep bike information synchronized
        // -----------------------------------------------------

        b.setOdometer(
                Math.max(
                        b.getOdometer(),
                        r.kilometers()
                )
        );

        synchronizeBikeFromLatestService(
                b
        );

        bikes.save(b);

        return saved;
    }

    // =========================================================
    // DELETE SERVICE
    // =========================================================

    @Transactional
    public void delete(
            User u,
            Long id) {

        ServiceRecord service =
                get(
                        u,
                        id
                );

        Bike b =
                service.getBike();

        records.delete(service);

        records.flush();

        // -----------------------------------------------------
        // Recalculate bike service information after deletion
        // -----------------------------------------------------

        synchronizeBikeFromLatestService(
                b
        );

        bikes.save(b);
    }

    // =========================================================
    // OWNERSHIP CHECK
    // =========================================================

    private Bike ownedBike(
            User u,
            Long id) {

        return bikes.findByIdAndUser(
                id,
                u
        ).orElseThrow(
                () -> new NoSuchElementException(
                        "Bike not found"
                )
        );
    }

    // =========================================================
    // SYNCHRONIZE BIKE FROM LATEST SERVICE
    // =========================================================

    private void synchronizeBikeFromLatestService(
            Bike bike) {

        List<ServiceRecord> history =
                records.findByBikeOrderByDateDescIdDesc(
                        bike
                );

        // -----------------------------------------------------
        // No service history
        // -----------------------------------------------------

        if (history.isEmpty()) {

            int odometer =
                    bike.getOdometer() == null
                            ? 0
                            : bike.getOdometer();

            bike.setNextService(
                    odometer + 5000
            );

            bike.setLastService(
                    null
            );

            refreshBikeStatus(
                    bike
            );

            return;
        }

        // -----------------------------------------------------
        // Latest service
        // -----------------------------------------------------

        ServiceRecord latest =
                history.get(0);

        int latestKm =
                latest.getKilometers() == null
                        ? bike.getOdometer()
                        : latest.getKilometers();

        // Odometer should never decrease
        int currentOdometer =
                bike.getOdometer() == null
                        ? 0
                        : bike.getOdometer();

        bike.setOdometer(
                Math.max(
                        currentOdometer,
                        latestKm
                )
        );

        bike.setLastService(
                latest.getDate()
        );

        bike.setNextService(
                latestKm + 5000
        );

        refreshBikeStatus(
                bike
        );
    }

    // =========================================================
    // REFRESH BIKE STATUS
    // =========================================================

    private void refreshBikeStatus(
            Bike bike) {

        int odometer =
                bike.getOdometer() == null
                        ? 0
                        : bike.getOdometer();

        int nextService =
                bike.getNextService() == null
                        ? odometer + 5000
                        : bike.getNextService();

        if (odometer >= nextService) {

            bike.setStatus(
                    "Service Due"
            );

        } else if (
                nextService - odometer <= 500) {

            bike.setStatus(
                    "Service Soon"
            );

        } else {

            bike.setStatus(
                    "Good"
            );
        }
    }
}