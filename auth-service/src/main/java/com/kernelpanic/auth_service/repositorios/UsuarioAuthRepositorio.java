package com.kernelpanic.auth_service.repositorios;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kernelpanic.auth_service.entidades.UsuarioAuth;

import java.util.Optional;

@Repository
public interface UsuarioAuthRepositorio extends JpaRepository<UsuarioAuth, Long> {
    Optional<UsuarioAuth> findByEmail(String email);
}
