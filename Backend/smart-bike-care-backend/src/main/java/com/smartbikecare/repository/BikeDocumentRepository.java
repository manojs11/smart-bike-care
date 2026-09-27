package com.smartbikecare.repository;

import com.smartbikecare.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface BikeDocumentRepository extends JpaRepository<BikeDocument, Long> {
	List<BikeDocument> findByBikeOrderByTypeAsc(Bike bike);

	Optional<BikeDocument> findByBikeAndType(Bike bike, String type);
}
