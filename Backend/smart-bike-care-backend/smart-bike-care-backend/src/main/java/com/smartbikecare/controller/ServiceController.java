package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.ServiceRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.service.ServiceRecordService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ServiceController {
	private final ServiceRecordService service;

	public ServiceController(ServiceRecordService s) {
		service = s;
	}

	@PostMapping("/bikes/{bikeId}/services")
	public ServiceRecord create(@AuthenticationPrincipal User u, @PathVariable Long bikeId,
			@Valid @RequestBody ServiceRequest r) {
		return service.create(u, bikeId, r);
	}

	@GetMapping("/bikes/{bikeId}/services")
	public List<ServiceRecord> all(@AuthenticationPrincipal User u, @PathVariable Long bikeId) {
		return service.all(u, bikeId);
	}

	@GetMapping("/services/{id}")
	public ServiceRecord get(@AuthenticationPrincipal User u, @PathVariable Long id) {
		return service.get(u, id);
	}

	@PutMapping("/services/{id}")
	public ServiceRecord update(@AuthenticationPrincipal User u, @PathVariable Long id,
			@Valid @RequestBody ServiceRequest r) {
		return service.update(u, id, r);
	}

	@DeleteMapping("/services/{id}")
	public Map<String, Object> delete(@AuthenticationPrincipal User u, @PathVariable Long id) {
		service.delete(u, id);
		return Map.of("success", true, "message", "Service deleted successfully");
	}
}
