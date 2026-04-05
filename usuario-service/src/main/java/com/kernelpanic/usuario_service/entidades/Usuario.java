package com.kernelpanic.usuario_service.entidades;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "gerente_id")

    private Usuario gerente;

    @OneToMany(mappedBy = "gerente")
    private List<Usuario> subordinados = new ArrayList<>();
    
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 30)
    private String cargo;

	@Column(columnDefinition = "BOOLEAN DEFAULT TRUE")
	private Boolean ativo;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String senha;

    @Column(name = "data_criacao")
    @CreationTimestamp
    private LocalDateTime dataCriacao;

    @Column
	private Date dataAtualizacao;

    @Column(nullable = false, length = 20)
    private String salario;

}
