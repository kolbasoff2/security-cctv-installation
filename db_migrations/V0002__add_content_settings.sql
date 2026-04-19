INSERT INTO site_settings (key, value, updated_at) VALUES
  ('about_title', 'МЫ — ЭКСПЕРТЫ БЕЗОПАСНОСТИ', NOW()),
  ('about_subtitle', 'О компании', NOW()),
  ('about_text1', 'С 2012 года мы специализируемся на проектировании и монтаже комплексных систем безопасности. За это время реализовали более 850 проектов различной сложности — от небольших офисов до крупных промышленных предприятий.', NOW()),
  ('about_text2', 'В нашей команде 45 сертифицированных специалистов. Используем оборудование ведущих мировых производителей: Hikvision, Dahua, Axis, Bosch. Гарантия на все работы — 2 года.', NOW()),
  ('about_badge1', 'Лицензия МВД РФ', NOW()),
  ('about_badge2', 'Работаем по всей РФ', NOW()),
  ('about_badge3', 'Выезд за 2 часа', NOW()),
  ('contacts_title', 'ОСТАВЬТЕ ЗАЯВКУ', NOW()),
  ('contacts_subtitle', 'Связаться', NOW()),
  ('contacts_description', 'Перезвоним в течение 30 минут', NOW()),
  ('services_title', 'НАШИ УСЛУГИ', NOW()),
  ('services_subtitle', 'Что мы делаем', NOW()),
  ('portfolio_title', 'ПОРТФОЛИО ПРОЕКТОВ', NOW()),
  ('portfolio_subtitle', 'Наши работы', NOW()),
  ('calc_title', 'КАЛЬКУЛЯТОР СТОИМОСТИ', NOW()),
  ('calc_subtitle', 'Прозрачное ценообразование', NOW()),
  ('calc_description', 'Рассчитайте предварительную стоимость монтажа системы видеонаблюдения для вашего объекта', NOW())
ON CONFLICT (key) DO NOTHING;