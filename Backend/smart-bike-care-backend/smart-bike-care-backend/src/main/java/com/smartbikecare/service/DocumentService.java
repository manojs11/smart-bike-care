package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.DocumentRequest;
import com.smartbikecare.entity.Bike;
import com.smartbikecare.entity.BikeDocument;
import com.smartbikecare.entity.User;
import com.smartbikecare.repository.BikeDocumentRepository;
import com.smartbikecare.repository.BikeRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class DocumentService {

    private final BikeDocumentRepository repo;
    private final BikeRepository bikes;

    public DocumentService(
            BikeDocumentRepository r,
            BikeRepository b) {

        repo = r;
        bikes = b;
    }

    public List<BikeDocument> all(User u, Long bikeId) {

        Bike bike = owned(u, bikeId);

        return repo.findByBikeOrderByTypeAsc(bike);
    }

    public BikeDocument save(
            User u,
            Long bikeId,
            DocumentRequest r) {

        Bike bike = owned(u, bikeId);

        String type = r.type().trim().toLowerCase();

        validateType(type);

        BikeDocument document =
                repo.findByBikeAndType(bike, type)
                        .orElseGet(BikeDocument::new);

        document.setBike(bike);
        document.setType(type);

        document.setRegistrationNumber(
                r.registrationNumber()
        );

        document.setOwnerName(
                r.ownerName()
        );

        document.setRegistrationDate(
                r.registrationDate()
        );

        document.setVehicleDetails(
                r.vehicleDetails()
        );

        document.setPolicyNumber(
                r.policyNumber()
        );

        document.setInsuranceProvider(
                r.insuranceProvider()
        );

        document.setStartDate(
                r.startDate()
        );

        document.setInsuranceExpiryDate(
                r.insuranceExpiryDate()
        );

        document.setCertificateNumber(
                r.certificateNumber()
        );

        document.setTestDate(
                r.testDate()
        );

        document.setPollutionExpiryDate(
                r.pollutionExpiryDate()
        );

        document.setEmissionDetails(
                r.emissionDetails()
        );

        document.setLicenceNumber(
                r.licenceNumber()
        );

        document.setHolderName(
                r.holderName()
        );

        document.setIssueDate(
                r.issueDate()
        );

        document.setLicenceExpiryDate(
                r.licenceExpiryDate()
        );

        document.setFileName(
                r.fileName()
        );

        document.setFileType(
                r.fileType()
        );

        document.setFileSize(
                r.fileSize()
        );

        document.setFileData(
                r.fileData()
        );

        return repo.save(document);
    }

    public void delete(
            User u,
            Long bikeId,
            String type) {

        Bike bike = owned(u, bikeId);

        String normalizedType =
                type.trim().toLowerCase();

        BikeDocument document =
                repo.findByBikeAndType(
                        bike,
                        normalizedType
                ).orElseThrow(
                        () -> new NoSuchElementException(
                                "Document not found"
                        )
                );

        repo.delete(document);
    }

    private Bike owned(User u, Long id) {

        return bikes.findByIdAndUser(id, u)
                .orElseThrow(
                        () -> new NoSuchElementException(
                                "Bike not found"
                        )
                );
    }

    private void validateType(String type) {

        if (!type.equals("rc")
                && !type.equals("insurance")
                && !type.equals("pollution")
                && !type.equals("licence")) {

            throw new IllegalArgumentException(
                    "Invalid document type"
            );
        }
    }
}