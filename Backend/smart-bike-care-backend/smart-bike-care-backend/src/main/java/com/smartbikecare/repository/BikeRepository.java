package com.smartbikecare.repository;

import com.smartbikecare.entity.Bike;
import com.smartbikecare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface BikeRepository extends JpaRepository<Bike, Long> {
	List<Bike> findByUserOrderByIdDesc(User user);

	Optional<Bike> findByIdAndUser(Long id, User user);

	boolean existsByUserAndRegistrationNumberIgnoreCase(User user, String registrationNumber);

	boolean existsByUserAndRegistrationNumberIgnoreCaseAndIdNot(User user, String registrationNumber, Long id);
}
