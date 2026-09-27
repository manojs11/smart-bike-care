package com.smartbikecare.controller;

import com.smartbikecare.dto.AuthDtos.*;
import com.smartbikecare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	private final UserService service;

	public AuthController(UserService s) {
		service = s;
	}

	@PostMapping("/register")
	public AuthResponse register(@Valid @RequestBody RegisterRequest r) {
		return service.register(r);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest r) {
		return service.login(r);
	}

	@PostMapping("/logout")
	public java.util.Map<String, Object> logout() {
		return java.util.Map.of("success", true, "message", "Logged out successfully");
	}
}
