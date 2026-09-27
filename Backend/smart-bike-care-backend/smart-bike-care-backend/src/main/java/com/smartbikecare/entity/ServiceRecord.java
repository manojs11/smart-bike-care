package com.smartbikecare.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name="services")
public class ServiceRecord {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @JsonIgnore
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="bike_id", nullable=false) private Bike bike;
    @Column(nullable=false) private String service;
    @Column(nullable=false) private LocalDate date;
    @Column(nullable=false) private Integer kilometers;
    @Column(nullable=false) private Double amount;
    @Column(nullable=false) private String status="Completed";
    private String billName;
    private String billType;
    private Long billSize;
    @Lob @Column(columnDefinition="LONGTEXT") private String billData;

    public Long getId(){return id;} public void setId(Long v){id=v;}
    public Bike getBike(){return bike;} public void setBike(Bike v){bike=v;}
    public String getService(){return service;} public void setService(String v){service=v;}
    public LocalDate getDate(){return date;} public void setDate(LocalDate v){date=v;}
    public Integer getKilometers(){return kilometers;} public void setKilometers(Integer v){kilometers=v;}
    public Double getAmount(){return amount;} public void setAmount(Double v){amount=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public String getBillName(){return billName;} public void setBillName(String v){billName=v;}
    public String getBillType(){return billType;} public void setBillType(String v){billType=v;}
    public Long getBillSize(){return billSize;} public void setBillSize(Long v){billSize=v;}
    public String getBillData(){return billData;} public void setBillData(String v){billData=v;}
}
