package com.smartbikecare.security;

import com.smartbikecare.entity.User;
import com.smartbikecare.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader("Authorization");
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);
			if (jwtService.isValid(token)) {
				try {
					String email = jwtService.extractEmail(token);
					User user = userRepository.findByEmail(email).orElse(null);
					if (user != null) {
						var auth = new UsernamePasswordAuthenticationToken(user, null,
								List.of(new SimpleGrantedAuthority("ROLE_USER")));
						SecurityContextHolder.getContext().setAuthentication(auth);
					}
				} catch (Exception ignored) {
				}
			}
		}
		chain.doFilter(request, response);
	}
}
