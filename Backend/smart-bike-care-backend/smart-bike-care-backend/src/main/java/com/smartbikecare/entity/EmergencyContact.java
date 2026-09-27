package com.smartbikecare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "emergency_contacts")
public class EmergencyContact {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;
	@Column(nullable = false)
	private String name;
	@Column(nullable = false)
	private String relationship;
	@Column(nullable = false)
	private String phone;

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

	public String getName() {
		return name;
	}

	public void setName(String v) {
		name = v;
	}

	public String getRelationship() {
		return relationship;
	}

	public void setRelationship(String v) {
		relationship = v;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String v) {
		phone = v;
	}
}
