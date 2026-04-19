
-- Настройки сайта (тексты, контакты, герой)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Услуги
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Портфолио
CREATE TABLE portfolio (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  gradient TEXT NOT NULL DEFAULT 'from-cyan-900/40 to-blue-900/40',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Цены калькулятора - типы камер
CREATE TABLE calc_camera_types (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price INT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Цены калькулятора - типы объектов
CREATE TABLE calc_object_types (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  mult NUMERIC(4,2) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Цены калькулятора - архив
CREATE TABLE calc_archive_options (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  price INT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Статистика компании
CREATE TABLE company_stats (
  id SERIAL PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Заявки из формы
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  object TEXT,
  comment TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Заполняем настройки по умолчанию
INSERT INTO site_settings (key, value) VALUES
  ('hero_title', 'КОНТРОЛЬ. БЕЗОПАСНОСТЬ. ДОВЕРИЕ.'),
  ('hero_subtitle', 'Проектируем, монтируем и обслуживаем системы видеонаблюдения для любых объектов. Гарантия 2 года, поддержка 24/7.'),
  ('company_name', 'SecureVision'),
  ('phone', '+7 (800) 123-45-67'),
  ('email', 'info@securevision.ru'),
  ('address', 'Москва, ул. Охраны, 1'),
  ('work_hours', 'Пн–Пт 9:00–21:00'),
  ('about_founded', '2012'),
  ('about_specialists', '45'),
  ('about_guarantee', '2 года'),
  ('nvr_price', '18000'),
  ('install_price_per_cam', '1500');

-- Услуги по умолчанию
INSERT INTO services (icon, title, description, sort_order) VALUES
  ('Camera', 'Видеонаблюдение', 'Монтаж IP и аналоговых камер любого класса. Разрешение до 4K, ночное видение, детекция движения.', 1),
  ('Shield', 'Охранная сигнализация', 'Комплексные системы защиты периметра с мгновенным оповещением на пульт охраны.', 2),
  ('Wifi', 'Удалённый мониторинг', 'Онлайн-просмотр с любого устройства 24/7. Облачное хранение записей до 90 дней.', 3),
  ('Lock', 'Контроль доступа', 'Пропускные системы, биометрия, RFID-карты для офисов, складов и производств.', 4),
  ('Zap', 'Монтаж «под ключ»', 'Проектирование, прокладка кабелей, настройка и сдача объекта за 1–5 дней.', 5),
  ('Headphones', 'Техобслуживание', 'Ежеквартальные регламентные работы, оперативный выезд специалиста по заявке.', 6);

-- Портфолио по умолчанию
INSERT INTO portfolio (title, description, type, gradient, sort_order) VALUES
  ('ТЦ «Центральный»', '64 камеры, 3 сервера записи', 'Торговый центр', 'from-cyan-900/40 to-blue-900/40', 1),
  ('Завод «МеталлСтрой»', '128 камер, СКУД на 4 входа', 'Производство', 'from-indigo-900/40 to-purple-900/40', 2),
  ('ЖК «Горизонт»', '32 камеры, домофония, СКУД', 'Жилой комплекс', 'from-teal-900/40 to-cyan-900/40', 3),
  ('Банк «Регион»', '48 камер 4K, 2 поста охраны', 'Финансы', 'from-blue-900/40 to-indigo-900/40', 4),
  ('Склад логистики', '80 камер, периметральная охрана', 'Логистика', 'from-cyan-900/40 to-teal-900/40', 5),
  ('Офисный центр', '24 камеры, СКУД, видеоаналитика', 'Офис', 'from-slate-900/60 to-blue-900/40', 6);

-- Типы камер по умолчанию
INSERT INTO calc_camera_types (id, label, price, sort_order) VALUES
  ('analog', 'Аналоговая HD', 2800, 1),
  ('ip2', 'IP 2 Мп', 4500, 2),
  ('ip4', 'IP 4 Мп', 6500, 3),
  ('ip8', 'IP 8 Мп (4K)', 11000, 4);

-- Типы объектов по умолчанию
INSERT INTO calc_object_types (id, label, mult, sort_order) VALUES
  ('office', 'Офис / магазин', 1.0, 1),
  ('warehouse', 'Склад / производство', 1.3, 2),
  ('street', 'Уличный периметр', 1.5, 3),
  ('bank', 'Банк / финансы', 1.8, 4);

-- Архив по умолчанию
INSERT INTO calc_archive_options (id, label, price, sort_order) VALUES
  ('7', '7 дней', 0, 1),
  ('30', '30 дней', 3000, 2),
  ('90', '90 дней', 8000, 3);

-- Статистика по умолчанию
INSERT INTO company_stats (value, label, sort_order) VALUES
  ('12+', 'лет опыта', 1),
  ('850+', 'объектов сдано', 2),
  ('24/7', 'техподдержка', 3),
  ('98%', 'довольных клиентов', 4);
