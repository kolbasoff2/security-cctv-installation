import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CONTENT_URL = "https://functions.poehali.dev/d23cd26c-dab5-4ec2-a68a-4e16bbffbf52";
const LEADS_URL = "https://functions.poehali.dev/32cd8375-363d-4a79-9463-7c308290d2c7";

function api(baseUrl: string, token: string, action: string, id?: string | number) {
  let url = baseUrl + "?token=" + encodeURIComponent(token) + "&action=" + action;
  if (id !== undefined) url += "&id=" + id;
  return url;
}

function leadsApi(baseUrl: string, token: string, action: string, id?: number) {
  let url = baseUrl + "?token=" + encodeURIComponent(token) + "&action=" + action;
  if (id !== undefined) url += "&id=" + id;
  return url;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

type Lead = { id: number; name: string; phone: string; object: string; comment: string; status: string; created_at: string };
type Service = { id: number; icon: string; title: string; description: string; sort_order: number; is_active: boolean };
type Portfolio = { id: number; title: string; description: string; type: string; gradient: string; sort_order: number; is_active: boolean };
type CameraType = { id: string; label: string; price: number; sort_order: number };
type ObjectType = { id: string; label: string; mult: number; sort_order: number };
type ArchiveOption = { id: string; label: string; price: number; sort_order: number };
type Stat = { id: number; value: string; label: string; sort_order: number };

const STATUS_LABELS: Record<string, string> = { new: "Новая", in_progress: "В работе", done: "Завершена", cancelled: "Отменена" };
const STATUS_COLORS: Record<string, string> = { new: "bg-cyan-500/20 text-cyan-400", in_progress: "bg-yellow-500/20 text-yellow-400", done: "bg-green-500/20 text-green-400", cancelled: "bg-red-500/20 text-red-400" };

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("admin_token") || "");
  const [inputToken, setInputToken] = useState("");
  const [authError, setAuthError] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [tab, setTab] = useState<"leads" | "settings" | "services" | "portfolio" | "calc">("leads");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [cameraTypes, setCameraTypes] = useState<CameraType[]>([]);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [archiveOptions, setArchiveOptions] = useState<ArchiveOption[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [newService, setNewService] = useState({ icon: "Star", title: "", description: "" });
  const [newPortfolio, setNewPortfolio] = useState({ title: "", description: "", type: "", gradient: "from-cyan-900/40 to-blue-900/40" });

  async function login() {
    const res = await fetch(leadsApi(LEADS_URL, inputToken, "list"));
    if (res.ok) {
      localStorage.setItem("admin_token", inputToken);
      setToken(inputToken);
      setIsAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  async function loadData() {
    const [contentRes, leadsRes] = await Promise.all([
      fetch(CONTENT_URL),
      fetch(leadsApi(LEADS_URL, token, "list")),
    ]);
    const content = await contentRes.json();
    const leadsData = await leadsRes.json();
    setSettings(content.settings || {});
    setServices(content.services || []);
    setPortfolio(content.portfolio || []);
    setCameraTypes(content.camera_types || []);
    setObjectTypes(content.object_types || []);
    setArchiveOptions(content.archive_options || []);
    setStats(content.stats || []);
    setLeads(Array.isArray(leadsData) ? leadsData : []);
  }

  useEffect(() => {
    if (token) {
      fetch(leadsApi(LEADS_URL, token, "list")).then(r => {
        if (r.ok) { setIsAuthed(true); loadData(); }
        else { localStorage.removeItem("admin_token"); setToken(""); }
      });
    }
  }, []);

  async function saveSettings() {
    try {
      const res = await fetch(api(CONTENT_URL, token, "save_settings"), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(settings) });
      const data = await res.json();
      if (res.ok) setSettingsDirty(false);
      else alert("Ошибка: " + res.status + " " + JSON.stringify(data));
    } catch (e) {
      alert("Ошибка сети: " + e);
    }
  }

  async function updateLeadStatus(id: number, status: string) {
    await fetch(leadsApi(LEADS_URL, token, "update_status", id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify({ status }) });
    setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  }

  async function deleteLead(id: number) {
    if (!confirm("Удалить заявку?")) return;
    await fetch(leadsApi(LEADS_URL, token, "delete", id), { method: "POST", headers: JSON_HEADERS, body: "{}" });
    setLeads(leads.filter(l => l.id !== id));
  }

  async function saveService(s: Service) {
    await fetch(api(CONTENT_URL, token, "save_service", s.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(s) });
    setServices(services.map(x => x.id === s.id ? s : x));
    setEditingService(null);
  }

  async function deleteService(id: number) {
    if (!confirm("Удалить услугу?")) return;
    await fetch(api(CONTENT_URL, token, "delete_service", id), { method: "POST", headers: JSON_HEADERS, body: "{}" });
    setServices(services.filter(x => x.id !== id));
  }

  async function addService() {
    if (!newService.title) return;
    const res = await fetch(api(CONTENT_URL, token, "add_service"), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(newService) });
    const row = await res.json();
    setServices([...services, row]);
    setNewService({ icon: "Star", title: "", description: "" });
  }

  async function savePortfolio(p: Portfolio) {
    await fetch(api(CONTENT_URL, token, "save_portfolio", p.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(p) });
    setPortfolio(portfolio.map(x => x.id === p.id ? p : x));
    setEditingPortfolio(null);
  }

  async function deletePortfolio(id: number) {
    if (!confirm("Удалить проект?")) return;
    await fetch(api(CONTENT_URL, token, "delete_portfolio", id), { method: "POST", headers: JSON_HEADERS, body: "{}" });
    setPortfolio(portfolio.filter(x => x.id !== id));
  }

  async function addPortfolio() {
    if (!newPortfolio.title) return;
    const res = await fetch(api(CONTENT_URL, token, "add_portfolio"), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(newPortfolio) });
    const row = await res.json();
    setPortfolio([...portfolio, row]);
    setNewPortfolio({ title: "", description: "", type: "", gradient: "from-cyan-900/40 to-blue-900/40" });
  }

  async function updateCamera(c: CameraType) {
    await fetch(api(CONTENT_URL, token, "save_camera", c.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(c) });
    setCameraTypes(cameraTypes.map(x => x.id === c.id ? c : x));
  }

  async function updateObjectType(o: ObjectType) {
    await fetch(api(CONTENT_URL, token, "save_object", o.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(o) });
    setObjectTypes(objectTypes.map(x => x.id === o.id ? o : x));
  }

  async function updateArchive(a: ArchiveOption) {
    await fetch(api(CONTENT_URL, token, "save_archive", a.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(a) });
    setArchiveOptions(archiveOptions.map(x => x.id === a.id ? a : x));
  }

  async function updateStat(s: Stat) {
    await fetch(api(CONTENT_URL, token, "save_stat", s.id), { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(s) });
    setStats(stats.map(x => x.id === s.id ? s : x));
  }

  function logout() {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsAuthed(false);
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <Icon name="Shield" size={28} className="text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Вход в админку</h1>
          </div>
          <input
            type="password"
            placeholder="Пароль"
            value={inputToken}
            onChange={e => setInputToken(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 mb-3"
          />
          {authError && <p className="text-red-400 text-sm mb-3">Неверный пароль</p>}
          <button onClick={login} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg py-3 transition-colors">
            Войти
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { key: "leads", label: "Заявки", icon: "Inbox" },
    { key: "settings", label: "Настройки", icon: "Settings" },
    { key: "services", label: "Услуги", icon: "Star" },
    { key: "portfolio", label: "Портфолио", icon: "Briefcase" },
    { key: "calc", label: "Калькулятор", icon: "Calculator" },
  ];

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={22} className="text-cyan-400" />
            <span className="font-bold text-cyan-400">Админка</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "leads" | "settings" | "services" | "portfolio" | "calc")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-white"}`}
              >
                <Icon name={t.icon} size={15} />
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ЗАЯВКИ */}
        {tab === "leads" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Заявки ({leads.length})</h2>
            {leads.length === 0 && <p className="text-slate-400">Заявок пока нет</p>}
            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">{lead.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] || "bg-slate-700 text-slate-300"}`}>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </span>
                        <span className="text-slate-500 text-xs">{new Date(lead.created_at).toLocaleString("ru")}</span>
                      </div>
                      <div className="text-cyan-400 font-medium">{lead.phone}</div>
                      {lead.object && <div className="text-slate-300 text-sm mt-1">Объект: {lead.object}</div>}
                      {lead.comment && <div className="text-slate-400 text-sm mt-1">{lead.comment}</div>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={lead.status}
                        onChange={e => updateLeadStatus(lead.id, e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white"
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <button onClick={() => deleteLead(lead.id)} className="text-red-400 hover:text-red-300 p-1">
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* НАСТРОЙКИ */}
        {tab === "settings" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Настройки сайта</h2>
              <button onClick={saveSettings} className={`font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${settingsDirty ? "bg-cyan-500 hover:bg-cyan-400 text-black" : "bg-slate-700 text-slate-400 cursor-default"}`}>
                  <Icon name="Save" size={16} />
                  {settingsDirty ? "Сохранить" : "Сохранено"}
                </button>
            </div>
            <div className="grid gap-4 max-w-2xl">
              {[
                { key: "company_name", label: "Название компании" },
                { key: "hero_title", label: "Главный заголовок" },
                { key: "hero_subtitle", label: "Подзаголовок", multiline: true },
                { key: "phone", label: "Телефон" },
                { key: "email", label: "Email" },
                { key: "address", label: "Адрес" },
                { key: "work_hours", label: "Часы работы" },
                { key: "about_founded", label: "Год основания" },
                { key: "about_specialists", label: "Кол-во специалистов" },
                { key: "about_guarantee", label: "Гарантия" },
                { key: "nvr_price", label: "Цена регистратора NVR (₽)" },
                { key: "install_price_per_cam", label: "Цена монтажа за камеру (₽)" },
              ].map(({ key, label, multiline }) => (
                <div key={key}>
                  <label className="text-slate-400 text-sm mb-1 block">{label}</label>
                  {multiline ? (
                    <textarea
                      rows={3}
                      value={settings[key] || ""}
                      onChange={e => { setSettings({ ...settings, [key]: e.target.value }); setSettingsDirty(true); }}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={settings[key] || ""}
                      onChange={e => { setSettings({ ...settings, [key]: e.target.value }); setSettingsDirty(true); }}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Статистика компании</label>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map(s => (
                    <div key={s.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                      <input
                        type="text"
                        value={s.value}
                        onChange={e => setStats(stats.map(x => x.id === s.id ? { ...x, value: e.target.value } : x))}
                        onBlur={e => updateStat({ ...s, value: e.target.value })}
                        placeholder="Значение (12+)"
                        className="w-full bg-transparent text-cyan-400 font-bold text-lg focus:outline-none border-b border-slate-600 mb-1"
                      />
                      <input
                        type="text"
                        value={s.label}
                        onChange={e => setStats(stats.map(x => x.id === s.id ? { ...x, label: e.target.value } : x))}
                        onBlur={e => updateStat({ ...s, label: e.target.value })}
                        placeholder="Подпись"
                        className="w-full bg-transparent text-slate-300 text-sm focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* УСЛУГИ */}
        {tab === "services" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Услуги</h2>
            <div className="grid gap-3 mb-6 max-w-3xl">
              {services.map(s => (
                <div key={s.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  {editingService?.id === s.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Иконка (lucide)</label>
                          <input value={editingService.icon} onChange={e => setEditingService({ ...editingService, icon: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Порядок</label>
                          <input type="number" value={editingService.sort_order} onChange={e => setEditingService({ ...editingService, sort_order: +e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Название</label>
                        <input value={editingService.title} onChange={e => setEditingService({ ...editingService, title: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Описание</label>
                        <textarea rows={2} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm resize-none" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => saveService(editingService)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg text-sm">Сохранить</button>
                        <button onClick={() => setEditingService(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Icon name={s.icon} size={20} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{s.title}</div>
                          <div className="text-slate-400 text-sm mt-0.5">{s.description}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditingService(s)} className="text-slate-400 hover:text-white p-1"><Icon name="Pencil" size={16} /></button>
                        <button onClick={() => deleteService(s.id)} className="text-red-400 hover:text-red-300 p-1"><Icon name="Trash2" size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-slate-900/60 border border-dashed border-slate-600 rounded-xl p-4 max-w-3xl">
              <h3 className="font-semibold mb-3 text-slate-300">Добавить услугу</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="Иконка (Camera, Shield...)" value={newService.icon} onChange={e => setNewService({ ...newService, icon: e.target.value })}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                <input placeholder="Название" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
              </div>
              <textarea rows={2} placeholder="Описание" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm resize-none mb-3" />
              <button onClick={addService} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Icon name="Plus" size={16} />Добавить
              </button>
            </div>
          </div>
        )}

        {/* ПОРТФОЛИО */}
        {tab === "portfolio" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Портфолио</h2>
            <div className="grid gap-3 mb-6 max-w-3xl">
              {portfolio.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  {editingPortfolio?.id === p.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Название</label>
                          <input value={editingPortfolio.title} onChange={e => setEditingPortfolio({ ...editingPortfolio, title: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                        </div>
                        <div>
                          <label className="text-slate-400 text-xs mb-1 block">Тип объекта</label>
                          <input value={editingPortfolio.type} onChange={e => setEditingPortfolio({ ...editingPortfolio, type: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Описание (камеры, детали)</label>
                        <input value={editingPortfolio.description} onChange={e => setEditingPortfolio({ ...editingPortfolio, description: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => savePortfolio(editingPortfolio)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg text-sm">Сохранить</button>
                        <button onClick={() => setEditingPortfolio(null)} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{p.title}</div>
                        <div className="text-slate-400 text-sm">{p.description}</div>
                        <span className="text-xs text-cyan-400 mt-1 block">{p.type}</span>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditingPortfolio(p)} className="text-slate-400 hover:text-white p-1"><Icon name="Pencil" size={16} /></button>
                        <button onClick={() => deletePortfolio(p.id)} className="text-red-400 hover:text-red-300 p-1"><Icon name="Trash2" size={16} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="bg-slate-900/60 border border-dashed border-slate-600 rounded-xl p-4 max-w-3xl">
              <h3 className="font-semibold mb-3 text-slate-300">Добавить проект</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input placeholder="Название" value={newPortfolio.title} onChange={e => setNewPortfolio({ ...newPortfolio, title: e.target.value })}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                <input placeholder="Тип (Офис, Склад...)" value={newPortfolio.type} onChange={e => setNewPortfolio({ ...newPortfolio, type: e.target.value })}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
              </div>
              <input placeholder="Описание" value={newPortfolio.description} onChange={e => setNewPortfolio({ ...newPortfolio, description: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm mb-3" />
              <button onClick={addPortfolio} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                <Icon name="Plus" size={16} />Добавить
              </button>
            </div>
          </div>
        )}

        {/* КАЛЬКУЛЯТОР */}
        {tab === "calc" && (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-xl font-bold">Цены калькулятора</h2>

            <div>
              <h3 className="font-semibold text-slate-300 mb-3">Типы камер</h3>
              <div className="space-y-2">
                {cameraTypes.map(c => (
                  <div key={c.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                    <input value={c.label} onChange={e => setCameraTypes(cameraTypes.map(x => x.id === c.id ? { ...x, label: e.target.value } : x))}
                      onBlur={e => updateCamera({ ...c, label: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                    <div className="flex items-center gap-2">
                      <input type="number" value={c.price} onChange={e => setCameraTypes(cameraTypes.map(x => x.id === c.id ? { ...x, price: +e.target.value } : x))}
                        onBlur={e => updateCamera({ ...c, price: +e.target.value })}
                        className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                      <span className="text-slate-400 text-sm">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-300 mb-3">Типы объектов (коэффициенты)</h3>
              <div className="space-y-2">
                {objectTypes.map(o => (
                  <div key={o.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                    <input value={o.label} onChange={e => setObjectTypes(objectTypes.map(x => x.id === o.id ? { ...x, label: e.target.value } : x))}
                      onBlur={e => updateObjectType({ ...o, label: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">×</span>
                      <input type="number" step="0.1" value={o.mult} onChange={e => setObjectTypes(objectTypes.map(x => x.id === o.id ? { ...x, mult: +e.target.value } : x))}
                        onBlur={e => updateObjectType({ ...o, mult: +e.target.value })}
                        className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-300 mb-3">Архив записей</h3>
              <div className="space-y-2">
                {archiveOptions.map(a => (
                  <div key={a.id} className="bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
                    <input value={a.label} onChange={e => setArchiveOptions(archiveOptions.map(x => x.id === a.id ? { ...x, label: e.target.value } : x))}
                      onBlur={e => updateArchive({ ...a, label: e.target.value })}
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                    <div className="flex items-center gap-2">
                      <input type="number" value={a.price} onChange={e => setArchiveOptions(archiveOptions.map(x => x.id === a.id ? { ...x, price: +e.target.value } : x))}
                        onBlur={e => updateArchive({ ...a, price: +e.target.value })}
                        className="w-28 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-sm" />
                      <span className="text-slate-400 text-sm">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}