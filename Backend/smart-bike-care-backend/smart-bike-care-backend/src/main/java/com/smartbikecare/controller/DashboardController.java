package com.smartbikecare.controller;

import com.smartbikecare.entity.*;
import com.smartbikecare.repository.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
	private final BikeRepository bikes;
	private final ServiceRecordRepository services;

	public DashboardController(BikeRepository b, ServiceRecordRepository s) {
		bikes = b;
		services = s;
	}

	@GetMapping
	public Map<String, Object> dashboard(@AuthenticationPrincipal User u) {
		List<Bike> bs = bikes.findByUserOrderByIdDesc(u);
		int total = bs.size();
		long due = bs.stream().filter(b -> b.getOdometer() >= b.getNextService()).count();
		long soon = bs.stream()
				.filter(b -> b.getOdometer() < b.getNextService() && b.getNextService() - b.getOdometer() <= 500)
				.count();
		long history = 0;
		double amount = 0;
		for (Bike b : bs) {
			List<ServiceRecord> h = services.findByBikeOrderByDateDescIdDesc(b);
			history += h.size();
			amount += h.stream().mapToDouble(ServiceRecord::getAmount).sum();
		}
		return Map.of("totalBikes", total, "serviceDueBikes", due, "serviceSoonBikes", soon, "totalServices", history,
				"totalServiceAmount", amount, "bikes", bs);
	}
}
