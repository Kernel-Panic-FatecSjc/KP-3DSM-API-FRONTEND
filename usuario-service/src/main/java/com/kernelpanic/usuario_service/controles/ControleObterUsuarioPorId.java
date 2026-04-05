package com.kernelpanic.usuario_service.controles;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kernelpanic.usuario_service.dtos.UsuarioExibirDTO;
import com.kernelpanic.usuario_service.servicos.UsuarioServico;

@RestController
@RequestMapping("/usuario")
public class ControleObterUsuarioPorId{

    @Autowired
    private UsuarioServico servico;

    @GetMapping("/{id}")
    public UsuarioExibirDTO obterUsuarioPorId(@PathVariable Long id){
        return servico.obterPorId(id);
    }
}