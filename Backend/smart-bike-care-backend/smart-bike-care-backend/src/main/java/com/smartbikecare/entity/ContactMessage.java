package com.smartbikecare.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="contact_messages")
public class ContactMessage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private String name; private String email; private String subject;
 @Lob @Column(columnDefinition="TEXT") private String message;
 private LocalDateTime createdAt;
 @PrePersist void createTime(){createdAt=LocalDateTime.now();}
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getSubject(){return subject;} public void setSubject(String v){subject=v;} public String getMessage(){return message;} public void setMessage(String v){message=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
