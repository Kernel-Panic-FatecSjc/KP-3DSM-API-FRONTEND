package com.kernelpanic.usuario_service.controles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kernelpanic.usuario_service.servicos.UsuarioServico;

@RestController
@RequestMapping("/usuario")
@CrossOrigin(origins = "http://localhost:3000")
public class ControleDeletarUsuario {
    
    @Autowired
    private UsuarioServico servico;

    @DeleteMapping("/{id}")
    public void deletarUsuario(@PathVariable Long id){
        servico.deletarPorId(id);
    }
}
