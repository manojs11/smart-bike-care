package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.SettingsRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {
	private final UserSettingsRepository repo;

	public SettingsService(UserSettingsRepository r) {
		repo = r;
	}

	public UserSettings get(User u) {
		return repo.findByUser(u).orElseGet(() -> create(u));
	}

	public UserSettings save(User u, SettingsRequest r) {
		UserSettings s = get(u);
		s.setServiceNotifications(r.serviceNotifications());
		s.setServiceDueAlerts(r.serviceDueAlerts());
		s.setDocumentExpiryAlerts(r.documentExpiryAlerts());
		s.setReminderNotifications(r.reminderNotifications());
		s.setEmergencyAlerts(r.emergencyAlerts());
		s.setServiceReminders(r.serviceReminders());
		s.setReminderFrequency(r.reminderFrequency());
		s.setServiceDueThreshold(r.serviceDueThreshold());
		s.setDocumentReminders(r.documentReminders());
		return repo.save(s);
	}

	private UserSettings create(User u) {
		UserSettings s = new UserSettings();
		s.setUser(u);
		return repo.save(s);
	}
}
