# Usamos uma imagem com JDK 21 e Maven
FROM maven:3.9.6-eclipse-temurin-21

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o pom.xml primeiro para baixar as dependências (otimização de cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# O comando padrão será rodar o spring-boot:run
# O DevTools cuidará do restart quando os arquivos mudarem
CMD ["mvn", "spring-boot:run"]