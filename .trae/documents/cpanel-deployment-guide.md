# Atlas Derslik - cPanel Node.js Hosting Deployment Rehberi

## 1. Proje Analizi

### 1.1 Proje Yapısı
Bu proje aşağıdaki teknolojileri kullanmaktadır:
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Veritabanı**: Supabase (PostgreSQL)
- **Ödeme Sistemi**: Iyzico
- **Kimlik Doğrulama**: Supabase Auth + JWT
- **Build Tool**: Vite
- **Process Manager**: PM2 (önerilir)

### 1.2 Dosya Yapısı
```
YusufProje/
├── src/                 # React frontend kaynak kodları
├── api/                 # Node.js backend API'leri
├── public/              # Statik dosyalar
├── dist/                # Build çıktıları (üretilecek)
├── package.json         # Proje bağımlılıkları
├── vite.config.ts       # Vite yapılandırması
├── vercel.json          # Vercel yapılandırması (cPanel için kullanılmayacak)
└── .env                 # Ortam değişkenleri
```

### 1.3 Kritik Bağımlılıklar
- React 18.3.1
- Express 4.21.2
- @supabase/supabase-js 2.57.4
- TypeScript 5.8.3
- Vite 6.3.5
- bcryptjs 2.4.3
- jsonwebtoken 9.0.2
- iyzipay 2.0.52

## 2. Build İşlemi

### 2.1 Geliştirme Ortamında Test
```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# TypeScript kontrolü
npm run check
```

### 2.2 Production Build
```bash
# Production build oluştur
npm run build

# Build çıktısını kontrol et
ls -la dist/
```

### 2.3 Build Çıktısı
Build işlemi sonrasında `dist/` klasöründe aşağıdaki dosyalar oluşacak:
- `index.html` - Ana HTML dosyası
- `assets/` - CSS, JS ve diğer statik dosyalar
- Optimized ve minified dosyalar

## 3. Ortam Değişkenleri Yapılandırması

### 3.1 Production .env Dosyası
cPanel sunucusunda aşağıdaki ortam değişkenlerini ayarlayın:

```env
# Supabase Configuration
SUPABASE_URL=https://cvmkqazxtgrrsqcfctzk.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Production Domain
FRONTEND_URL=https://atlasderslik.com

# Node Environment
NODE_ENV=production

# JWT Secret (GÜVENLİ BİR ANAHTAR OLUŞTURUN)
JWT_SECRET=your-super-secure-jwt-secret-key-for-production

# Server Port
PORT=3000

# Iyzico Payment Configuration
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com
```

### 3.2 Güvenlik Notları
- JWT_SECRET en az 32 karakter olmalı
- Supabase anahtarlarını güvenli tutun
- Iyzico anahtarlarını production ortamında kullanın

## 4. cPanel Node.js Hosting Kurulumu

### 4.1 cPanel Node.js App Oluşturma

1. **cPanel'e Giriş Yapın**
   - Hosting sağlayıcınızın cPanel'ine giriş yapın

2. **Node.js Selector'ı Bulun**
   - "Software" bölümünde "Node.js Selector" veya "Node.js App" seçeneğini bulun

3. **Yeni Uygulama Oluşturun**
   ```
   Node.js Version: 18.x veya 20.x (en güncel LTS)
   Application Mode: Production
   Application Root: public_html/atlas-derslik
   Application URL: atlasderslik.com
   Application Startup File: api/server.js
   ```

4. **Uygulama Dizinini Oluşturun**
   - cPanel File Manager'da `public_html/atlas-derslik` klasörünü oluşturun

### 4.2 Dosya Yükleme

1. **Proje Dosyalarını Hazırlayın**
   ```bash
   # Gereksiz dosyaları kaldırın
   rm -rf node_modules
   rm -rf .git
   rm -rf .trae
   ```

2. **ZIP Dosyası Oluşturun**
   - Tüm proje dosyalarını ZIP olarak sıkıştırın
   - `atlas-derslik-production.zip` olarak adlandırın

3. **cPanel File Manager ile Yükleyin**
   - ZIP dosyasını `public_html/atlas-derslik` klasörüne yükleyin
   - ZIP dosyasını extract edin

### 4.3 Bağımlılıkları Yükleme

1. **cPanel Terminal'i Açın**
   - "Advanced" bölümünde "Terminal" seçeneğini bulun

2. **Proje Dizinine Gidin**
   ```bash
   cd public_html/atlas-derslik
   ```

3. **Node.js Sürümünü Kontrol Edin**
   ```bash
   node --version
   npm --version
   ```

4. **Bağımlılıkları Yükleyin**
   ```bash
   npm install --production
   ```

5. **Build İşlemini Çalıştırın**
   ```bash
   npm run build
   ```

### 4.4 Ortam Değişkenlerini Ayarlama

1. **.env Dosyası Oluşturun**
   ```bash
   nano .env
   ```

2. **Production Değişkenlerini Ekleyin**
   - Yukarıdaki 3.1 bölümündeki değişkenleri ekleyin

3. **Dosya İzinlerini Ayarlayın**
   ```bash
   chmod 600 .env
   ```

## 5. Domain Yapılandırması

### 5.1 DNS Ayarları

1. **Domain Registrar'da DNS Ayarları**
   ```
   A Record: @ -> Hosting IP Adresi
   A Record: www -> Hosting IP Adresi
   CNAME: * -> atlasderslik.com
   ```

2. **cPanel'de Domain Yönlendirme**
   - "Domains" bölümünde "Subdomains" veya "Addon Domains" kullanın
   - `atlasderslik.com` domain'ini `public_html/atlas-derslik` klasörüne yönlendirin

### 5.2 .htaccess Yapılandırması

`public_html/atlas-derslik/.htaccess` dosyası oluşturun:

```apache
# React Router için SPA yönlendirme
RewriteEngine On
RewriteBase /

# API isteklerini Node.js'e yönlendir
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Statik dosyalar için cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# React Router için fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Güvenlik başlıkları
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

## 6. SSL Sertifikası Kurulumu

### 6.1 Let's Encrypt SSL (Ücretsiz)

1. **cPanel SSL/TLS Bölümü**
   - "Security" bölümünde "SSL/TLS" seçeneğini bulun

2. **Let's Encrypt Sertifikası**
   - "Let's Encrypt SSL" seçeneğini bulun
   - `atlasderslik.com` ve `www.atlasderslik.com` için sertifika oluşturun

3. **Otomatik Yenileme**
   - Sertifikanın otomatik yenilenmesini aktif edin

### 6.2 HTTPS Yönlendirme

`.htaccess` dosyasına HTTPS yönlendirme ekleyin:

```apache
# HTTPS yönlendirme
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## 7. Process Manager Kurulumu (PM2)

### 7.1 PM2 Kurulumu

```bash
# Global PM2 kurulumu
npm install -g pm2

# PM2 sürümünü kontrol et
pm2 --version
```

### 7.2 PM2 Yapılandırması

`ecosystem.config.js` dosyası oluşturun:

```javascript
module.exports = {
  apps: [{
    name: 'atlas-derslik',
    script: 'api/server.js',
    cwd: '/home/username/public_html/atlas-derslik',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 7.3 PM2 ile Uygulamayı Başlatma

```bash
# Logs klasörü oluştur
mkdir -p logs

# PM2 ile uygulamayı başlat
pm2 start ecosystem.config.js

# Durum kontrolü
pm2 status

# Logları görüntüle
pm2 logs atlas-derslik

# Otomatik başlatma için kaydet
pm2 save
pm2 startup
```

## 8. Nginx Proxy Yapılandırması (Opsiyonel)

Eğer hosting sağlayıcınız Nginx kullanıyorsa:

```nginx
server {
    listen 80;
    server_name atlasderslik.com www.atlasderslik.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name atlasderslik.com www.atlasderslik.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /home/username/public_html/atlas-derslik/dist;
    index index.html;
    
    # API istekleri
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Statik dosyalar
    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Güvenlik başlıkları
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## 9. Veritabanı Yapılandırması

### 9.1 Supabase Production Ayarları

1. **Supabase Dashboard'a Gidin**
   - https://supabase.com/dashboard

2. **Production URL'leri Ekleyin**
   - Settings > API
   - Site URL: `https://atlasderslik.com`
   - Redirect URLs: `https://atlasderslik.com/auth/callback`

3. **CORS Ayarları**
   - Authentication > Settings
   - Additional Redirect URLs: `https://atlasderslik.com/**`

### 9.2 Veritabanı Migrasyonları

```bash
# Supabase CLI kurulumu (opsiyonel)
npm install -g supabase

# Migration dosyalarını çalıştır
# Manuel olarak Supabase dashboard'dan SQL editör kullanın
```

## 10. Monitoring ve Logging

### 10.1 Log Dosyaları

```bash
# PM2 logları
pm2 logs atlas-derslik --lines 100

# Sistem logları
tail -f /var/log/messages
tail -f /var/log/nginx/error.log
```

### 10.2 Performans İzleme

```bash
# Sistem kaynak kullanımı
top
htop
free -h
df -h

# PM2 monitoring
pm2 monit
```

### 10.3 Uptime Monitoring

Ücretsiz uptime monitoring servisleri:
- UptimeRobot
- Pingdom
- StatusCake

## 11. Sorun Giderme

### 11.1 Yaygın Hatalar ve Çözümleri

#### Hata: "Cannot find module"
```bash
# Çözüm: Bağımlılıkları yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

#### Hata: "Port already in use"
```bash
# Çözüm: Portu kullanan process'i bul ve sonlandır
lsof -i :3000
kill -9 <PID>
```

#### Hata: "Permission denied"
```bash
# Çözüm: Dosya izinlerini düzelt
chmod 755 api/server.js
chown username:username -R .
```

#### Hata: "Database connection failed"
```bash
# Çözüm: Supabase bağlantı ayarlarını kontrol et
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### 11.2 Debug Komutları

```bash
# Node.js sürümü
node --version
npm --version

# Ortam değişkenleri
env | grep SUPABASE
env | grep NODE_ENV

# Port kontrolü
netstat -tulpn | grep :3000

# PM2 durumu
pm2 status
pm2 describe atlas-derslik

# Disk alanı
df -h

# Memory kullanımı
free -h
```

### 11.3 Performans Optimizasyonu

1. **Gzip Compression**
   ```apache
   # .htaccess'e ekle
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/plain
       AddOutputFilterByType DEFLATE text/html
       AddOutputFilterByType DEFLATE text/xml
       AddOutputFilterByType DEFLATE text/css
       AddOutputFilterByType DEFLATE application/xml
       AddOutputFilterByType DEFLATE application/xhtml+xml
       AddOutputFilterByType DEFLATE application/rss+xml
       AddOutputFilterByType DEFLATE application/javascript
       AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

2. **CDN Kullanımı**
   - Cloudflare ücretsiz CDN
   - Statik dosyalar için cache ayarları

3. **Database Optimizasyonu**
   - Supabase connection pooling
   - Query optimizasyonu
   - Index kullanımı

## 12. Güvenlik Önlemleri

### 12.1 Temel Güvenlik

1. **Güçlü Şifreler**
   - cPanel şifresi
   - Database şifresi
   - JWT secret

2. **Firewall Ayarları**
   ```bash
   # Sadece gerekli portları aç
   # 80 (HTTP), 443 (HTTPS), 22 (SSH)
   ```

3. **Regular Updates**
   ```bash
   # Node.js ve npm güncellemeleri
   npm update
   npm audit fix
   ```

### 12.2 Backup Stratejisi

1. **Kod Backup**
   - Git repository
   - cPanel backup

2. **Veritabanı Backup**
   - Supabase otomatik backup
   - Manuel export

3. **Dosya Backup**
   - cPanel File Manager backup
   - FTP backup

## 13. Deployment Checklist

### 13.1 Pre-Deployment
- [ ] Local'de test edildi
- [ ] Build başarılı
- [ ] Environment variables hazır
- [ ] SSL sertifikası hazır
- [ ] Domain DNS ayarları yapıldı

### 13.2 Deployment
- [ ] Dosyalar yüklendi
- [ ] npm install çalıştırıldı
- [ ] npm run build çalıştırıldı
- [ ] .env dosyası oluşturuldu
- [ ] PM2 yapılandırıldı
- [ ] .htaccess oluşturuldu

### 13.3 Post-Deployment
- [ ] Website erişilebilir
- [ ] API endpoints çalışıyor
- [ ] Authentication çalışıyor
- [ ] Database bağlantısı OK
- [ ] SSL sertifikası aktif
- [ ] Monitoring kuruldu

## 14. Maintenance ve Updates

### 14.1 Regular Maintenance

```bash
# Haftalık kontroller
pm2 status
pm2 logs atlas-derslik --lines 50
df -h
free -h

# Aylık güncellemeler
npm audit
npm update
pm2 restart atlas-derslik
```

### 14.2 Update Procedure

1. **Backup Al**
2. **Local'de Test Et**
3. **Production'a Deploy Et**
4. **Monitoring Kontrol Et**
5. **Rollback Planı Hazır Tut**

---

## İletişim ve Destek

Bu rehber ile ilgili sorularınız için:
- Hosting sağlayıcınızın teknik destek ekibi
- cPanel dokümantasyonu
- Node.js resmi dokümantasyonu
- Supabase dokümantasyonu

**Not**: Bu rehber genel bir kılavuzdur. Hosting sağlayıcınızın özel ayarları farklılık gösterebilir. Deployment öncesi mutlaka hosting sağlayıcınızın dokümantasyonunu kontrol edin.