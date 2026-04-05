package com.kernelpanic.usuario_service.servicos;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.kernelpanic.usuario_service.dtos.UsuarioAtualizarDTO;
import com.kernelpanic.usuario_service.dtos.UsuarioCadastroDTO;
import com.kernelpanic.usuario_service.dtos.UsuarioExibirDTO;
import com.kernelpanic.usuario_service.entidades.Usuario;
import com.kernelpanic.usuario_service.excecoes.EntidadeNaoEncontradaException;
import com.kernelpanic.usuario_service.repositorios.UsuarioRepositorio;

@Service
public class UsuarioServico {

    @Autowired
    private UsuarioRepositorio repositorio;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UsuarioExibirDTO> obterTodos() {
        List<Usuario> usuarios = repositorio.findAll();
        return usuarios.stream()
                .map(this::converterParaExibirDTO)
                .collect(Collectors.toList());
    }

    public UsuarioExibirDTO obterPorId(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException(
                        "Usuário não encontrado",
                        "Não foi possível localizar um usuário com o ID: " + id
                ));

        return converterParaExibirDTO(usuario);
    }

    public void cadastrar(Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        repositorio.save(usuario);
    }

    public void atualizar(Usuario atualizacao) {
        Usuario usuario = repositorio.findById(atualizacao.getId())
                .orElseThrow(() -> new EntidadeNaoEncontradaException(
                        "Atualização impossível",
                        "O usuário de ID " + atualizacao.getId() + " não foi encontrado."
                ));

        usuario.setNome(atualizacao.getNome());
        usuario.setCargo(atualizacao.getCargo());
        usuario.setEmail(atualizacao.getEmail());
        usuario.setSalario(usuario.getSalario());
        

        if (atualizacao.getGerente() != null && atualizacao.getGerente().getId() != null) {
            Usuario gerente = new Usuario();
            gerente.setId(atualizacao.getGerente().getId());
            usuario.setGerente(gerente);
        } else {
            usuario.setGerente(null);
        }

        if (atualizacao.getSenha() != null && !atualizacao.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(atualizacao.getSenha()));
        }

        repositorio.save(usuario);
    }

    public void deletarPorId(Long id) {
        Usuario usuario = repositorio.findById(id)
                .orElseThrow(() -> new EntidadeNaoEncontradaException(
                        "Exclusão negada",
                        "Não foi possível localizar o usuário de ID " + id
                ));

        repositorio.delete(usuario);
    }

    private UsuarioExibirDTO converterParaExibirDTO(Usuario usuario) {
        UsuarioExibirDTO dto = new UsuarioExibirDTO();

        dto.setId(usuario.getId());

        if (usuario.getGerente() != null) {
            dto.setGerenteId(usuario.getGerente().getId());
        }

        dto.setNome(usuario.getNome());
        dto.setCargo(usuario.getCargo());
        dto.setEmail(usuario.getEmail());
        dto.setDataCriacao(usuario.getDataCriacao());
        dto.setSalario(usuario.getSalario());

        return dto;
    }

    public void cadastrarViaDTO(UsuarioCadastroDTO dto) {
        Usuario usuario = new Usuario();

        usuario.setNome(dto.getNome());
        usuario.setCargo(dto.getCargo());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setSalario(dto.getSalario());

        if (dto.getGerenteId() != null) {
            Usuario gerente = new Usuario();
            gerente.setId(dto.getGerenteId());
            usuario.setGerente(gerente);
        }

        this.cadastrar(usuario);
    }

    public void atualizarViaDTO(Long id, UsuarioAtualizarDTO dto) {
        Usuario usuario = new Usuario();

        usuario.setId(id);
        usuario.setNome(dto.getNome());
        usuario.setCargo(dto.getCargo());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setSalario(dto.getSalario());
        


        if (dto.getGerenteId() != null) {
            Usuario gerente = new Usuario();
            gerente.setId(dto.getGerenteId());
            usuario.setGerente(gerente);
        }

        this.atualizar(usuario);
    }
}