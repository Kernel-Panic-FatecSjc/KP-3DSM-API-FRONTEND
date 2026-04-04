package com.kernelpanic.auth_service.servicos;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.kernelpanic.auth_service.entidades.UsuarioAuth;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretString;

    @Value("${jwt.expiration:3600000}")
    private long expirationTime;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretString.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarToken(UsuarioAuth usuario) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .subject(usuario.getId().toString())
                .claim("email", usuario.getEmail())
                .claim("cargo", usuario.getCargo())
                .claim("ativo", usuario.getAtivo())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String extrairUserId(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).get("email", String.class);
    }

    public String extrairCargo(String token) {
        return extrairClaims(token).get("cargo", String.class);
    }

    public boolean validarToken(String token) {
        try {
            extrairClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean tokenExpirado(String token) {
        try {
            Claims claims = extrairClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    private Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}