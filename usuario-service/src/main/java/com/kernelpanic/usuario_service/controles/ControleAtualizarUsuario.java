package com.kernelpanic.usuario_service.controles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kernelpanic.usuario_service.dtos.UsuarioAtualizarDTO;
import com.kernelpanic.usuario_service.servicos.UsuarioServico;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "http://localhost:3000")
public class ControleAtualizarUsuario {
    
    @Autowired
    private UsuarioServico servico;

    @PutMapping("/{id}/atualizacao")
    public void atualizarUsuario(@PathVariable Long id , @Valid @RequestBody UsuarioAtualizarDTO dto){
        servico.atualizarViaDTO(id, dto);
    }

}
