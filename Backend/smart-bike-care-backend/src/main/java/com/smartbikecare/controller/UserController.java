package com.smartbikecare.controller;

import com.smartbikecare.dto.AuthDtos.UserResponse;
import com.smartbikecare.dto.Requests.*;
import com.smartbikecare.entity.User;
import com.smartbikecare.security.JwtService;
import com.smartbikecare.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;
    private final JwtService jwtService;

    public UserController(
            UserService s,
            JwtService j) {

        service = s;
        jwtService = j;
    }

    // =========================================================
    // GET CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public UserResponse me(
            @AuthenticationPrincipal User u) {

        return service.profile(u);
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    @PutMapping("/me")
    public ResponseEntity<UserResponse> update(
            @AuthenticationPrincipal User u,
            @Valid @RequestBody ProfileRequest r) {

        UserResponse response =
                service.updateProfile(u, r);

        /*
         * If the email was changed, the existing JWT contains
         * the old email. Generate a new token and return it
         * through a response header.
         */
        String newToken =
                jwtService.generateToken(
                        response.email()
                );

        return ResponseEntity
                .ok()
                .header(
                        "X-New-Token",
                        newToken
                )
                .body(response);
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @PutMapping("/me/password")
    public Map<String, Object> password(
            @AuthenticationPrincipal User u,
            @Valid @RequestBody PasswordRequest r) {

        service.changePassword(u, r);

        return Map.of(
                "success",
                true,
                "message",
                "Password changed successfully"
        );
    }
}