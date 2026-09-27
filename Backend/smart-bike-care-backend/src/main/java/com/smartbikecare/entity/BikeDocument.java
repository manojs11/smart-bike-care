package com.smartbikecare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents", uniqueConstraints = @UniqueConstraint(columnNames = { "bike_id", "document_type" }))
public class BikeDocument {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "bike_id", nullable = false)
	private Bike bike;
	@Column(name = "document_type", nullable = false)
	private String type;
	private String registrationNumber, ownerName, vehicleDetails, policyNumber, insuranceProvider;
	private java.time.LocalDate registrationDate, startDate, insuranceExpiryDate, testDate, pollutionExpiryDate,
			issueDate, licenceExpiryDate;
	private String certificateNumber, emissionDetails, licenceNumber, holderName;
	private String fileName, fileType;
	private Long fileSize;
	@Lob
	@Column(columnDefinition = "LONGTEXT")
	private String fileData;
	private LocalDateTime updatedAt;

	@PrePersist
	@PreUpdate
	void updateTime() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long v) {
		id = v;
	}

	public Bike getBike() {
		return bike;
	}

	public void setBike(Bike v) {
		bike = v;
	}

	public String getType() {
		return type;
	}

	public void setType(String v) {
		type = v;
	}

	public String getRegistrationNumber() {
		return registrationNumber;
	}

	public void setRegistrationNumber(String v) {
		registrationNumber = v;
	}

	public String getOwnerName() {
		return ownerName;
	}

	public void setOwnerName(String v) {
		ownerName = v;
	}

	public String getVehicleDetails() {
		return vehicleDetails;
	}

	public void setVehicleDetails(String v) {
		vehicleDetails = v;
	}

	public String getPolicyNumber() {
		return policyNumber;
	}

	public void setPolicyNumber(String v) {
		policyNumber = v;
	}

	public String getInsuranceProvider() {
		return insuranceProvider;
	}

	public void setInsuranceProvider(String v) {
		insuranceProvider = v;
	}

	public java.time.LocalDate getRegistrationDate() {
		return registrationDate;
	}

	public void setRegistrationDate(java.time.LocalDate v) {
		registrationDate = v;
	}

	public java.time.LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(java.time.LocalDate v) {
		startDate = v;
	}

	public java.time.LocalDate getInsuranceExpiryDate() {
		return insuranceExpiryDate;
	}

	public void setInsuranceExpiryDate(java.time.LocalDate v) {
		insuranceExpiryDate = v;
	}

	public java.time.LocalDate getTestDate() {
		return testDate;
	}

	public void setTestDate(java.time.LocalDate v) {
		testDate = v;
	}

	public java.time.LocalDate getPollutionExpiryDate() {
		return pollutionExpiryDate;
	}

	public void setPollutionExpiryDate(java.time.LocalDate v) {
		pollutionExpiryDate = v;
	}

	public java.time.LocalDate getIssueDate() {
		return issueDate;
	}

	public void setIssueDate(java.time.LocalDate v) {
		issueDate = v;
	}

	public java.time.LocalDate getLicenceExpiryDate() {
		return licenceExpiryDate;
	}

	public void setLicenceExpiryDate(java.time.LocalDate v) {
		licenceExpiryDate = v;
	}

	public String getCertificateNumber() {
		return certificateNumber;
	}

	public void setCertificateNumber(String v) {
		certificateNumber = v;
	}

	public String getEmissionDetails() {
		return emissionDetails;
	}

	public void setEmissionDetails(String v) {
		emissionDetails = v;
	}

	public String getLicenceNumber() {
		return licenceNumber;
	}

	public void setLicenceNumber(String v) {
		licenceNumber = v;
	}

	public String getHolderName() {
		return holderName;
	}

	public void setHolderName(String v) {
		holderName = v;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String v) {
		fileName = v;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String v) {
		fileType = v;
	}

	public Long getFileSize() {
		return fileSize;
	}

	public void setFileSize(Long v) {
		fileSize = v;
	}

	public String getFileData() {
		return fileData;
	}

	public void setFileData(String v) {
		fileData = v;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
