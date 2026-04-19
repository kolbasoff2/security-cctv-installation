import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONTENT_URL = "https://functions.poehali.dev/d23cd26c-dab5-4ec2-a68a-4e16bbffbf52";
const LEADS_URL = "https://functions.poehali.dev/32cd8375-363d-4a79-9463-7c308290d2c7";

const NAV_ITEMS = [
  { label: "Главная", href: "#home" },
  { label: "Услуги", href: "#services" },
  { label: "Портфолио", href: "#portfolio" },
  { label: "О нас", href: "#about" },
  { label: "Контакты", href: "#contacts" },
];

type SiteData = {
  settings: Record<string, string>;
  services: { id: number; icon: string; title: string; description: string }[];
  portfolio: { id: number; title: string; description: string; type: string; gradient: string }[];
  camera_types: { id: string; label: string; price: number }[];
  object_types: { id: string; label: string; mult: number }[];
  archive_options: { id: string; label: string; price: number }[];
  stats: { id: number; value: string; label: string }[];
};

function Calculator({ data }: { data: SiteData }) {
  const { camera_types, object_types, archive_options, settings } = data;
  const [cameras, setCameras] = useState(8);
  const [camType, setCamType] = useState(camera_types[1]?.id || "ip2");
  const [objType, setObjType] = useState(object_types[0]?.id || "office");
  const [archive, setArchive] = useState(archive_options[0]?.id || "7");
  const [includeNvr, setIncludeNvr] = useState(true);
  const [includeInstall, setIncludeInstall] = useState(true);

  const nvrPrice = parseInt(settings.nvr_price || "18000");
  const installPerCam = parseInt(settings.install_price_per_cam || "1500");

  const camPrice = camera_types.find((c) => c.id === camType)?.price || 0;
  const objMult = object_types.find((o) => o.id === objType)?.mult || 1;
  const archivePrice = archive_options.find((a) => a.id === archive)?.price || 0;
  const nvrTotal = includeNvr ? Math.ceil(cameras / 8) * nvrPrice : 0;
  const installPrice = includeInstall ? cameras * installPerCam * objMult : 0;

  const total = Math.round(cameras * camPrice * objMult + nvrTotal + archivePrice + installPrice);

  return (
    <div className="neon-border rounded-2xl p-6 md:p-8 bg-[#060b12]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm text-gray-400 uppercase tracking-wider">Количество камер</span>
              <span className="neon-text font-bold text-lg font-mono">{cameras} шт.</span>
            </div>
            <input type="range" min={1} max={128} value={cameras} onChange={(e) => setCameras(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1</span><span>128</span></div>
          </div>

          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Тип камер</p>
            <div className="grid grid-cols-2 gap-2">
              {camera_types.map((c) => (
                <button key={c.id} onClick={() => setCamType(c.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${camType === c.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-gray-400 hover:border-white/25"}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Тип объекта</p>
            <div className="grid grid-cols-2 gap-2">
              {object_types.map((o) => (
                <button key={o.id} onClick={() => setObjType(o.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${objType === o.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-gray-400 hover:border-white/25"}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-3">Глубина архива</p>
            <div className="flex gap-2">
              {archive_options.map((a) => (
                <button key={a.id} onClick={() => setArchive(a.id)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${archive === a.id ? "border-cyan-400 bg-cyan-400/10 text-cyan-400" : "border-white/10 text-gray-400 hover:border-white/25"}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIncludeNvr(!includeNvr)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${includeNvr ? "border-cyan-400 bg-cyan-400/20" : "border-white/20"}`}>
                {includeNvr && <Icon name="Check" size={12} className="text-cyan-400" />}
              </div>
              <span className="text-sm text-gray-300">Регистратор (NVR/DVR)</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIncludeInstall(!includeInstall)}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${includeInstall ? "border-cyan-400 bg-cyan-400/20" : "border-white/20"}`}>
                {includeInstall && <Icon name="Check" size={12} className="text-cyan-400" />}
              </div>
              <span className="text-sm text-gray-300">Монтаж и настройка</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Камеры ({cameras} шт.)</span>
              <span>{(cameras * camPrice * objMult).toLocaleString("ru")} ₽</span>
            </div>
            {includeNvr && (
              <div className="flex justify-between text-gray-400">
                <span>Регистратор</span><span>{nvrTotal.toLocaleString("ru")} ₽</span>
              </div>
            )}
            {archive !== archive_options[0]?.id && (
              <div className="flex justify-between text-gray-400">
                <span>Доп. архив</span><span>{archivePrice.toLocaleString("ru")} ₽</span>
              </div>
            )}
            {includeInstall && (
              <div className="flex justify-between text-gray-400">
                <span>Монтаж</span><span>{installPrice.toLocaleString("ru")} ₽</span>
              </div>
            )}
          </div>

          <div className="neon-border rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Итого от</p>
            <p className="text-3xl font-bold neon-text font-mono">{total.toLocaleString("ru")} ₽</p>
            <p className="text-xs text-gray-500 mt-1">Точная стоимость после выезда специалиста</p>
          </div>

          <button className="neon-btn w-full py-3 rounded-xl text-sm font-semibold tracking-wide">
            Получить точный расчёт
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_DATA: SiteData = {
  settings: {
    hero_title: "КОНТРОЛЬ. БЕЗОПАСНОСТЬ. ДОВЕРИЕ.",
    hero_subtitle: "Проектируем, монтируем и обслуживаем системы видеонаблюдения для любых объектов. Гарантия 2 года, поддержка 24/7.",
    company_name: "SecureVision",
    phone: "+7 (800) 123-45-67",
    email: "info@securevision.ru",
    address: "Москва, ул. Охраны, 1",
    work_hours: "Пн–Пт 9:00–21:00",
    about_founded: "2012",
    about_specialists: "45",
    about_guarantee: "2 года",
    nvr_price: "18000",
    install_price_per_cam: "1500",
  },
  services: [
    { id: 1, icon: "Camera", title: "Видеонаблюдение", description: "Монтаж IP и аналоговых камер любого класса. Разрешение до 4K, ночное видение, детекция движения." },
    { id: 2, icon: "Shield", title: "Охранная сигнализация", description: "Комплексные системы защиты периметра с мгновенным оповещением на пульт охраны." },
    { id: 3, icon: "Wifi", title: "Удалённый мониторинг", description: "Онлайн-просмотр с любого устройства 24/7. Облачное хранение записей до 90 дней." },
    { id: 4, icon: "Lock", title: "Контроль доступа", description: "Пропускные системы, биометрия, RFID-карты для офисов, складов и производств." },
    { id: 5, icon: "Zap", title: "Монтаж «под ключ»", description: "Проектирование, прокладка кабелей, настройка и сдача объекта за 1–5 дней." },
    { id: 6, icon: "Headphones", title: "Техобслуживание", description: "Ежеквартальные регламентные работы, оперативный выезд специалиста по заявке." },
  ],
  portfolio: [
    { id: 1, title: "ТЦ «Центральный»", description: "64 камеры, 3 сервера записи", type: "Торговый центр", gradient: "from-cyan-900/40 to-blue-900/40" },
    { id: 2, title: "Завод «МеталлСтрой»", description: "128 камер, СКУД на 4 входа", type: "Производство", gradient: "from-indigo-900/40 to-purple-900/40" },
    { id: 3, title: "ЖК «Горизонт»", description: "32 камеры, домофония, СКУД", type: "Жилой комплекс", gradient: "from-teal-900/40 to-cyan-900/40" },
    { id: 4, title: "Банк «Регион»", description: "48 камер 4K, 2 поста охраны", type: "Финансы", gradient: "from-blue-900/40 to-indigo-900/40" },
    { id: 5, title: "Склад логистики", description: "80 камер, периметральная охрана", type: "Логистика", gradient: "from-cyan-900/40 to-teal-900/40" },
    { id: 6, title: "Офисный центр", description: "24 камеры, СКУД, видеоаналитика", type: "Офис", gradient: "from-slate-900/60 to-blue-900/40" },
  ],
  camera_types: [
    { id: "analog", label: "Аналоговая HD", price: 2800 },
    { id: "ip2", label: "IP 2 Мп", price: 4500 },
    { id: "ip4", label: "IP 4 Мп", price: 6500 },
    { id: "ip8", label: "IP 8 Мп (4K)", price: 11000 },
  ],
  object_types: [
    { id: "office", label: "Офис / магазин", mult: 1 },
    { id: "warehouse", label: "Склад / производство", mult: 1.3 },
    { id: "street", label: "Уличный периметр", mult: 1.5 },
    { id: "bank", label: "Банк / финансы", mult: 1.8 },
  ],
  archive_options: [
    { id: "7", label: "7 дней", price: 0 },
    { id: "30", label: "30 дней", price: 3000 },
    { id: "90", label: "90 дней", price: 8000 },
  ],
  stats: [
    { id: 1, value: "12+", label: "лет опыта" },
    { id: 2, value: "850+", label: "объектов сдано" },
    { id: 3, value: "24/7", label: "техподдержка" },
    { id: 4, value: "98%", label: "довольных клиентов" },
  ],
};

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [data, setData] = useState<SiteData>(DEFAULT_DATA);

  const [form, setForm] = useState({ name: "", phone: "", object: "", comment: "" });
  const [formSent, setFormSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch(CONTENT_URL + "/")
      .then(r => r.json())
      .then(d => {
        if (d.settings && Object.keys(d.settings).length > 0) setData(d);
      })
      .catch(() => {});
  }, []);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setFormLoading(true);
    await fetch(LEADS_URL + "/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setFormSent(true);
    setFormLoading(false);
  }

  const s = data.settings;

  return (
    <div className="min-h-screen bg-[#080d14] text-white overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080d14]/90 backdrop-blur-md border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center animate-pulse-neon">
              <Icon name="Eye" size={16} className="text-cyan-400" />
            </div>
            <span className="font-bold text-lg tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
              SECURE<span className="neon-text">VISION</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-sm text-gray-400 hover:text-cyan-400 transition-colors duration-200 tracking-wide">
                {item.label}
              </a>
            ))}
          </div>

          <a href="#contacts" className="hidden md:block neon-btn px-5 py-2 rounded-lg text-sm">Вызвать специалиста</a>

          <button className="md:hidden text-gray-400" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#080d14]/95 backdrop-blur-md border-t border-white/5 px-6 py-4 space-y-4">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="block text-gray-300 hover:text-cyan-400 transition-colors py-1">
                {item.label}
              </a>
            ))}
            <a href="#contacts" className="neon-btn block text-center py-3 rounded-xl">Вызвать специалиста</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center grid-bg">
        <div className="absolute inset-0">
          <img src="https://cdn.poehali.dev/projects/5dc205cf-8d1f-4a32-993d-e77f7850bc95/files/9ebf8634-a42b-4861-9d4f-58cc3bb18874.jpg" alt="CCTV" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080d14]/60 via-transparent to-[#080d14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080d14]/80 to-transparent" />
        </div>

        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full border border-cyan-400/5 animate-pulse pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-52 h-52 rounded-full border border-cyan-400/8 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400 text-xs tracking-widest uppercase mb-8 fade-in-up">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Профессиональная безопасность
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 fade-in-up delay-100" style={{ fontFamily: "Oswald, sans-serif" }}>
              {s.hero_title?.includes("БЕЗОПАСНОСТЬ") ? (
                <>КОНТРОЛЬ.<br /><span className="neon-text">БЕЗОПАСНОСТЬ.</span><br />ДОВЕРИЕ.</>
              ) : (
                s.hero_title
              )}
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mb-10 fade-in-up delay-200 leading-relaxed">{s.hero_subtitle}</p>

            <div className="flex flex-col sm:flex-row gap-4 fade-in-up delay-300">
              <a href="#calculator" className="neon-btn px-8 py-4 rounded-xl text-sm font-semibold tracking-wide inline-flex items-center gap-2 justify-center">
                <Icon name="Calculator" size={18} />Рассчитать стоимость
              </a>
              <a href="#services" className="px-8 py-4 rounded-xl text-sm font-semibold tracking-wide border border-white/15 hover:border-cyan-400/40 hover:bg-white/5 transition-all duration-300 inline-flex items-center gap-2 justify-center">
                Наши услуги<Icon name="ArrowRight" size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5">
              {data.stats.map((s, i) => (
                <div key={s.id} className="py-6 px-4 text-center border-r border-white/5 last:border-0 fade-in-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                  <div className="text-2xl md:text-3xl font-bold neon-text mb-1" style={{ fontFamily: "Oswald, sans-serif" }}>{s.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-400 tracking-widest uppercase">Что мы делаем</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              НАШИ <span className="neon-text">УСЛУГИ</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.services.map((s) => (
              <div key={s.id} className="card-dark rounded-2xl p-6 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-5 group-hover:bg-cyan-400/20 transition-all duration-300">
                  <Icon name={s.icon} size={22} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "Oswald, sans-serif" }}>{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="py-24 relative bg-[#060b12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-400 tracking-widest uppercase">Прозрачное ценообразование</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              КАЛЬКУЛЯТОР <span className="neon-text">СТОИМОСТИ</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm">Рассчитайте предварительную стоимость монтажа системы видеонаблюдения для вашего объекта</p>
          </div>
          <Calculator data={data} />
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 bg-[#060b12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-400 tracking-widest uppercase">Наши работы</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              <span className="neon-text">ПОРТФОЛИО</span> ПРОЕКТОВ
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.portfolio.map((p) => (
              <div key={p.id} className={`rounded-2xl p-6 border border-white/6 bg-gradient-to-br ${p.gradient} relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30`}>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Icon name="ExternalLink" size={16} className="text-cyan-400" />
                </div>
                <span className="text-xs text-cyan-400/70 tracking-wider uppercase">{p.type}</span>
                <h3 className="text-xl font-bold mt-2 mb-2" style={{ fontFamily: "Oswald, sans-serif" }}>{p.title}</h3>
                <p className="text-gray-400 text-sm">{p.description}</p>
                <div className="mt-4 w-8 h-0.5 bg-cyan-400/40 group-hover:w-full transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs text-cyan-400 tracking-widest uppercase">О компании</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6" style={{ fontFamily: "Oswald, sans-serif" }}>
                МЫ — ЭКСПЕРТЫ<br /><span className="neon-text">БЕЗОПАСНОСТИ</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                С {s.about_founded} года мы специализируемся на проектировании и монтаже комплексных систем безопасности. За это время реализовали более 850 проектов различной сложности — от небольших офисов до крупных промышленных предприятий.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10">
                В нашей команде {s.about_specialists} сертифицированных специалистов. Используем оборудование ведущих мировых производителей: Hikvision, Dahua, Axis, Bosch. Гарантия на все работы — {s.about_guarantee}.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "Award", text: "Лицензия МВД РФ" },
                  { icon: "Users", text: `${s.about_specialists} специалистов` },
                  { icon: "MapPin", text: "Работаем по всей РФ" },
                  { icon: "Clock", text: "Выезд за 2 часа" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={16} className="text-cyan-400" />
                    </div>
                    <span className="text-sm text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="neon-border rounded-3xl p-8 bg-[#060b12] scan-line relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-gray-600 ml-2 font-mono">LIVE MONITOR — SECURE</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["CAM 01 — Вход", "CAM 02 — Склад", "CAM 03 — Периметр", "CAM 04 — Офис"].map((cam, i) => (
                    <div key={i} className="aspect-video bg-black/60 rounded-lg border border-cyan-400/10 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute top-1 left-2 text-xs text-cyan-400/60 font-mono">{cam}</div>
                      <div className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <Icon name="Camera" size={24} className="text-cyan-400/20" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-black/40 rounded-lg border border-cyan-400/10">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-400/60">
                    <span>СИСТЕМА АКТИВНА</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />ONLINE
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-cyan-400 text-[#080d14] px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                ГАРАНТИЯ {s.about_guarantee?.toUpperCase() || "2 ГОДА"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 relative grid-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs text-cyan-400 tracking-widest uppercase">Связаться</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-3" style={{ fontFamily: "Oswald, sans-serif" }}>
              ОСТАВЬТЕ <span className="neon-text">ЗАЯВКУ</span>
            </h2>
            <p className="text-gray-400 mt-4 text-sm">Перезвоним в течение 30 минут</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="neon-border rounded-2xl p-8 bg-[#060b12]">
              {formSent ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center mb-4">
                    <Icon name="CheckCircle" size={32} className="text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Заявка принята!</h3>
                  <p className="text-gray-400 text-sm">Перезвоним вам в течение 30 минут</p>
                </div>
              ) : (
                <form onSubmit={submitForm} className="space-y-5">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Ваше имя</label>
                    <input type="text" placeholder="Иван Иванов" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Телефон</label>
                    <input type="tel" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Объект</label>
                    <input type="text" placeholder="Офис, склад, магазин..." value={form.object} onChange={e => setForm({ ...form, object: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Комментарий</label>
                    <textarea placeholder="Опишите задачу..." rows={3} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400/50 focus:bg-cyan-400/5 transition-all resize-none" />
                  </div>
                  <button type="submit" disabled={formLoading} className="neon-btn w-full py-4 rounded-xl font-semibold tracking-wide disabled:opacity-60">
                    {formLoading ? "Отправляем..." : "Отправить заявку"}
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-6">
              {[
                { icon: "Phone", label: "Телефон", value: s.phone, sub: "Бесплатно по России" },
                { icon: "Mail", label: "Email", value: s.email, sub: "Ответим в течение часа" },
                { icon: "MapPin", label: "Адрес", value: s.address, sub: "Работаем по всей РФ" },
                { icon: "Clock", label: "Время работы", value: s.work_hours, sub: "Экстренный выезд 24/7" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-4 p-5 card-dark rounded-2xl">
                  <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={c.icon} size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{c.label}</div>
                    <div className="text-white font-medium">{c.value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 bg-[#060b12]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center">
              <Icon name="Eye" size={12} className="text-cyan-400" />
            </div>
            <span className="font-bold text-sm tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
              SECURE<span className="neon-text">VISION</span>
            </span>
          </div>
          <p className="text-xs text-gray-600">© 2024 {s.company_name}. Все права защищены.</p>
          <div className="flex gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-cyan-400 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Оферта</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
