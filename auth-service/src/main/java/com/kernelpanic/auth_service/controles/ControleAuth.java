package com.kernelpanic.auth_service.controles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.kernelpanic.auth_service.dtos.LoginRequestDTO;
import com.kernelpanic.auth_service.dtos.LoginResponseDTO;
import com.kernelpanic.auth_service.servicos.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class ControleAuth {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.loginViaDTO(loginRequest);
        return ResponseEntity.ok(response);
    }
}