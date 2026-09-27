package com.smartbikecare.config;
import com.smartbikecare.entity.Garage; import com.smartbikecare.repository.GarageRepository; import org.springframework.boot.CommandLineRunner; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
@Configuration public class DataInitializer{
 @Bean CommandLineRunner seedGarages(GarageRepository repo){return args->{if(repo.count()>0)return; Garage a=new Garage();a.setName("Smart Bike Care Service Center");a.setAddress("Chennai, Tamil Nadu");a.setCity("Chennai");a.setPhone("+91 98765 43210");a.setLatitude(13.0827);a.setLongitude(80.2707);a.setServices("General Service, Engine Oil, Brake, Chain, Battery");a.setOpeningHours("9:00 AM - 8:00 PM");repo.save(a);};}
}
