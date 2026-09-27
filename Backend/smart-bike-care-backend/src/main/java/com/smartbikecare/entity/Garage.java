package com.smartbikecare.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "garages")
public class Garage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(nullable = false)
	private String name;
	private String address, phone, city;
	private Double latitude, longitude;
	private String services;
	private String openingHours;

	public Long getId() {
		return id;
	}

	public void setId(Long v) {
		id = v;
	}

	public String getName() {
		return name;
	}

	public void setName(String v) {
		name = v;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String v) {
		address = v;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String v) {
		phone = v;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String v) {
		city = v;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double v) {
		latitude = v;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double v) {
		longitude = v;
	}

	public String getServices() {
		return services;
	}

	public void setServices(String v) {
		services = v;
	}

	public String getOpeningHours() {
		return openingHours;
	}

	public void setOpeningHours(String v) {
		openingHours = v;
	}
}
