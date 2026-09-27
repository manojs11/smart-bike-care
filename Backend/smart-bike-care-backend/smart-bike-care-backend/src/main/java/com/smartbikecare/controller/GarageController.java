package com.smartbikecare.controller;

import com.smartbikecare.entity.Garage;
import com.smartbikecare.repository.GarageRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/garages")
public class GarageController {
	private final GarageRepository repo;

	public GarageController(GarageRepository r) {
		repo = r;
	}

	@GetMapping
	public List<Garage> all() {
		return repo.findAll();
	}

	@GetMapping("/{id}")
	public Garage get(@PathVariable Long id) {
		return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Garage not found"));
	}
}
