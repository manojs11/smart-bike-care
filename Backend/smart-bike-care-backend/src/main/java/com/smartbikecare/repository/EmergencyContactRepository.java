package com.smartbikecare.repository;

import com.smartbikecare.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {
	List<EmergencyContact> findByUserOrderByIdAsc(User user);

	Optional<EmergencyContact> findByIdAndUser(Long id, User user);
}
