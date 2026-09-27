package com.smartbikecare.service;

import com.smartbikecare.dto.Requests.ContactRequest;
import com.smartbikecare.entity.ContactMessage;
import com.smartbikecare.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

@Service
public class ContactService {
	private final ContactMessageRepository repo;

	public ContactService(ContactMessageRepository r) {
		repo = r;
	}

	public ContactMessage save(ContactRequest r) {
		ContactMessage c = new ContactMessage();
		c.setName(r.name().trim());
		c.setEmail(r.email().trim().toLowerCase());
		c.setSubject(r.subject().trim());
		c.setMessage(r.message().trim());
		return repo.save(c);
	}
}
