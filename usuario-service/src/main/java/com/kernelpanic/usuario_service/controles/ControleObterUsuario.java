package com.kernelpanic.usuario_service.controles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kernelpanic.usuario_service.dtos.UsuarioExibirDTO;
import com.kernelpanic.usuario_service.servicos.UsuarioServico;

import java.util.List;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "http://localhost:3000")
public class ControleObterUsuario {
    
    @Autowired
    private UsuarioServico servico;

    @GetMapping("/todos")
    public List<UsuarioExibirDTO> obterTodosUsuarios() {
        return servico.obterTodos();
    }
}