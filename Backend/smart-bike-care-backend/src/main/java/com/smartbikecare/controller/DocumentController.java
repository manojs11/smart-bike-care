package com.smartbikecare.controller;

import com.smartbikecare.dto.Requests.DocumentRequest;
import com.smartbikecare.entity.BikeDocument;
import com.smartbikecare.entity.User;
import com.smartbikecare.service.DocumentService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService service;

    public DocumentController(DocumentService s) {
        service = s;
    }

    @GetMapping("/bikes/{bikeId}/documents")
    public List<BikeDocument> all(
            @AuthenticationPrincipal User u,
            @PathVariable Long bikeId) {

        return service.all(u, bikeId);
    }

    @PostMapping("/bikes/{bikeId}/documents")
    public BikeDocument save(
            @AuthenticationPrincipal User u,
            @PathVariable Long bikeId,
            @Valid @RequestBody DocumentRequest r) {

        return service.save(u, bikeId, r);
    }

    @DeleteMapping("/bikes/{bikeId}/documents/{type}")
    public Map<String, Object> delete(
            @AuthenticationPrincipal User u,
            @PathVariable Long bikeId,
            @PathVariable String type) {

        service.delete(u, bikeId, type);

        return Map.of(
                "success", true,
                "message", "Document deleted successfully"
        );
    }
}