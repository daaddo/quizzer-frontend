# 🔄 Integrazione con Reverse Proxy Esistente

## 🎯 Configurazioni Quick Start

### 📝 Prima di Iniziare
1. **Identifica il nome della rete del tuo reverse proxy:**
   ```bash
   docker network ls
   ```
2. **Trova il nome corretto** (esempi comuni):
   - `nginx-proxy` (nginx-proxy)
   - `traefik-public` (Traefik)
   - `npm_default` (Nginx Proxy Manager)
   - `webproxy` (setup personalizzati)

## 🚀 Setup Rapido per Tipo di Proxy

### 🔸 Traefik
```bash
# Copia l'esempio 1 e modifica il network
cp docker-compose.proxy-ready.yml docker-compose.traefik.yml

# Modifica il nome della rete
sed -i 's/nginx-proxy/traefik-public/g' docker-compose.traefik.yml

# Avvia
docker-compose -f docker-compose.traefik.yml up -d
```

### 🔸 Nginx Proxy Manager
```bash
# Setup per NPM
echo "version: '3.8'
services:
  quizzer-frontend:
    build: .
    environment:
      - VITE_API_BASE_URL=https://api.tuodominio.com
    networks:
      - npm_default
    restart: unless-stopped
    container_name: quizzer-frontend

networks:
  npm_default:
    external: true" > docker-compose.npm.yml

docker-compose -f docker-compose.npm.yml up -d
```

### 🔸 Caddy
```bash
# Setup per Caddy
echo "version: '3.8'
services:
  quizzer-frontend:
    build: .
    environment:
      - VITE_API_BASE_URL=https://api.tuodominio.com
    networks:
      - caddy
    labels:
      - 'caddy=quizzer.tuodominio.com'
      - 'caddy.reverse_proxy={{upstreams 80}}'
    restart: unless-stopped

networks:
  caddy:
    external: true" > docker-compose.caddy.yml

docker-compose -f docker-compose.caddy.yml up -d
```

## 🔧 Configurazioni Specifiche

### 1. **Solo Frontend (API Esterna)**
```bash
# Usa quando hai già l'API deployata altrove
API_URL=https://api.tuodominio.com docker-compose -f docker-compose.proxy-ready.yml up quizzer-frontend
```

### 2. **Frontend + Backend Interno**
```bash
# Per setup completo con backend
docker-compose -f docker-compose.proxy-ready.yml up quizzer-frontend quizzer-backend
```

### 3. **Development con Hot Reload**
```bash
# Per sviluppo con proxy
docker-compose -f docker-compose.proxy-ready.yml --profile dev up
```

### 4. **Multi-Environment**
```bash
# Produzione
docker-compose -f docker-compose.proxy-ready.yml --profile prod up

# Staging  
docker-compose -f docker-compose.proxy-ready.yml --profile staging up

# Development
docker-compose -f docker-compose.proxy-ready.yml --profile dev up
```

## 🛠️ Personalizzazione per il Tuo Setup

### Trova la Tua Rete
```bash
# Lista tutte le reti Docker
docker network ls

# Ispeziona una rete specifica
docker network inspect NOME_RETE

# Vedi quali container sono collegati
docker network inspect NOME_RETE | grep -A 10 "Containers"
```

### Modifica il File per la Tua Rete
```yaml
# In docker-compose.proxy-ready.yml, cambia:
networks:
  proxy-network:
    external: true
    name: IL_TUO_NOME_RETE  # ⬅️ Sostituisci qui
```

### Labels per Diversi Reverse Proxy

#### **Traefik v2**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.quizzer.rule=Host(`quizzer.tuodominio.com`)"
  - "traefik.http.routers.quizzer.tls=true"
  - "traefik.http.routers.quizzer.tls.certresolver=letsencrypt"
  - "traefik.http.services.quizzer.loadbalancer.server.port=80"
```

#### **Nginx Proxy Manager**
```yaml
# NPM non usa labels, configura direttamente nell'interfaccia:
# Domain: quizzer.tuodominio.com
# Forward Hostname: quizzer-frontend
# Forward Port: 80
```

#### **Caddy**
```yaml
labels:
  - "caddy=quizzer.tuodominio.com"
  - "caddy.reverse_proxy={{upstreams 80}}"
```

#### **Nginx Proxy (jwilder)**
```yaml
environment:
  - VIRTUAL_HOST=quizzer.tuodominio.com
  - VIRTUAL_PORT=80
  - LETSENCRYPT_HOST=quizzer.tuodominio.com
  - LETSENCRYPT_EMAIL=tuo@email.com
```

## 🚦 Testing e Troubleshooting

### Verifica Connettività
```bash
# Controlla che il container sia nella rete giusta
docker inspect quizzer-frontend | grep -A 10 Networks

# Testa connettività interna
docker exec quizzer-frontend wget -O- http://localhost/

# Testa dal reverse proxy
docker exec IL_TUO_REVERSE_PROXY wget -O- http://quizzer-frontend/
```

### Debug Network
```bash
# Vedi tutti i container nella rete
docker network inspect NOME_RETE --format='{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}'

# Ping tra container
docker exec CONTAINER1 ping CONTAINER2
```

### Logs Utili
```bash
# Logs del frontend
docker-compose logs -f quizzer-frontend

# Logs del reverse proxy (esempi)
docker logs traefik  # Per Traefik
docker logs nginx-proxy  # Per nginx-proxy
```

## 🔄 Comandi Rapidi per Scenari Comuni

### **Primo Deploy**
```bash
# 1. Verifica rete
docker network ls | grep proxy

# 2. Modifica docker-compose.proxy-ready.yml con la tua rete
# 3. Deploy
docker-compose -f docker-compose.proxy-ready.yml up -d

# 4. Configura il dominio nel reverse proxy
```

### **Update dell'App**
```bash
# Pull nuovo codice e rebuild
git pull
docker-compose -f docker-compose.proxy-ready.yml build --no-cache
docker-compose -f docker-compose.proxy-ready.yml up -d
```

### **Scaling**
```bash
# Scale a più istanze
docker-compose -f docker-compose.proxy-ready.yml up -d --scale quizzer-frontend=3
```

### **Rollback**
```bash
# Torna alla versione precedente
docker-compose -f docker-compose.proxy-ready.yml down
docker tag quizzer-frontend:latest quizzer-frontend:backup
docker-compose -f docker-compose.proxy-ready.yml up -d
```

## 🔧 Configurazioni Avanzate

### Health Check per Reverse Proxy
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### Rate Limiting (Traefik)
```yaml
labels:
  - "traefik.http.middlewares.rate-limit.ratelimit.burst=100"
  - "traefik.http.middlewares.rate-limit.ratelimit.average=50"
  - "traefik.http.routers.quizzer.middlewares=rate-limit"
```

### Autenticazione Basic (Traefik)
```yaml
labels:
  - "traefik.http.middlewares.auth.basicauth.users=admin:$$2y$$10$$hash..."
  - "traefik.http.routers.quizzer.middlewares=auth"
```

## 🆘 Troubleshooting Comune

### ❌ "Container non raggiungibile"
```bash
# Verifica che sia nella rete giusta
docker inspect quizzer-frontend | grep Networks

# Assicurati che il reverse proxy sia attivo
docker ps | grep proxy
```

### ❌ "502 Bad Gateway"
```bash
# Controlla health del container
docker-compose ps

# Verifica che l'app risponda internamente
docker exec quizzer-frontend curl http://localhost/
```

### ❌ "Network not found"
```bash
# Lista reti disponibili
docker network ls

# Crea la rete se non esiste
docker network create nome-rete
```

## 📝 File di Esempio Pronti

Ora hai questi file disponibili:
- `docker-compose.proxy-ready.yml` - 6 esempi diversi
- `docker-compose.yml` - Setup base originale  
- `docker-compose.prod.yml` - Produzione standalone
- `DOCKER_COMPOSE_GUIDE.md` - Guida generale
- `PROXY_INTEGRATION_GUIDE.md` - Questa guida

Scegli l'esempio più adatto al tuo setup e personalizza il nome della rete! 