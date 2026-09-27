package com.smartbikecare.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public final class Requests {

    private Requests() {
    }

    public record ProfileRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank @Pattern(regexp = "^[0-9]{10}$") String phone,
            @NotBlank String address,
            @NotBlank String city,
            @NotBlank String state,
            @NotBlank @Pattern(regexp = "^[0-9]{6}$") String pincode,
            String photoData
    ) {
    }

    public record PasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 6) String newPassword
    ) {
    }

    public record BikeRequest(
            @NotBlank String brand,
            @NotBlank String model,
            @NotBlank String registrationNumber,
            @NotNull Integer year,
            @NotNull LocalDate purchaseDate,
            @NotNull @Min(0) Integer odometer,
            String imageData
    ) {
    }

    public record OdometerRequest(
            @NotNull @Min(0) Integer odometer
    ) {
    }

    public record ServiceRequest(
            @NotBlank String service,
            @NotNull LocalDate date,
            @NotNull @Min(0) Integer kilometers,
            @NotNull @DecimalMin("0.0") Double amount,
            @NotBlank String status,
            String billName,
            String billType,
            Long billSize,
            String billData
    ) {
    }

    public record DocumentRequest(
            @NotBlank String type,

            String registrationNumber,
            String ownerName,
            LocalDate registrationDate,
            String vehicleDetails,

            String policyNumber,
            String insuranceProvider,
            LocalDate startDate,
            LocalDate insuranceExpiryDate,

            String certificateNumber,
            LocalDate testDate,
            LocalDate pollutionExpiryDate,
            String emissionDetails,

            String licenceNumber,
            String holderName,
            LocalDate issueDate,
            LocalDate licenceExpiryDate,

            String fileName,
            String fileType,
            Long fileSize,
            String fileData
    ) {
    }

    public record EmergencyRequest(
            @NotBlank String name,
            @NotBlank String relationship,
            @NotBlank String phone
    ) {
    }

    public record SettingsRequest(
            boolean serviceNotifications,
            boolean serviceDueAlerts,
            boolean documentExpiryAlerts,
            boolean reminderNotifications,
            boolean emergencyAlerts,
            boolean serviceReminders,
            String reminderFrequency,
            String serviceDueThreshold,
            boolean documentReminders
    ) {
    }

    public record ContactRequest(
            @NotBlank String name,
            @NotBlank @Email String email,
            @NotBlank String subject,
            @NotBlank @Size(min = 10) String message
    ) {
    }
}