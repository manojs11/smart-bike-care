package com.smartbikecare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bikes", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "registration_number" }))
public class Bike {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	@Column(nullable = false)
	private String brand;
	@Column(nullable = false)
	private String model;
	@Column(name = "registration_number", nullable = false)
	private String registrationNumber;
	private Integer year;
	private LocalDate purchaseDate;
	@Column(nullable = false)
	private Integer odometer = 0;
	@Column(nullable = false)
	private Integer health = 100;
	@Column(nullable = false)
	private String status = "Good";
	private LocalDate lastService;
	@Column(nullable = false)
	private Integer nextService = 5000;
	@Lob
	@Column(columnDefinition = "LONGTEXT")
	private String imageData;

	@OneToMany(mappedBy = "bike", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ServiceRecord> serviceHistory = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public void setId(Long v) {
		id = v;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User v) {
		user = v;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String v) {
		brand = v;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String v) {
		model = v;
	}

	public String getRegistrationNumber() {
		return registrationNumber;
	}

	public void setRegistrationNumber(String v) {
		registrationNumber = v;
	}

	public Integer getYear() {
		return year;
	}

	public void setYear(Integer v) {
		year = v;
	}

	public LocalDate getPurchaseDate() {
		return purchaseDate;
	}

	public void setPurchaseDate(LocalDate v) {
		purchaseDate = v;
	}

	public Integer getOdometer() {
		return odometer;
	}

	public void setOdometer(Integer v) {
		odometer = v;
	}

	public Integer getHealth() {
		return health;
	}

	public void setHealth(Integer v) {
		health = v;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String v) {
		status = v;
	}

	public LocalDate getLastService() {
		return lastService;
	}

	public void setLastService(LocalDate v) {
		lastService = v;
	}

	public Integer getNextService() {
		return nextService;
	}

	public void setNextService(Integer v) {
		nextService = v;
	}

	public String getImageData() {
		return imageData;
	}

	public void setImageData(String v) {
		imageData = v;
	}

	public List<ServiceRecord> getServiceHistory() {
		return serviceHistory;
	}

	public void setServiceHistory(List<ServiceRecord> v) {
		serviceHistory = v;
	}
}
