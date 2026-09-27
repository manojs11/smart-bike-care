package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.SettingsRequest;
import com.smartbikecare.entity.*;
import com.smartbikecare.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
	private final SettingsService service;

	public SettingsController(SettingsService s) {
		service = s;
	}

	@GetMapping
	public UserSettings get(@AuthenticationPrincipal User u) {
		return service.get(u);
	}

	@PutMapping
	public UserSettings save(@AuthenticationPrincipal User u, @Valid @RequestBody SettingsRequest r) {
		return service.save(u, r);
	}
}
