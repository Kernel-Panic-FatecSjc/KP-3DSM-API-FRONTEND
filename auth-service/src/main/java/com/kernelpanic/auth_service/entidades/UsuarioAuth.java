package com.kernelpanic.auth_service.entidades;

import java.util.Date;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import lombok.Data;

@Data
@Entity
public class UsuarioAuth {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true, nullable = false, length = 150)
	private String email;
	
	@Column(nullable = false, length = 255)
	private String senha;
	
	@Column(nullable = false, length = 30)
	private String cargo;
	
	@Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
	private Boolean ativo;
	
	@Column(updatable = false)
	private Date dataCriacao;
	
	@Column
	private Date dataAtualizacao;
}
