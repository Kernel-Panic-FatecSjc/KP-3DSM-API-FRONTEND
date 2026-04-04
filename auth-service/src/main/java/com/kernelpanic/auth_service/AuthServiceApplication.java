package com.kernelpanic.auth_service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner executar(PasswordEncoder passwordEncoder) {
        return args -> {
            String senhaPura = "senha123"; // <--- Coloque a senha que você quer aqui
            String hash = passwordEncoder.encode(senhaPura);
            
            System.out.println("\n--- GERADOR DE HASH BCRYPT ---");
            System.out.println("Senha Pura: " + senhaPura);
            System.out.println("Hash para o Banco: " + hash);
            System.out.println("------------------------------\n");
        };
    }
}