package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.EmergencyRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.service.EmergencyService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/emergency-contacts")
public class EmergencyController {
	private final EmergencyService service;

	public EmergencyController(EmergencyService s) {
		service = s;
	}

	@GetMapping
	public List<EmergencyContact> all(@AuthenticationPrincipal User u) {
		return service.all(u);
	}

	@PostMapping
	public EmergencyContact create(@AuthenticationPrincipal User u, @Valid @RequestBody EmergencyRequest r) {
		return service.save(u, null, r);
	}

	@PutMapping("/{id}")
	public EmergencyContact update(@AuthenticationPrincipal User u, @PathVariable Long id,
			@Valid @RequestBody EmergencyRequest r) {
		return service.save(u, id, r);
	}

	@DeleteMapping("/{id}")
	public Map<String, Object> delete(@AuthenticationPrincipal User u, @PathVariable Long id) {
		service.delete(u, id);
		return Map.of("success", true, "message", "Emergency contact deleted successfully");
	}
}
