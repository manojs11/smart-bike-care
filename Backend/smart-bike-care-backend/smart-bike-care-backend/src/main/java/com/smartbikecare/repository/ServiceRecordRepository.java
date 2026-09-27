package com.smartbikecare.repository;

import com.smartbikecare.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {
	List<ServiceRecord> findByBikeOrderByDateDescIdDesc(Bike bike);

	Optional<ServiceRecord> findByIdAndBike(Long id, Bike bike);
}
