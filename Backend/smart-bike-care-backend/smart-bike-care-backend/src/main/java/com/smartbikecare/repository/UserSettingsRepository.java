package com.smartbikecare.repository;
import com.smartbikecare.entity.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface UserSettingsRepository extends JpaRepository<UserSettings,Long>{Optional<UserSettings> findByUser(User user);}
