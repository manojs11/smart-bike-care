package com.smartbikecare.controller;

import com.smartbikecare.entity.User;
import com.smartbikecare.service.ReminderService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService service;

    public ReminderController(ReminderService s) {
        service = s;
    }

    @GetMapping("/{bikeId}")
    public List<Map<String, Object>> all(
            @AuthenticationPrincipal User u,
            @PathVariable Long bikeId) {

        return service.reminders(u, bikeId);
    }
}