package com.smartbikecare.dto;

import jakarta.validation.constraints.*;

public final class AuthDtos {
	private AuthDtos() {
	}

	public record RegisterRequest(@NotBlank String name, @NotBlank @Email String email,
			@NotBlank @Pattern(regexp = "^[0-9]{10}$") String phone, @NotBlank @Size(min = 6) String password) {
	}

	public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
	}

	public record AuthResponse(String token, UserResponse user) {
	}

	public record UserResponse(Long id, String name, String email, String phone, String address, String city,
			String state, String pincode, String photoData) {
	}
}
