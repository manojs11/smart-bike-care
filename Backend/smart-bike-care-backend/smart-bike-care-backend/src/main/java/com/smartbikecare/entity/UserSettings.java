package com.smartbikecare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_settings")
public class UserSettings {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@JsonIgnore
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", unique = true, nullable = false)
	private User user;
	private boolean serviceNotifications = true, serviceDueAlerts = true, documentExpiryAlerts = true,
			reminderNotifications = true, emergencyAlerts = true;
	private boolean serviceReminders = true, documentReminders = true;
	private String reminderFrequency = "7";
	private String serviceDueThreshold = "500";

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

	public boolean isServiceNotifications() {
		return serviceNotifications;
	}

	public void setServiceNotifications(boolean v) {
		serviceNotifications = v;
	}

	public boolean isServiceDueAlerts() {
		return serviceDueAlerts;
	}

	public void setServiceDueAlerts(boolean v) {
		serviceDueAlerts = v;
	}

	public boolean isDocumentExpiryAlerts() {
		return documentExpiryAlerts;
	}

	public void setDocumentExpiryAlerts(boolean v) {
		documentExpiryAlerts = v;
	}

	public boolean isReminderNotifications() {
		return reminderNotifications;
	}

	public void setReminderNotifications(boolean v) {
		reminderNotifications = v;
	}

	public boolean isEmergencyAlerts() {
		return emergencyAlerts;
	}

	public void setEmergencyAlerts(boolean v) {
		emergencyAlerts = v;
	}

	public boolean isServiceReminders() {
		return serviceReminders;
	}

	public void setServiceReminders(boolean v) {
		serviceReminders = v;
	}

	public boolean isDocumentReminders() {
		return documentReminders;
	}

	public void setDocumentReminders(boolean v) {
		documentReminders = v;
	}

	public String getReminderFrequency() {
		return reminderFrequency;
	}

	public void setReminderFrequency(String v) {
		reminderFrequency = v;
	}

	public String getServiceDueThreshold() {
		return serviceDueThreshold;
	}

	public void setServiceDueThreshold(String v) {
		serviceDueThreshold = v;
	}
}
