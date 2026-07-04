(function() {
            // ---------- СОСТОЯНИЕ (сохраняется в localStorage) ----------
            const STORAGE_KEY = 'gipsik_hub_data';

            function defaultState() {
                return {
                    userName: 'PRIZRAK',
                    userLevel: 1,
                    userRank: 'Hoвичек',
                    avatar: '🦊',
                    stats: { downloads: 127, donates: 0, activity: 92 },
                    mods: [
                        { name: 'Ultra HUD', desc: 'Аниме-интерфейс с частицами', installed: true },
                        { name: 'Megablast V2', desc: 'Улучшенная физика взрывов', installed: false }
                    ],
                    news: [
                        'ckoro',
                        'ckoro',
                        'ckoro'
                    ],
                    actions: 1,
                    regDate: '2026-01-15',
                    log: ['[система] Хаб инициализирован']
                };
            }

            // Загружаем или создаём
            let data = loadData();

            function loadData() {
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        // слияние с дефолтом, чтобы новые поля не потерялись
                        const def = defaultState();
                        for (let key in def) {
                            if (!(key in parsed)) parsed[key] = def[key];
                        }
                        return parsed;
                    }
                } catch (e) { console.warn('Загрузка данных сброшена'); }
                return defaultState();
            }

            function saveData() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }

            // ---------- ОБНОВЛЕНИЕ UI ----------
            function renderAll() {
                // Имя / уровень / ранг
                document.getElementById('userName').textContent = data.userName;
                document.getElementById('userLevel').textContent = data.userLevel;document.getElementById('userRank').textContent = data.userRank;
                document.getElementById('avatarEmoji').textContent = data.avatar;
                document.getElementById('greetName').textContent = data.userName;
                document.getElementById('profileName').textContent = data.userName;
                document.getElementById('profileLevel').textContent = data.userLevel;
                document.getElementById('profileRank').textContent = data.userRank;
                document.getElementById('profileActions').textContent = data.actions;
                document.getElementById('profileDate').textContent = data.regDate;
                document.getElementById('profileModsCount').textContent = data.mods.filter(m => m.installed).length;

                // Статистика
                document.getElementById('statDownloads').textContent = data.stats.downloads;
                document.getElementById('statActivity').textContent = data.stats.activity + '%';

                // Моды
                renderMods();

                // Новости
                renderNews();

                // Лог
                renderLog();
            }

            function renderMods() {
                const container = document.getElementById('modsContainer');
                container.innerHTML = '';
                data.mods.forEach((mod, index) => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <h3>${mod.name}</h3>
                        <p>${mod.desc}</p>
                        <p style="font-size:13px; color:${mod.installed ? '#2affb6' : '#ff8a7a'};">
                            ${mod.installed ? '✅ Установлен' : '❌ Не установлен'}
                        </p>
                        <button class="btn btn-sm toggle-mod" data-index="${index}">
                            ${mod.installed ? '🗑 Удалить' : '⬇ Скачать'}
                        </button>
                    `;
                    container.appendChild(card);
                });
            
                // обработчики на кнопки модов
                document.querySelectorAll('.toggle-mod').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        const idx = parseInt(this.dataset.index);
                        data.mods[idx].installed = !data.mods[idx].installed;
                        data.actions += 1;
                        const action = data.mods[idx].installed ? 'установил' : 'удалил';
                        addLog(`🔧 ${data.userName} ${action} мод «${data.mods[idx].name}»`);
                        // обновить счётчик модов
                        data.stats.downloads += data.mods[idx].installed ? 1 : -1;
                        saveData();
                        renderAll();
                    });
                });
            }

            function renderNews() {
                const container = document.getElementById('newsContainer');
                container.innerHTML = '';
                data.news.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerHTML = `
                        <h3>📌 ${item}</h3>
                        <button class="btn btn-sm remove-news" data-idx="${idx}" style="border-color:#6a4a4a;color:#ff8a7a;">✕</button>
                    `;
                    container.appendChild(div);
                });
                document.querySelectorAll('.remove-news').forEach(btn => {
                    btn.addEventListener('click', function() {const idx = parseInt(this.dataset.idx);
                        data.news.splice(idx, 1);
                        data.actions += 1;
                        addLog(`🗑 Удалена новость`);
                        saveData();
                        renderAll();
                    });
                });
            }

            function renderLog() {
                const logContainer = document.getElementById('globalLog');
                logContainer.innerHTML = '';
                // показываем последние 20 записей
                const logs = data.log.slice(-20);
                logs.forEach(entry => {
                    const item = document.createElement('div');
                    item.className = 'log-item';
                    const time = document.createElement('span');
                    time.className = 'log-time';
                    time.textContent = entry.match(/^\[.*?\]/)?.[0] || '[—]';
                    const text = document.createElement('span');
                    text.textContent = entry.replace(/^\[.*?\]\s*/, '');
                    item.appendChild(time);
                    item.appendChild(text);
                    logContainer.appendChild(item);
                });
                // автоскролл вниз
                logContainer.scrollTop = logContainer.scrollHeight;
            }

            // Добавление записи в лог (с датой)
            function addLog(message) {
                const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                const entry = `[${time}] ${message}`;
                data.log.push(entry);
                if (data.log.length > 100) data.log.shift();
                saveData();
                renderLog();

                // также добавляем в главный лог (на главной странице)
                const mainLog = document.getElementById('mainLog');
                const item = document.createElement('div');
                item.className = 'log-item';
                const timeSpan = document.createElement('span');
                timeSpan.className = 'log-time';
                timeSpan.textContent = `[${time}]`;
                const textSpan = document.createElement('span');
                textSpan.textContent = message;
                item.appendChild(timeSpan);
                item.appendChild(textSpan);
                mainLog.appendChild(item);
                if (mainLog.children.length > 12) mainLog.removeChild(mainLog.firstChild);
                mainLog.scrollTop = mainLog.scrollHeight;
            }

            // ---------- НАВИГАЦИЯ (подсайты) ----------
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const pageId = this.dataset.page;
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    document.getElementById('page-' + pageId).classList.add('active');
                    // записываем в лог
                    addLog(`📂 Переход на страницу «${this.textContent.trim()}»`);
                });
            });

            // ---------- ДЕЙСТВИЯ ----------

            // Сменить имя
            document.getElementById('changeNameBtn').addEventListener('click', function() {
                const newName = prompt('Введите новое имя:', data.userName);
                if (newName && newName.trim() !== '') {
                    data.userName = newName.trim();
                    data.actions += 1;
                    addLog(`✏️ Имя изменено на «${data.userName}»`);
                    saveData();
                    renderAll();
                }
            });

            // Сброс профиля
            document.getElementById('resetProfileBtn').addEventListener('click', function() {
                if (confirm('Сбросить все данные? (сохранятся только логи)')) {const def = defaultState();
                    // сохраняем только логи и имя, остальное сбрасываем
                    const oldLogs = data.log;
                    const oldName = data.userName;
                    Object.assign(data, def);
                    data.userName = oldName;
                    data.log = oldLogs;
                    data.actions += 1;
                    addLog('🔄 Профиль сброшен до стандартных настроек');
                    saveData();
                    renderAll();
                }
            });

            // Аватар (двойной клик)
            document.getElementById('avatarEmoji').addEventListener('dblclick', function() {
                const emojis = ['🦊', '🐉', '⚡', '🌀', '🌙', '⭐', '🔥', '💠', '🎮', '👾'];
                const current = data.avatar;
                let next = emojis[Math.floor(Math.random() * emojis.length)];
                while (next === current && emojis.length > 1) next = emojis[Math.floor(Math.random() * emojis.length)];
                data.avatar = next;
                data.actions += 1;
                addLog(`🔄 Аватар изменён на ${next}`);
                saveData();
                renderAll();
            });

            // Добавить мод
            document.getElementById('addModBtn').addEventListener('click', () => {
                const nameRaw = prompt('Название мода:');
                if (!nameRaw || !nameRaw.trim()) return; // выход, если пусто или отмена

                const name = nameRaw.trim();

                // Проверка на дубликат
                if (data.mods.some(mod => mod.name === name)) {
                    alert('Мод с таким названием уже существует.');
                    return;
                }

                const descRaw = prompt('Описание мода:');
                const desc = descRaw !== null ? descRaw : 'Без описания';

                data.mods.push({ name, desc, installed: false });
                data.actions += 1;

                addLog(`➕ Добавлен мод «${name}»`);
                saveData();
                renderAll();
            });


            // Добавить новость
            document.getElementById('addNewsBtn').addEventListener('click', function() {
                const newsText = prompt('Текст новости:');
                if (newsText && newsText.trim()) {
                    data.news.push(newsText.trim());
                    data.actions += 1;
                    addLog(`📰 Добавлена новость: ${newsText.trim()}`);
                    saveData();
                    renderAll();
                }
            });

            // Очистить лог
            document.getElementById('clearLogBtn').addEventListener('click', function() {
                if (confirm('Очистить журнал действий?')) {
                    data.log = ['[система] Лог очищен'];
                    addLog('🧹 Журнал очищен');
                    saveData();
                    renderAll();
                }
            });

            // Обновить статистику
            document.getElementById('refreshStatsBtn').addEventListener('click', function() {
                data.stats.activity = Math.floor(Math.random() * 30) + 65;
                data.actions += 1;
                addLog('⟳ Статистика обновлена');
                saveData();
                renderAll();
            });

            // быстрые ссылки
            document.getElementById('quickLink3').addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('[data-page="news"]').click();
            });

            // ---------- ИНИЦИАЛИЗАЦИЯ ----------
            renderAll();
            addLog('🔄 Система хаба загружена. Привет, ' + data.userName + '!');

            // сохраняем при уходе (на всякий)
            window.addEventListener('beforeunload', saveData);

        })();