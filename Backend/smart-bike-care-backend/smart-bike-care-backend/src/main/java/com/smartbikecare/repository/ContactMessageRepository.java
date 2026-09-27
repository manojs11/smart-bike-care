package com.smartbikecare.repository;
import com.smartbikecare.entity.ContactMessage; import org.springframework.data.jpa.repository.JpaRepository;
public interface ContactMessageRepository extends JpaRepository<ContactMessage,Long>{}
