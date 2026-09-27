package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.ContactRequest;
import com.smartbikecare.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {
	private final ContactService service;

	public ContactController(ContactService s) {
		service = s;
	}

	@PostMapping
	public Map<String, Object> send(@Valid @RequestBody ContactRequest r) {
		service.save(r);
		return Map.of("success", true, "message", "Your message has been submitted successfully.");
	}
}
