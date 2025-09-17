# Vercel Environment Variables Setup

Vercel deployment için aşağıdaki environment variables'ların Vercel dashboard'unda ayarlanması gerekiyor:

## Required Environment Variables

### Supabase Configuration
```
SUPABASE_URL=https://cvmkqazxtgrrsqcfctzk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWtxYXp4dGdycnNxY2ZjdHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDAzOTgsImV4cCI6MjA3MjkxNjM5OH0.s3IDaeFvFgKzo9h-2Zv4MhOVAUKWCqrYa8Y7AKGwSW8
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWtxYXp4dGdycnNxY2ZjdHprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0MDM5OCwiZXhwIjoyMDcyOTE2Mzk4fQ.KlN5ttIoejjuwzfCqPkpkLVVSMd6y_YaOEY4e_QsobU
```

### JWT Configuration
```
JWT_SECRET=your-production-jwt-secret-key-here
```

### Environment
```
NODE_ENV=production
FRONTEND_URL=https://traeebb3fwqd-zumerkk-zumerkks-projects.vercel.app
```

## Setup Instructions

1. Vercel dashboard'a git: https://vercel.com/dashboard
2. Projenizi seçin
3. Settings > Environment Variables'a gidin
4. Yukarıdaki tüm değişkenleri ekleyin
5. Production environment için ayarlayın
6. Redeploy yapın

## Important Notes

- JWT_SECRET değerini güvenli bir değerle değiştirin
- SUPABASE_ANON_KEY artık düzeltildi (önceki Ej8 tekrarları sorunu çözüldü)
- bcrypt paketi bcryptjs ile değiştirildi (Vercel native dependency sorunu çözüldü)
- Tüm API endpoints /api/* pattern'i ile çalışacak
- CORS headers vercel.json'da ayarlandı

## Troubleshooting

Eğer hala "Server returned non-JSON response" hatası alıyorsanız:
1. Vercel dashboard'da environment variables'ların doğru ayarlandığını kontrol edin
2. bcryptjs paketinin doğru yüklendiğini kontrol edin (npm install)
3. Redeploy yapın
4. API endpoint'lerinin /api/auth/login formatında çalıştığını kontrol edin
5. Browser console'da 404 hatası alıyorsanız, Vercel Functions'ın doğru deploy edildiğini kontrol edin