-- Demo kullanıcılarının şifrelerini doğru hash ile güncelle (demo123456)
UPDATE users SET password_hash = '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS' WHERE email = 'demo.ogrenci@dersatlasi.com';
UPDATE users SET password_hash = '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS' WHERE email = 'demo.ogretmen@dersatlasi.com';
UPDATE users SET password_hash = '$2b$10$8kmg.qt1Qf.lqTFtzju99uPJpyoQlGkX1MR4xoURj4piun1oiNSRS' WHERE email = 'demo.admin@dersatlasi.com';