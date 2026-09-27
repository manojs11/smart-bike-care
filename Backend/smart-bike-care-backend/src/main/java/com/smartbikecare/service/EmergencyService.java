package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.EmergencyRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class EmergencyService {
	private final EmergencyContactRepository repo;

	public EmergencyService(EmergencyContactRepository r) {
		repo = r;
	}

	public List<EmergencyContact> all(User u) {
		return repo.findByUserOrderByIdAsc(u);
	}

	public EmergencyContact save(User u, Long id, EmergencyRequest r) {
		EmergencyContact c = id == null ? new EmergencyContact()
				: repo.findByIdAndUser(id, u).orElseThrow(() -> new NoSuchElementException("Contact not found"));
		c.setUser(u);
		c.setName(r.name().trim());
		c.setRelationship(r.relationship().trim());
		c.setPhone(r.phone().trim());
		return repo.save(c);
	}

	public void delete(User u, Long id) {
		repo.delete(repo.findByIdAndUser(id, u).orElseThrow(() -> new NoSuchElementException("Contact not found")));
	}
}
