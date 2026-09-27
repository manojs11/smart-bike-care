package com.smartbikecare.service;

import com.smartbikecare.dto.AuthDtos.*;
import com.smartbikecare.dto.Requests.*;
import com.smartbikecare.entity.User;
import com.smartbikecare.repository.UserRepository;
import com.smartbikecare.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public UserService(
            UserRepository r,
            PasswordEncoder e,
            JwtService j) {

        repo = r;
        encoder = e;
        jwt = j;
    }

    // =========================================================
    // REGISTER
    // =========================================================

    public AuthResponse register(RegisterRequest r) {

        String email =
                r.email()
                        .trim()
                        .toLowerCase();

        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        User u = new User();

        u.setName(
                r.name()
                        .trim()
        );

        u.setEmail(email);

        u.setPhone(
                r.phone()
                        .trim()
        );

        u.setPassword(
                encoder.encode(
                        r.password()
                )
        );

        repo.save(u);

        return new AuthResponse(
                jwt.generateToken(email),
                toResponse(u)
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(LoginRequest r) {

        String email =
                r.email()
                        .trim()
                        .toLowerCase();

        User u =
                repo.findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        if (!encoder.matches(
                r.password(),
                u.getPassword())) {

            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        return new AuthResponse(
                jwt.generateToken(
                        u.getEmail()
                ),
                toResponse(u)
        );
    }

    // =========================================================
    // FIND USER
    // =========================================================

    public User findByEmail(String email) {

        return repo.findByEmail(
                email
                        .trim()
                        .toLowerCase()
        ).orElseThrow(
                () -> new IllegalArgumentException(
                        "User not found"
                )
        );
    }

    // =========================================================
    // PROFILE
    // =========================================================

    public UserResponse profile(User u) {
        return toResponse(u);
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    public UserResponse updateProfile(
            User u,
            ProfileRequest r) {

        String newEmail =
                r.email()
                        .trim()
                        .toLowerCase();

        String currentEmail =
                u.getEmail()
                        .trim()
                        .toLowerCase();

        // -----------------------------------------------------
        // Check duplicate email only when email is changed
        // -----------------------------------------------------

        if (!currentEmail.equals(newEmail)
                && repo.existsByEmail(newEmail)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        u.setName(
                r.name()
                        .trim()
        );

        u.setEmail(newEmail);

        u.setPhone(
                r.phone()
                        .trim()
        );

        u.setAddress(
                r.address()
                        .trim()
        );

        u.setCity(
                r.city()
                        .trim()
        );

        u.setState(
                r.state()
                        .trim()
        );

        u.setPincode(
                r.pincode()
                        .trim()
        );

        u.setPhotoData(
                r.photoData()
        );

        User saved =
                repo.save(u);

        return toResponse(saved);
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    public void changePassword(
            User u,
            PasswordRequest r) {

        if (!encoder.matches(
                r.currentPassword(),
                u.getPassword())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        u.setPassword(
                encoder.encode(
                        r.newPassword()
                )
        );

        repo.save(u);
    }

    // =========================================================
    // USER RESPONSE
    // =========================================================

    public UserResponse toResponse(User u) {

        return new UserResponse(
                u.getId(),
                u.getName(),
                u.getEmail(),
                u.getPhone(),
                u.getAddress(),
                u.getCity(),
                u.getState(),
                u.getPincode(),
                u.getPhotoData()
        );
    }
}