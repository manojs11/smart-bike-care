package com.smartbikecare.exception;
import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.*;
@RestControllerAdvice public class GlobalExceptionHandler{
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Map<String,Object>> bad(IllegalArgumentException e){return response(HttpStatus.BAD_REQUEST,e.getMessage());}
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<Map<String,Object>> notFound(NoSuchElementException e){return response(HttpStatus.NOT_FOUND,e.getMessage());}
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException e){Map<String,String> errors=new LinkedHashMap<>();e.getBindingResult().getFieldErrors().forEach(x->errors.put(x.getField(),x.getDefaultMessage()));Map<String,Object> b=new LinkedHashMap<>();b.put("timestamp",LocalDateTime.now());b.put("status",400);b.put("error","Validation failed");b.put("messages",errors);return ResponseEntity.badRequest().body(b);}
 @ExceptionHandler(Exception.class) ResponseEntity<Map<String,Object>> other(Exception e){return response(HttpStatus.INTERNAL_SERVER_ERROR,"Something went wrong");}
 private ResponseEntity<Map<String,Object>> response(HttpStatus s,String msg){Map<String,Object>b=new LinkedHashMap<>();b.put("timestamp",LocalDateTime.now());b.put("status",s.value());b.put("error",msg);return ResponseEntity.status(s).body(b);}
}
