        // Инициализация темы при загрузке
function initializeTheme() {
    const savedTheme = localStorage.getItem('metagenius_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('#theme-toggle i');
    const adminThemeIcon = document.querySelector('#admin-theme-toggle i');
    if (themeIcon) {
        themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (adminThemeIcon) {
        adminThemeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Функция для создания поста на форуме
function createForumPost(title, content) {
    if (!title || !content) {
        alert('Заголовок и содержание не могут быть пустыми');
        return false;
    }
    
    const topics = storage.getForumTopics();
    const newTopic = {
        id: topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1,
        user_id: currentUser.id,
        username: currentUser.username,
        title: title,
        content: content,
        created_date: new Date().toISOString(),
        is_announcement: false
    };
    
    topics.push(newTopic);
    storage.saveForumTopics(topics);
    
    // Обновляем отображение
    loadForumTopics();
    
    // Уведомление
    if (currentUser.settings.notifications.forum) {
        notificationSystem.addNotification(
            currentUser.id,
            'Пост создан',
            `Пост "${title}" успешно создан на форуме`
        );
    }
    
    return true;
}

// Обновленная функция переключения темы
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('metagenius_theme', newTheme);
    
    // Обновляем иконку
    const themeIcon = document.querySelector('#theme-toggle i');
    const adminThemeIcon = document.querySelector('#admin-theme-toggle i');
    if (themeIcon) {
        themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (adminThemeIcon) {
        adminThemeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Функция генерации мета-тегов
function generateMetaTags() {
    // Получаем значения из формы
    const title = document.getElementById('tag-title').value.trim();
    const description = document.getElementById('tag-description').value.trim();
    const keywords = document.getElementById('tag-keywords').value.trim();
    const author = document.getElementById('tag-author').value.trim();
    const url = document.getElementById('tag-url').value.trim();
    const image = document.getElementById('tag-image').value.trim();
    const siteName = document.getElementById('tag-site-name').value.trim();
    
    // Проверяем обязательные поля
    if (!title) {
        alert('Пожалуйста, заполните поле "Заголовок страницы"');
        return;
    }
    
    // Генерируем мета-теги
    let tags = '';
    
    // Базовые мета-теги
    tags += `<title>${escapeHtml(title)}</title>\n`;
    tags += `<meta charset="UTF-8">\n`;
    tags += `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
    
    if (description) {
        tags += `<meta name="description" content="${escapeHtml(description)}">\n`;
    }
    
    if (keywords) {
        tags += `<meta name="keywords" content="${escapeHtml(keywords)}">\n`;
    }
    
    if (author) {
        tags += `<meta name="author" content="${escapeHtml(author)}">\n`;
    }
    
    // Open Graph теги (для соцсетей)
    tags += `\n<!-- Open Graph -->\n`;
    tags += `<meta property="og:type" content="website">\n`;
    tags += `<meta property="og:title" content="${escapeHtml(title)}">\n`;
    
    if (description) {
        tags += `<meta property="og:description" content="${escapeHtml(description)}">\n`;
    }
    
    if (url) {
        tags += `<meta property="og:url" content="${escapeHtml(url)}">\n`;
    }
    
    if (siteName) {
        tags += `<meta property="og:site_name" content="${escapeHtml(siteName)}">\n`;
    }
    
    if (image) {
        tags += `<meta property="og:image" content="${escapeHtml(image)}">\n`;
        tags += `<meta property="og:image:width" content="1200">\n`;
        tags += `<meta property="og:image:height" content="630">\n`;
    }
    
    // Twitter Card теги
    tags += `\n<!-- Twitter Card -->\n`;
    tags += `<meta name="twitter:card" content="summary_large_image">\n`;
    tags += `<meta name="twitter:title" content="${escapeHtml(title)}">\n`;
    
    if (description) {
        tags += `<meta name="twitter:description" content="${escapeHtml(description)}">\n`;
    }
    
    if (image) {
        tags += `<meta name="twitter:image" content="${escapeHtml(image)}">\n`;
    }
    
    // Каноническая ссылка
    if (url) {
        tags += `\n<!-- Canonical URL -->\n`;
        tags += `<link rel="canonical" href="${escapeHtml(url)}">\n`;
    }
    
    // Дополнительные теги
    tags += `\n<!-- Дополнительные мета-теги -->\n`;
    tags += `<meta name="robots" content="index, follow">\n`;
    tags += `<meta name="language" content="RU">\n`;
    
    // Отображаем результат
    document.getElementById('tags-code').textContent = tags;
    document.getElementById('tags-preview').style.display = 'block';
    
    // Прокручиваем к результату
    document.getElementById('tags-preview').scrollIntoView({ behavior: 'smooth' });
}

// Функция копирования тегов в буфер обмена
function copyTagsToClipboard() {
    const tagsCode = document.getElementById('tags-code').textContent;
    
    navigator.clipboard.writeText(tagsCode).then(() => {
        // Показываем уведомление об успешном копировании
        showNotification('Теги скопированы в буфер обмена!', 'success');
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
        showNotification('Ошибка при копировании', 'error');
    });
}

// Функция скачивания тегов как файла
function downloadTagsAsFile() {
    const tagsCode = document.getElementById('tags-code').textContent;
    const title = document.getElementById('tag-title').value.trim() || 'meta-tags';
    const filename = `${title.replace(/\s+/g, '-').toLowerCase()}-meta-tags.txt`;
    
    const blob = new Blob([tagsCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Файл успешно скачан!', 'success');
}

// Вспомогательная функция для экранирования HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Функция показа уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <button class="close-toast">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Закрытие по клику
    notification.querySelector('.close-toast').addEventListener('click', () => {
        notification.remove();
    });
}

// Класс для работы с JSON-хранилищем (LocalStorage)
class JSONStorage {
    constructor() {
        this.storageKey = 'metagenius_data';
        this.initData();
    }

    // Инициализация данных, если их нет
    initData() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                users: [
                    { 
                        id: 1, 
                        username: 'admin', 
                        email: 'admin@example.com', 
                        password: 'admin123', 
                        role: 'admin',
                        registration_date: new Date().toISOString().split('T')[0],
                        settings: {
                            theme: 'light',
                            notifications: {
                                audit: true,
                                forum: true,
                                support: true
                            }
                        }
                    }
                ],
                projects: [],
                forum_topics: [],
                complaints: [],
                audits: [],
                forum_likes: {},
                forum_comments: {},
                project_groups: [],
                support_chat: []
            };
            this.saveData(initialData);
        }
    }

    // Получить все данные
    getData() {
        return JSON.parse(localStorage.getItem(this.storageKey));
    }

    // Сохранить все данные
    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Получить пользователей
    getUsers() {
        return this.getData().users;
    }

    // Сохранить пользователей
    saveUsers(users) {
        const data = this.getData();
        data.users = users;
        this.saveData(data);
    }

    // Получить проекты
    getProjects() {
        return this.getData().projects;
    }

    // Сохранить проекты
    saveProjects(projects) {
        const data = this.getData();
        data.projects = projects;
        this.saveData(data);
    }

    // Получить темы форума
    getForumTopics() {
        return this.getData().forum_topics;
    }

    // Сохранить темы форума
    saveForumTopics(topics) {
        const data = this.getData();
        data.forum_topics = topics;
        this.saveData(data);
    }

    // Получить жалобы
    getComplaints() {
        return this.getData().complaints;
    }

    // Сохранить жалобы
    saveComplaints(complaints) {
        const data = this.getData();
        data.complaints = complaints;
        this.saveData(data);
    }

    // Получить аудиты
    getAudits() {
        return this.getData().audits;
    }

    // Сохранить аудиты
    saveAudits(audits) {
        const data = this.getData();
        data.audits = audits;
        this.saveData(data);
    }

    // Получить комментарии форума
    getForumComments() {
        return this.getData().forum_comments;
    }

    // Сохранить комментарии форума
    saveForumComments(comments) {
        const data = this.getData();
        data.forum_comments = comments;
        this.saveData(data);
    }

    // Получить группы проектов
    getProjectGroups() {
        return this.getData().project_groups;
    }

    // Сохранить группы проектов
    saveProjectGroups(groups) {
        const data = this.getData();
        data.project_groups = groups;
        this.saveData(data);
    }

    // Получить чат поддержки
    getSupportChat() {
        return this.getData().support_chat;
    }

    // Сохранить чат поддержки
    saveSupportChat(chat) {
        const data = this.getData();
        data.support_chat = chat;
        this.saveData(data);
    }
}

// Класс для работы с уведомлениями
class NotificationSystem {
    constructor() {
        this.notifications = JSON.parse(localStorage.getItem('metagenius_notifications')) || [];
    }

    addNotification(userId, title, message, type = 'info') {
        const notification = {
            id: Date.now(),
            userId,
            title,
            message,
            type,
            isRead: false,
            timestamp: new Date().toISOString()
        };
        
        this.notifications.push(notification);
        this.save();
        this.updateBadge(userId);
        
        // Показываем уведомление, если пользователь онлайн
        if (currentUser && currentUser.id === userId) {
            this.showToast(notification);
        }
    }

    getUnreadCount(userId) {
        return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.isRead = true;
            this.save();
            this.updateBadge(notification.userId);
        }
    }

    getUserNotifications(userId) {
        return this.notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    updateBadge(userId) {
        if (currentUser && currentUser.id === userId) {
            const count = this.getUnreadCount(userId);
            const badge = document.getElementById('notification-count');
            const adminBadge = document.getElementById('admin-notification-count');
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
            if (adminBadge) {
                adminBadge.textContent = count;
                adminBadge.style.display = count > 0 ? 'flex' : 'none';
            }
        }
    }

    showToast(notification) {
        // Создаем toast-уведомление
        const toast = document.createElement('div');
        toast.className = `notification-toast notification-${notification.type}`;
        toast.innerHTML = `
            <strong>${notification.title}</strong>
            <p>${notification.message}</p>
            <button class="close-toast">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            toast.remove();
        }, 5000);
        
        // Закрытие по клику
        toast.querySelector('.close-toast').addEventListener('click', () => {
            toast.remove();
        });
    }

    save() {
        localStorage.setItem('metagenius_notifications', JSON.stringify(this.notifications));
    }
}

// Класс для работы с группами проектов
class ProjectGroups {
    constructor() {
        this.storage = storage;
    }

    createGroup(userId, name, description = '') {
        const groups = this.storage.getProjectGroups();
        const group = {
            id: Date.now(),
            userId,
            name,
            description,
            created: new Date().toISOString(),
            projectIds: []
        };
        
        groups.push(group);
        this.storage.saveProjectGroups(groups);
        return group;
    }

    getUserGroups(userId) {
        const groups = this.storage.getProjectGroups();
        return groups.filter(g => g.userId === userId);
    }

    addProjectToGroup(groupId, projectId) {
        const groups = this.storage.getProjectGroups();
        const group = groups.find(g => g.id === groupId);
        if (group && !group.projectIds.includes(projectId)) {
            group.projectIds.push(projectId);
            this.storage.saveProjectGroups(groups);
        }
    }

    removeProjectFromGroup(groupId, projectId) {
        const groups = this.storage.getProjectGroups();
        const group = groups.find(g => g.id === groupId);
        if (group) {
            group.projectIds = group.projectIds.filter(id => id !== projectId);
            this.storage.saveProjectGroups(groups);
        }
    }

    deleteGroup(groupId) {
        const groups = this.storage.getProjectGroups();
        const updatedGroups = groups.filter(g => g.id !== groupId);
        this.storage.saveProjectGroups(updatedGroups);
    }
}

// Класс для работы с чатом поддержки
class SupportChat {
    constructor() {
        this.storage = storage;
    }

    sendMessage(userId, message, isSupport = false) {
        const chat = this.storage.getSupportChat();
        const chatMessage = {
            id: Date.now(),
            userId,
            message,
            isSupport,
            timestamp: new Date().toISOString()
        };
        
        chat.push(chatMessage);
        this.storage.saveSupportChat(chat);
        return chatMessage;
    }

    getUserMessages(userId) {
        const chat = this.storage.getSupportChat();
        return chat
            .filter(m => m.userId === userId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }
}

// Класс для работы с рейтингами
class RatingSystem {
    constructor() {
        this.ratings = JSON.parse(localStorage.getItem('metagenius_ratings')) || {};
    }

    setRating(userId, rating) {
        this.ratings[userId] = rating;
        this.save();
    }

    getRating(userId) {
        return this.ratings[userId] || 5.0;
    }

    calculateUserRank(userId) {
        // Простая реализация расчета рейтинга
        const ratings = Object.values(this.ratings);
        if (ratings.length === 0) return 1;
        
        const userRating = this.getRating(userId);
        const higherRated = ratings.filter(r => r > userRating).length;
        return higherRated + 1;
    }

    save() {
        localStorage.setItem('metagenius_ratings', JSON.stringify(this.ratings));
    }
}

// Класс для работы с лайками на форуме
class ForumLikes {
    constructor() {
        this.likes = storage.getData().forum_likes || {};
    }

    toggleLike(topicId, userId) {
        if (!this.likes[topicId]) {
            this.likes[topicId] = [];
        }
        
        const userIndex = this.likes[topicId].indexOf(userId);
        if (userIndex > -1) {
            // Убираем лайк
            this.likes[topicId].splice(userIndex, 1);
        } else {
            // Добавляем лайк
            this.likes[topicId].push(userId);
        }
        
        this.save();
        return this.likes[topicId].length;
    }

    getLikesCount(topicId) {
        return this.likes[topicId] ? this.likes[topicId].length : 0;
    }

    hasUserLiked(topicId, userId) {
        return this.likes[topicId] && this.likes[topicId].includes(userId);
    }

    save() {
        const data = storage.getData();
        data.forum_likes = this.likes;
        storage.saveData(data);
    }
}

// Класс для работы с комментариями на форуме
class ForumComments {
    constructor() {
        this.comments = storage.getForumComments();
    }

    addComment(topicId, userId, username, content) {
        if (!this.comments[topicId]) {
            this.comments[topicId] = [];
        }
        
        const comment = {
            id: Date.now(),
            userId,
            username,
            content,
            timestamp: new Date().toISOString()
        };
        
        this.comments[topicId].push(comment);
        this.save();
        return comment;
    }

    getComments(topicId) {
        return this.comments[topicId] || [];
    }

    deleteComment(topicId, commentId) {
        if (this.comments[topicId]) {
            this.comments[topicId] = this.comments[topicId].filter(c => c.id !== commentId);
            this.save();
        }
    }

    save() {
        storage.saveForumComments(this.comments);
    }
}

// Инициализация систем
const storage = new JSONStorage();
const notificationSystem = new NotificationSystem();
const projectGroups = new ProjectGroups();
const supportChat = new SupportChat();
const ratingSystem = new RatingSystem();
const forumLikes = new ForumLikes();
const forumComments = new ForumComments();

// Элементы DOM
const homePage = document.getElementById('home-page');
const userDashboard = document.getElementById('user-dashboard');
const adminDashboard = document.getElementById('admin-dashboard');

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const createGroupModal = document.getElementById('create-group-modal');
const createTopicModal = document.getElementById('create-topic-modal');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const createGroupForm = document.getElementById('create-group-form');
const createTopicForm = document.getElementById('create-topic-form');

const loginBtn = document.getElementById('login-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');

const switchToRegister = document.getElementById('switch-to-register');
const switchToLogin = document.getElementById('switch-to-login');

const closeModalBtns = document.querySelectorAll('.close-modal');

const userAvatar = document.getElementById('user-avatar');
const usernameDisplay = document.getElementById('username-display');

// Навигация в дашборде пользователя
const navDashboard = document.querySelector('.nav-dashboard');
const navTags = document.querySelector('.nav-tags'); // НОВАЯ ВКЛАДКА
const navAudit = document.querySelector('.nav-audit');
const navForum = document.querySelector('.nav-forum');
const navSupport = document.querySelector('.nav-support');
const navSettings = document.querySelector('.nav-settings');

const userHomeContent = document.getElementById('user-home-content');
const tagsContent = document.getElementById('tags-content'); // НОВЫЙ КОНТЕНТ
const auditContent = document.getElementById('audit-content');
const forumContent = document.getElementById('forum-content');
const supportContent = document.getElementById('support-content');
const settingsContent = document.getElementById('settings-content');

// Навигация в админ-панели
const navAdminUsers = document.querySelector('.nav-admin-users');
const navAdminForum = document.querySelector('.nav-admin-forum');
const navAdminComplaints = document.querySelector('.nav-admin-complaints');

const adminUsersContent = document.getElementById('admin-users-content');
const adminForumContent = document.getElementById('admin-forum-content');
const adminComplaintsContent = document.getElementById('admin-complaints-content');

// Элементы для аудита
const projectAutocomplete = document.getElementById('project-autocomplete');
const startAuditBtn = document.getElementById('start-audit-btn');
const auditProgress = document.getElementById('audit-progress');
const auditResultsDetail = document.getElementById('audit-results-detail');
const saveAuditBtn = document.getElementById('save-audit-btn');

// Кнопки создания группы и темы
const createGroupBtn = document.getElementById('create-group-btn');
const createTopicBtn = document.getElementById('create-topic-btn');

// Текущий пользователь
let currentUser = null;

// Сохранение состояния приложения
function saveAppState() {
    if (currentUser) {
        const state = {
            currentPage: getCurrentPage(),
            userId: currentUser.id
        };
        localStorage.setItem('metagenius_app_state', JSON.stringify(state));
    }
}

function restoreAppState() {
    const savedState = localStorage.getItem('metagenius_app_state');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.userId === currentUser.id) {
            navigateToPage(state.currentPage);
        }
    }
}

function getCurrentPage() {
    if (userDashboard.style.display !== 'none' && userHomeContent.style.display !== 'none') return 'user-home';
    if (userDashboard.style.display !== 'none' && tagsContent.style.display !== 'none') return 'tags'; // НОВОЕ
    if (userDashboard.style.display !== 'none' && auditContent.style.display !== 'none') return 'audit';
    if (userDashboard.style.display !== 'none' && forumContent.style.display !== 'none') return 'forum';
    if (userDashboard.style.display !== 'none' && supportContent.style.display !== 'none') return 'support';
    if (userDashboard.style.display !== 'none' && settingsContent.style.display !== 'none') return 'settings';
    if (adminDashboard.style.display !== 'none' && adminUsersContent.style.display !== 'none') return 'admin-users';
    if (adminDashboard.style.display !== 'none' && adminForumContent.style.display !== 'none') return 'admin-forum';
    if (adminDashboard.style.display !== 'none' && adminComplaintsContent.style.display !== 'none') return 'admin-complaints';
    return 'user-home';
}

function navigateToPage(page) {
    switch(page) {
        case 'user-home':
            setActiveNav(navDashboard);
            showSection(userHomeContent);
            loadUserProjects();
            break;
        case 'tags': // НОВЫЙ КЕЙС
            setActiveNav(navTags);
            showSection(tagsContent);
            break;
        case 'audit':
            setActiveNav(navAudit);
            showSection(auditContent);
            loadProjectAutocomplete();
            break;
        case 'forum':
            setActiveNav(navForum);
            showSection(forumContent);
            loadForumTopics();
            break;
        case 'support':
            setActiveNav(navSupport);
            showSection(supportContent);
            loadSupportHistory();
            loadSupportChat();
            break;
        case 'settings':
            setActiveNav(navSettings);
            showSection(settingsContent);
            loadUserSettings();
            break;
        case 'admin-users':
            setActiveNav(navAdminUsers);
            showAdminSection(adminUsersContent);
            loadAdminUsers();
            break;
        case 'admin-forum':
            setActiveNav(navAdminForum);
            showAdminSection(adminForumContent);
            loadAdminForum();
            break;
        case 'admin-complaints':
            setActiveNav(navAdminComplaints);
            showAdminSection(adminComplaintsContent);
            loadAdminComplaints();
            break;
        default:
            setActiveNav(navDashboard);
            showSection(userHomeContent);
            loadUserProjects();
    }
    saveAppState();
}

// Функция для загрузки автодополнения проектов
function loadProjectAutocomplete() {
    const projects = storage.getProjects();
    const userProjects = projects.filter(p => p.user_id === currentUser.id);
    const datalist = document.getElementById('project-suggestions');
    datalist.innerHTML = '';
    
    userProjects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.name;
        datalist.appendChild(option);
    });
    
    // Загружаем группы для выбора
    const groups = projectGroups.getUserGroups(currentUser.id);
    const groupSelect = document.getElementById('project-group-select');
    groupSelect.innerHTML = '<option value="">Без группы</option>';
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        groupSelect.appendChild(option);
    });
    
    return userProjects;
}

// Функция для показа подсказок
function showAutocompleteSuggestions(input, projects) {
    const suggestionsContainer = document.getElementById('autocomplete-suggestions');
    const value = input.value.toLowerCase().trim();
    
    if (value.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Фильтруем проекты по введенному тексту
    const filteredProjects = projects.filter(project => 
        project.name.toLowerCase().includes(value)
    );
    
    if (filteredProjects.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    // Создаем элементы подсказок
    suggestionsContainer.innerHTML = '';
    filteredProjects.forEach(project => {
        const suggestion = document.createElement('div');
        suggestion.className = 'autocomplete-suggestion';
        suggestion.textContent = project.name;
        suggestion.dataset.projectId = project.id;
        
        suggestion.addEventListener('click', () => {
            input.value = project.name;
            suggestionsContainer.style.display = 'none';
        });
        
        suggestionsContainer.appendChild(suggestion);
    });
    
    // Позиционируем и показываем контейнер
    const rect = input.getBoundingClientRect();
    suggestionsContainer.style.top = `${rect.bottom + window.scrollY}px`;
    suggestionsContainer.style.left = `${rect.left + window.scrollX}px`;
    suggestionsContainer.style.width = `${rect.width}px`;
    suggestionsContainer.style.display = 'block';
}

// Функция для получения ID проекта по имени
function getProjectIdByName(projectName, projects) {
    const project = projects.find(p => p.name === projectName);
    return project ? project.id : null;
}

// Вспомогательная функция для подсветки подсказок
function updateHighlightedSuggestion(suggestions, index) {
    suggestions.forEach(s => s.classList.remove('highlighted'));
    if (suggestions[index]) {
        suggestions[index].classList.add('highlighted');
    }
}

// Открытие модального окна входа
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'flex';
});

getStartedBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'flex';
});

// Переключение между окнами входа и регистрации
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

// Закрытие модальных окон
closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        createGroupModal.style.display = 'none';
        createTopicModal.style.display = 'none';
    });
});

// Обработка формы входа
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        loginModal.style.display = 'none';
        
        // Сохраняем информацию о текущем пользователе
        localStorage.setItem('metagenius_current_user', JSON.stringify({
            id: user.id,
            email: user.email
        }));
        
        if (user.role === 'admin') {
            homePage.style.display = 'none';
            adminDashboard.style.display = 'block';
            document.getElementById('admin-avatar').textContent = user.username.charAt(0).toUpperCase();
            loadAdminData();
            restoreAppState();
        } else {
            homePage.style.display = 'none';
            userDashboard.style.display = 'block';
            userAvatar.textContent = user.username.charAt(0).toUpperCase();
            usernameDisplay.textContent = user.username;
            loadUserData();
            restoreAppState();
        }
    } else {
        alert('Неверный email или пароль');
    }
});

// Обработка формы регистрации
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const users = storage.getUsers();
    
    // Проверяем, нет ли уже пользователя с таким email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        alert('Пользователь с таким email уже зарегистрирован');
        return;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        username,
        email,
        password,
        role: 'user',
        registration_date: new Date().toISOString().split('T')[0],
        settings: {
            theme: 'light',
            notifications: {
                audit: true,
                forum: true,
                support: true
            }
        }
    };
    
    users.push(newUser);
    storage.saveUsers(users);
    currentUser = newUser;
    
    // Сохраняем информацию о текущем пользователе
    localStorage.setItem('metagenius_current_user', JSON.stringify({
        id: newUser.id,
        email: newUser.email
    }));
    
    registerModal.style.display = 'none';
    homePage.style.display = 'none';
    userDashboard.style.display = 'block';
    userAvatar.textContent = newUser.username.charAt(0).toUpperCase();
    usernameDisplay.textContent = newUser.username;
    
    // Устанавливаем начальный рейтинг
    ratingSystem.setRating(newUser.id, 5.0);
    
    alert('Регистрация прошла успешно!');
    loadUserData();
    
    // Добавляем уведомление о регистрации
    notificationSystem.addNotification(
        newUser.id,
        'Добро пожаловать!',
        'Вы успешно зарегистрировались в MetaGenius. Начните работу с создания первого проекта.'
    );
});

// Выход из системы
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    userDashboard.style.display = 'none';
    homePage.style.display = 'block';
    localStorage.removeItem('metagenius_current_user');
    
    // Сброс форм
    loginForm.reset();
    registerForm.reset();
});

adminLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    adminDashboard.style.display = 'none';
    homePage.style.display = 'block';
    localStorage.removeItem('metagenius_current_user');
    
    // Сброс форм
    loginForm.reset();
    registerForm.reset();
});

// Навигация в дашборде пользователя
navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('user-home');
});

// НОВАЯ НАВИГАЦИЯ ДЛЯ ТЕГОВ
navTags.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('tags');
});

navAudit.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('audit');
});

navForum.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('forum');
});

navSupport.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('support');
});

navSettings.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('settings');
});

// Навигация в админ-панели
navAdminUsers.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('admin-users');
});

navAdminForum.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('admin-forum');
});

navAdminComplaints.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToPage('admin-complaints');
});

// Обработчик запуска аудита
startAuditBtn.addEventListener('click', () => {
    const url = document.getElementById('audit-url').value;
    const projectName = document.getElementById('project-autocomplete').value.trim();
    const projects = storage.getProjects().filter(p => p.user_id === currentUser.id);
    
    if (!url) {
        alert('Пожалуйста, введите URL для аудита');
        return;
    }
    
    if (!projectName) {
        alert('Пожалуйста, введите название проекта');
        return;
    }
    
    // Сброс предыдущих результатов
    auditResultsDetail.style.display = 'none';
    auditProgress.style.width = '0%';
    
    // Имитация процесса аудита
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Показать результаты
            setTimeout(() => {
                showAuditResults(url);
                auditResultsDetail.style.display = 'block';
            }, 500);
        }
        auditProgress.style.width = `${progress}%`;
    }, 300);
});

// Обработчик сохранения результатов аудита
saveAuditBtn.addEventListener('click', () => {
    const projectName = document.getElementById('project-autocomplete').value.trim();
    const url = document.getElementById('audit-url').value;
    const groupId = document.getElementById('project-group-select').value;
    const projects = storage.getProjects();
    const userProjects = projects.filter(p => p.user_id === currentUser.id);
    
    if (!projectName) {
        alert('Пожалуйста, введите название проекта');
        return;
    }
    
    // Ищем существующий проект или создаем новый
    let targetProjectId = getProjectIdByName(projectName, userProjects);
    
    if (!targetProjectId) {
        // Создаем новый проект
        const newProject = {
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            user_id: currentUser.id,
            name: projectName,
            url: url,
            created_date: new Date().toISOString().split('T')[0]
        };
        projects.push(newProject);
        storage.saveProjects(projects);
        targetProjectId = newProject.id;
        
        // Добавляем проект в группу, если выбрана
        if (groupId) {
            projectGroups.addProjectToGroup(parseInt(groupId), newProject.id);
        }
        
        // Обновляем список автодополнения
        loadProjectAutocomplete();
    }
    
    // Сохраняем аудит
    const audits = storage.getAudits();
    const newAudit = {
        id: audits.length > 0 ? Math.max(...audits.map(a => a.id)) + 1 : 1,
        project_id: parseInt(targetProjectId),
        user_id: currentUser.id,
        url: url,
        date: new Date().toISOString(),
        results: generateAuditResults()
    };
    audits.push(newAudit);
    storage.saveAudits(audits);
    
    alert('Результаты аудита успешно сохранены!');
    loadUserProjects();
    
    // Добавляем уведомление
    if (currentUser.settings.notifications.audit) {
        notificationSystem.addNotification(
            currentUser.id,
            'Аудит завершен',
            `Аудит для ${url} успешно завершен и сохранен`
        );
    }
});

// Поиск проектов
document.getElementById('search-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    loadUserProjects(searchTerm);
});

// Создание группы проектов
createGroupBtn.addEventListener('click', function() {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему');
        return;
    }
    // Проверяем, что пользователь не администратор (только пользователи могут создавать группы)
    if (currentUser.role === 'admin') {
        alert('Администраторы не могут создавать группы проектов');
        return;
    }
    createGroupModal.style.display = 'flex';
});

// Обработка формы создания группы
createGroupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('group-name').value.trim();
    const description = document.getElementById('group-description').value.trim();

    if (!name) {
        alert('Пожалуйста, введите название группы');
        return;
    }

    const group = projectGroups.createGroup(currentUser.id, name, description);
    createGroupModal.style.display = 'none';
    createGroupForm.reset();
    loadProjectGroups();

    alert('Группа успешно создана!');

    // Уведомление
    notificationSystem.addNotification(
        currentUser.id,
        'Группа создана',
        `Группа "${name}" успешно создана`
    );
});

// Создание темы на форуме
createTopicBtn.addEventListener('click', function() {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему для создания темы');
        return;
    }
    
    createTopicModal.style.display = 'flex';
});

// Обработчик формы создания темы
createTopicForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('topic-title').value.trim();
    const content = document.getElementById('topic-content').value.trim();
    
    if (!title || !content) {
        alert('Заголовок и содержание темы не могут быть пустыми');
        return;
    }
    
    if (createForumPost(title, content)) {
        createTopicModal.style.display = 'none';
        createTopicForm.reset();
        alert('Тема успешно создана!');
    } else {
        alert('Ошибка при создании темы');
    }
});

// Отправка сообщения в поддержку
document.getElementById('send-chat-btn').addEventListener('click', function() {
    if (!currentUser) {
        alert('Пожалуйста, войдите в систему для обращения в поддержку');
        return;
    }
    
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) {
        alert('Пожалуйста, введите сообщение');
        return;
    }
    
    // Отправляем сообщение пользователя
    supportChat.sendMessage(currentUser.id, message, false);
    input.value = '';
    loadSupportChat();
    
    // Создаем обращение в поддержку
    const complaints = storage.getComplaints();
    const newComplaint = {
        id: complaints.length > 0 ? Math.max(...complaints.map(c => c.id)) + 1 : 1,
        user_id: currentUser.id,
        username: currentUser.username,
        subject: `Обращение от ${new Date().toLocaleString()}`,
        message: message,
        status: 'open',
        created_date: new Date().toISOString().split('T')[0]
    };
    complaints.push(newComplaint);
    storage.saveComplaints(complaints);
    
    // Имитация ответа поддержки
    setTimeout(() => {
        supportChat.sendMessage(
            currentUser.id, 
            'Спасибо за ваше сообщение. Наша команда поддержки свяжется с вами в ближайшее время.', 
            true
        );
        loadSupportChat();
        
        if (currentUser.settings.notifications.support) {
            notificationSystem.addNotification(
                currentUser.id,
                'Ответ поддержки',
                'Получен ответ от службы поддержки'
            );
        }
    }, 2000);
});

// Сохранение настроек пользователя
document.getElementById('save-settings-btn').addEventListener('click', () => {
    const username = document.getElementById('settings-username').value;
    const email = document.getElementById('settings-email').value;
    const password = document.getElementById('settings-password').value;
    const passwordConfirm = document.getElementById('settings-password-confirm').value;
    
    const notifyAudit = document.getElementById('notify-audit').checked;
    const notifyForum = document.getElementById('notify-forum').checked;
    const notifySupport = document.getElementById('notify-support').checked;
    
    if (password && password !== passwordConfirm) {
        alert('Пароли не совпадают');
        return;
    }
    
    const users = storage.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].username = username;
        users[userIndex].email = email;
        users[userIndex].settings.notifications.audit = notifyAudit;
        users[userIndex].settings.notifications.forum = notifyForum;
        users[userIndex].settings.notifications.support = notifySupport;
        
        if (password) {
            users[userIndex].password = password;
        }
        
        storage.saveUsers(users);
        currentUser = users[userIndex];
        userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        usernameDisplay.textContent = currentUser.username;
        
        alert('Настройки успешно сохранены!');
    }
});

// Экспорт результатов аудита в PDF
document.getElementById('export-pdf-btn').addEventListener('click', () => {
    const url = document.getElementById('audit-url').value;
    const auditScore = document.querySelector('.audit-score')?.textContent || 'N/A';

    // Создаем новый PDF документ
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Заголовок
    doc.setFontSize(20);
    doc.text('Отчет аудита сайта', 20, 30);

    // URL сайта
    doc.setFontSize(12);
    doc.text(`URL: ${url}`, 20, 50);
    doc.text(`Дата аудита: ${new Date().toLocaleDateString('ru-RU')}`, 20, 60);
    doc.text(`Общий балл: ${auditScore}`, 20, 70);

    // Разделители
    doc.line(20, 75, 190, 75);

    let yPosition = 85;

    // Мета-теги
    doc.setFontSize(14);
    doc.text('Мета-теги:', 20, yPosition);
    yPosition += 10;

    const metaTags = document.querySelectorAll('.result-category')[0]?.querySelectorAll('.result-item');
    if (metaTags) {
        metaTags.forEach(tag => {
            const name = tag.querySelector('span:first-child')?.textContent || '';
            const status = tag.querySelector('.result-status')?.textContent || '';
            doc.setFontSize(10);
            doc.text(`${name}: ${status}`, 30, yPosition);
            yPosition += 8;
        });
    }

    yPosition += 10;

    // Производительность
    doc.setFontSize(14);
    doc.text('Производительность:', 20, yPosition);
    yPosition += 10;

    const performance = document.querySelectorAll('.result-category')[1]?.querySelectorAll('.result-item');
    if (performance) {
        performance.forEach(item => {
            const name = item.querySelector('span:first-child')?.textContent || '';
            const status = item.querySelector('.result-status')?.textContent || '';
            doc.setFontSize(10);
            doc.text(`${name}: ${status}`, 30, yPosition);
            yPosition += 8;
        });
    }

    yPosition += 10;

    // SEO
    doc.setFontSize(14);
    doc.text('SEO:', 20, yPosition);
    yPosition += 10;

    const seo = document.querySelectorAll('.result-category')[2]?.querySelectorAll('.result-item');
    if (seo) {
        seo.forEach(item => {
            const name = item.querySelector('span:first-child')?.textContent || '';
            const status = item.querySelector('.result-status')?.textContent || '';
            doc.setFontSize(10);
            doc.text(`${name}: ${status}`, 30, yPosition);
            yPosition += 8;
        });
    }

    // Сохраняем PDF
    const filename = `audit-${url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    showNotification('PDF отчет успешно экспортирован!', 'success');
});

// Экспорт результатов аудита в CSV
document.getElementById('export-csv-btn').addEventListener('click', () => {
    const url = document.getElementById('audit-url').value;
    const auditScore = document.querySelector('.audit-score')?.textContent || 'N/A';

    // Генерация CSV
    let csvContent = "Категория,Показатель,Статус\n";

    // Общий результат
    csvContent += `Общий результат,,${auditScore}\n`;

    // Мета-теги
    csvContent += "Мета-теги,,\n";
    const metaTags = document.querySelectorAll('.result-category')[0]?.querySelectorAll('.result-item');
    if (metaTags) {
        metaTags.forEach(tag => {
            const name = tag.querySelector('span:first-child')?.textContent || '';
            const status = tag.querySelector('.result-status')?.textContent || '';
            csvContent += `,${name},${status}\n`;
        });
    }

    // Производительность
    csvContent += "Производительность,,\n";
    const performance = document.querySelectorAll('.result-category')[1]?.querySelectorAll('.result-item');
    if (performance) {
        performance.forEach(item => {
            const name = item.querySelector('span:first-child')?.textContent || '';
            const status = item.querySelector('.result-status')?.textContent || '';
            csvContent += `,${name},${status}\n`;
        });
    }

    // SEO
    csvContent += "SEO,,\n";
    const seo = document.querySelectorAll('.result-category')[2]?.querySelectorAll('.result-item');
    if (seo) {
        seo.forEach(item => {
            const name = item.querySelector('span:first-child')?.textContent || '';
            const status = item.querySelector('.result-status')?.textContent || '';
            csvContent += `,${name},${status}\n`;
        });
    }

    // Создаем и скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlObj;
    a.download = `audit-${url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(urlObj);

    showNotification('CSV файл успешно экспортирован!', 'success');
});

// Создание объявления администратором
document.getElementById('create-announcement-btn').addEventListener('click', () => {
    const title = prompt('Введите заголовок объявления:');
    if (!title) return;
    
    const content = prompt('Введите содержание объявления:');
    if (!content) return;
    
    const topics = storage.getForumTopics();
    const newTopic = {
        id: topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1,
        user_id: currentUser.id,
        username: currentUser.username,
        title: title,
        content: content,
        created_date: new Date().toISOString(),
        is_announcement: true
    };
    topics.push(newTopic);
    storage.saveForumTopics(topics);
    
    alert('Объявление успешно создано!');
    loadAdminForum();
    
    // Добавляем уведомление для всех пользователей
    const users = storage.getUsers();
    users.forEach(user => {
        if (user.id !== currentUser.id && user.settings.notifications.forum) {
            notificationSystem.addNotification(
                user.id,
                'Новое объявление',
                `Опубликовано новое объявление: "${title}"`
            );
        }
    });
});

// Поиск пользователей в админке
document.getElementById('admin-search-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const users = storage.getUsers();
    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm) || 
        u.email.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role === 'admin' ? 'Админ' : 'Пользователь'}</span></td>
            <td>${user.registration_date}</td>
            <td>
                <button class="btn btn-outline" onclick="editUser(${user.id})">✏️ Редактировать</button>
                <button class="btn btn-outline" onclick="deleteUser(${user.id})">🗑️ Удалить</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
});

// НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ВКЛАДКИ ТЕГОВ
document.getElementById('generate-tags-btn').addEventListener('click', generateMetaTags);
document.getElementById('copy-tags-btn').addEventListener('click', copyTagsToClipboard);
document.getElementById('download-tags-btn').addEventListener('click', downloadTagsAsFile);

// Функции для загрузки данных

function loadUserData() {
    loadUserProjects();
    loadUserStats();
    loadProjectGroups();
    loadNotifications();
    
    // Загружаем настройки темы
    if (currentUser && currentUser.settings && currentUser.settings.theme) {
        document.documentElement.setAttribute('data-theme', currentUser.settings.theme);
        const themeIcon = document.querySelector('#theme-toggle i');
        const adminThemeIcon = document.querySelector('#admin-theme-toggle i');
        if (themeIcon) {
            themeIcon.className = currentUser.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (adminThemeIcon) {
            adminThemeIcon.className = currentUser.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Обновляем бейдж уведомлений
    notificationSystem.updateBadge(currentUser.id);
}

function loadUserProjects(searchTerm = '') {
    const projects = storage.getProjects();
    const audits = storage.getAudits();
    const userProjects = projects.filter(p => p.user_id === currentUser.id);
    
    let filteredProjects = userProjects;
    if (searchTerm) {
        filteredProjects = userProjects.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.url.toLowerCase().includes(searchTerm)
        );
    }
    
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';
    
    if (filteredProjects.length === 0) {
        projectsContainer.innerHTML = '<p>У вас пока нет проектов. Создайте первый проект на странице "Аудит".</p>';
        return;
    }
    
    filteredProjects.forEach(project => {
        const projectAudits = audits.filter(a => a.project_id === project.id);
        const lastAudit = projectAudits.length > 0 ? 
            projectAudits[projectAudits.length - 1] : null;
        
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${project.name}</h3>
                <div class="project-actions">
                    <button class="action-btn" onclick="editProject(${project.id})">✏️</button>
                    <button class="action-btn" onclick="deleteProject(${project.id})">🗑️</button>
                </div>
            </div>
            <p>URL: ${project.url}</p>
            <p>Последний аудит: ${lastAudit ? new Date(lastAudit.date).toLocaleDateString() : 'Не проводился'}</p>
            <div class="audit-results">
                ${lastAudit ? `<div class="audit-score">${lastAudit.results.overall_score}/100</div>` : ''}
            </div>
        `;
        projectsContainer.appendChild(projectCard);
    });
}

function loadForumTopics() {
    const topics = storage.getForumTopics();
    const container = document.getElementById('forum-topics-container');
    container.innerHTML = '';
    
    if (topics.length === 0) {
        container.innerHTML = '<p>Пока нет тем для обсуждения. Создайте первую тему!</p>';
        return;
    }
    
    // Сортируем темы: сначала объявления, затем по дате создания (новые сверху)
    const sortedTopics = [...topics].sort((a, b) => {
        if (a.is_announcement && !b.is_announcement) return -1;
        if (!a.is_announcement && b.is_announcement) return 1;
        return new Date(b.created_date) - new Date(a.created_date);
    });
    
    sortedTopics.forEach(topic => {
        const likesCount = forumLikes.getLikesCount(topic.id);
        const hasLiked = currentUser ? forumLikes.hasUserLiked(topic.id, currentUser.id) : false;
        const comments = forumComments.getComments(topic.id);
        const isAnnouncement = topic.is_announcement;
        
        const topicElement = document.createElement('div');
        topicElement.className = `forum-topic ${isAnnouncement ? 'announcement' : ''}`;
        topicElement.innerHTML = `
            <div class="topic-header">
                <div class="topic-title">${topic.title} ${isAnnouncement ? '<span style="color: #ff9800;">(Объявление)</span>' : ''}</div>
                <div class="topic-meta">${new Date(topic.created_date).toLocaleDateString()}</div>
            </div>
            <div class="topic-excerpt">${topic.content}</div>
            <div class="topic-actions">
                <button class="like-btn ${hasLiked ? 'liked' : ''}" onclick="toggleLike(${topic.id})" ${!currentUser ? 'disabled' : ''}>
                    <i class="fas fa-heart"></i> <span>${likesCount}</span>
                </button>
                <button class="btn btn-outline" onclick="showComments(${topic.id})">
                    <i class="fas fa-comment"></i> Комментарии (${comments.length})
                </button>
                ${currentUser && currentUser.role === 'admin' ? 
                    `<button class="btn btn-outline" onclick="deleteTopic(${topic.id})">Удалить</button>` : ''}
            </div>
            <div class="topic-meta">Автор: ${topic.username} • Ответов: ${comments.length}</div>
            <div id="comments-${topic.id}" class="comments-section" style="display: none;">
                <!-- Комментарии будут загружены динамически -->
            </div>
        `;
        container.appendChild(topicElement);
    });
}

function loadSupportHistory() {
    const complaints = storage.getComplaints();
    const userComplaints = complaints.filter(c => c.user_id === currentUser.id);
    const container = document.getElementById('support-history-container');
    container.innerHTML = '';
    
    if (userComplaints.length === 0) {
        container.innerHTML = '<p>У вас пока нет обращений в поддержку.</p>';
        return;
    }
    
    userComplaints.forEach(complaint => {
        const complaintElement = document.createElement('div');
        complaintElement.className = 'forum-topic';
        complaintElement.innerHTML = `
            <div class="topic-header">
                <div class="topic-title">${complaint.subject}</div>
                <div class="topic-meta">Статус: ${getStatusText(complaint.status)}</div>
            </div>
            <div class="topic-excerpt">${complaint.message}</div>
            <div class="topic-meta">Дата: ${complaint.created_date}</div>
        `;
        container.appendChild(complaintElement);
    });
}

function loadUserSettings() {
    document.getElementById('settings-username').value = currentUser.username;
    document.getElementById('settings-email').value = currentUser.email;
    document.getElementById('notify-audit').checked = currentUser.settings.notifications.audit;
    document.getElementById('notify-forum').checked = currentUser.settings.notifications.forum;
    document.getElementById('notify-support').checked = currentUser.settings.notifications.support;
}

function loadUserStats() {
    if (!currentUser) return;
    
    const projects = storage.getProjects();
    const audits = storage.getAudits();
    const userProjects = projects.filter(p => p.user_id === currentUser.id);
    const userAudits = audits.filter(a => a.user_id === currentUser.id);
    
    // Общее количество проектов
    document.getElementById('total-projects').textContent = userProjects.length;
    
    // Количество аудитов за последний месяц
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const recentAudits = userAudits.filter(a => new Date(a.date) > lastMonth);
    document.getElementById('total-audits').textContent = recentAudits.length;
    
    // Средний балл
    const avgScore = userAudits.length > 0 ? 
        userAudits.reduce((sum, a) => sum + a.results.overall_score, 0) / userAudits.length : 0;
    document.getElementById('avg-score').textContent = avgScore.toFixed(1);
    
    // Рейтинг пользователя
    const rank = ratingSystem.calculateUserRank(currentUser.id);
    document.getElementById('user-rank').textContent = `#${rank}`;
    
    // Значение рейтинга
    document.getElementById('user-rating-value').textContent = 
        ratingSystem.getRating(currentUser.id).toFixed(1);
}

function loadProjectGroups() {
    if (!currentUser) return;
    
    const userGroups = projectGroups.getUserGroups(currentUser.id);
    const container = document.getElementById('groups-container');
    container.innerHTML = '';
    
    if (userGroups.length === 0) {
        container.innerHTML = '<p>У вас пока нет групп проектов. Создайте первую группу!</p>';
        return;
    }
    
    userGroups.forEach(group => {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `
            <div class="group-header">
                <h3>${group.name}</h3>
                <div class="project-actions">
                    <button class="action-btn" onclick="editGroup(${group.id})">✏️</button>
                    <button class="action-btn" onclick="deleteGroup(${group.id})">🗑️</button>
                </div>
            </div>
            <p>${group.description}</p>
            <div class="group-projects" id="group-projects-${group.id}">
                <!-- Проекты группы будут загружены отдельно -->
            </div>
        `;
        container.appendChild(groupCard);
        
        // Загружаем проекты для этой группы
        loadGroupProjects(group.id);
    });
}

function loadGroupProjects(groupId) {
    const groups = storage.getProjectGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const projects = storage.getProjects();
    const groupProjects = projects.filter(p => group.projectIds.includes(p.id));
    const container = document.getElementById(`group-projects-${groupId}`);

    if (groupProjects.length === 0) {
        container.innerHTML = '<p>В этой группе пока нет проектов</p>';
        return;
    }

    container.innerHTML = '';
    groupProjects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-card';
        projectElement.innerHTML = `
            <div class="project-header">
                <h4 class="project-title">${project.name}</h4>
            </div>
            <p>${project.url}</p>
        `;
        // Добавляем обработчик клика для открытия статистики проекта
        projectElement.addEventListener('click', () => showProjectStats(project.id));
        container.appendChild(projectElement);
    });
}

function loadNotifications() {
    if (!currentUser) return;
    
    const notifications = notificationSystem.getUserNotifications(currentUser.id);
    const panel = document.getElementById('notifications-panel');
    const adminPanel = document.getElementById('admin-notifications-panel');
    panel.innerHTML = '';
    
    if (notifications.length === 0) {
        panel.innerHTML = '<div class="notification-item">У вас нет уведомлений</div>';
        if (adminPanel) adminPanel.innerHTML = '<div class="notification-item">У вас нет уведомлений</div>';
        return;
    }
    
    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.isRead ? '' : 'unread'}`;
        notificationElement.innerHTML = `
            <strong>${notification.title}</strong>
            <p>${notification.message}</p>
            <small>${new Date(notification.timestamp).toLocaleString()}</small>
        `;
        notificationElement.addEventListener('click', () => {
            notificationSystem.markAsRead(notification.id);
            loadNotifications();
        });
        panel.appendChild(notificationElement);
        
        if (adminPanel) {
            const adminNotificationElement = notificationElement.cloneNode(true);
            adminPanel.appendChild(adminNotificationElement);
        }
    });
}

function loadSupportChat() {
    if (!currentUser) return;
    
    const messages = supportChat.getUserMessages(currentUser.id);
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${msg.isSupport ? 'message-support' : 'message-user'}`;
        messageElement.innerHTML = `
            <p>${msg.message}</p>
            <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
        `;
        container.appendChild(messageElement);
    });
    
    // Прокручиваем вниз
    container.scrollTop = container.scrollHeight;
}

function loadAdminData() {
    loadAdminUsers();
    loadAdminForum();
    loadAdminComplaints();
    loadNotifications();
    
    // Загружаем настройки темы
    if (currentUser && currentUser.settings && currentUser.settings.theme) {
        document.documentElement.setAttribute('data-theme', currentUser.settings.theme);
        const themeIcon = document.querySelector('#admin-theme-toggle i');
        if (themeIcon) {
            themeIcon.className = currentUser.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Обновляем бейдж уведомлений
    notificationSystem.updateBadge(currentUser.id);
}

function loadAdminUsers() {
    const users = storage.getUsers();
    const projects = storage.getProjects();
    const audits = storage.getAudits();
    
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const userProjects = projects.filter(p => p.user_id === user.id);
        const userAudits = audits.filter(a => a.user_id === user.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">${user.role === 'admin' ? 'Админ' : 'Пользователь'}</span></td>
            <td>${user.registration_date}</td>
            <td>
                <button class="btn btn-outline" onclick="editUser(${user.id})">✏️ Редактировать</button>
                <button class="btn btn-outline" onclick="deleteUser(${user.id})">🗑️ Удалить</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Обновляем статистику
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('active-today').textContent = users.length; // Упрощенная логика
    document.getElementById('total-audits-admin').textContent = audits.length;
}

function loadAdminForum() {
    const topics = storage.getForumTopics();
    const container = document.getElementById('admin-forum-topics-container');
    container.innerHTML = '';
    
    topics.forEach(topic => {
        const isAnnouncement = topic.is_announcement;
        const topicElement = document.createElement('div');
        topicElement.className = `forum-topic ${isAnnouncement ? 'announcement' : ''}`;
        topicElement.innerHTML = `
            <div class="topic-header">
                <div class="topic-title">${topic.title} ${isAnnouncement ? '<span style="color: #ff9800;">(Объявление)</span>' : ''}</div>
                <div class="topic-meta">${new Date(topic.created_date).toLocaleDateString()}</div>
            </div>
            <div class="topic-excerpt">${topic.content}</div>
            <div class="topic-actions">
                <button class="btn btn-outline" onclick="deleteTopic(${topic.id})">Удалить тему</button>
                ${!isAnnouncement ? `<button class="btn btn-outline" onclick="makeAnnouncement(${topic.id})">Сделать объявлением</button>` : ''}
            </div>
            <div class="topic-meta">Автор: ${topic.username}</div>
        `;
        container.appendChild(topicElement);
    });
}

function loadAdminComplaints() {
    const complaints = storage.getComplaints();
    const tableBody = document.getElementById('complaints-table-body');
    tableBody.innerHTML = '';
    
    complaints.forEach(complaint => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${complaint.id}</td>
            <td>${complaint.username}</td>
            <td>${complaint.subject}</td>
            <td><span class="result-status ${getStatusClass(complaint.status)}">${getStatusText(complaint.status)}</span></td>
            <td>${complaint.created_date}</td>
            <td>
                <button class="btn btn-outline" onclick="markComplaintResolved(${complaint.id})">✅ Отметить решенным</button>
                <button class="btn btn-outline" onclick="replyToComplaint(${complaint.id})">📧 Ответить</button>
                <button class="btn btn-outline" onclick="deleteComplaint(${complaint.id})">🗑️ Удалить</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Вспомогательные функции

function setActiveNav(activeNav) {
    document.querySelectorAll('.sidebar-nav a').forEach(nav => {
        nav.classList.remove('active');
    });
    activeNav.classList.add('active');
}

function showSection(section) {
    document.querySelectorAll('.dashboard-section').forEach(sec => {
        sec.style.display = 'none';
    });
    section.style.display = 'block';
}

function showAdminSection(section) {
    document.querySelectorAll('#admin-dashboard .dashboard-section').forEach(sec => {
        sec.style.display = 'none';
    });
    section.style.display = 'block';
}

function showAuditResults(url) {
    const results = generateAuditResults();
    const resultsContent = document.getElementById('audit-results-content');
    
    let html = `
        <div class="audit-score">${results.overall_score}/100</div>
        <div class="result-category">
            <h3>Мета-теги</h3>
    `;
    
    results.meta_tags.forEach(tag => {
        html += `
            <div class="result-item">
                <span>${tag.name}</span>
                <span class="result-status ${getStatusClass(tag.status)}">${getStatusText(tag.status)}</span>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="result-category">
            <h3>Производительность</h3>
    `;
    
    results.performance.forEach(perf => {
        html += `
            <div class="result-item">
                <span>${perf.name}</span>
                <span class="result-status ${getStatusClass(perf.status)}">${getStatusText(perf.status)}</span>
            </div>
        `;
    });
    
    html += `
        </div>
        <div class="result-category">
            <h3>SEO</h3>
    `;
    
    results.seo.forEach(seoItem => {
        html += `
            <div class="result-item">
                <span>${seoItem.name}</span>
                <span class="result-status ${getStatusClass(seoItem.status)}">${getStatusText(seoItem.status)}</span>
            </div>
        `;
    });
    
    html += `</div>`;
    resultsContent.innerHTML = html;
}

function generateAuditResults() {
    return {
        overall_score: Math.floor(Math.random() * 30) + 70, // 70-100
        meta_tags: [
            { name: 'Title тег', status: 'success' },
            { name: 'Meta description', status: Math.random() > 0.5 ? 'success' : 'warning' },
            { name: 'Open Graph теги', status: Math.random() > 0.7 ? 'success' : 'error' },
            { name: 'Canonical тег', status: Math.random() > 0.6 ? 'success' : 'error' }
        ],
        performance: [
            { name: 'Скорость загрузки', status: Math.random() > 0.3 ? 'success' : 'warning' },
            { name: 'Оптимизация изображений', status: Math.random() > 0.5 ? 'success' : 'warning' },
            { name: 'Кэширование', status: Math.random() > 0.4 ? 'success' : 'error' }
        ],
        seo: [
            { name: 'Структура заголовков', status: 'success' },
            { name: 'Атрибуты alt у изображений', status: Math.random() > 0.5 ? 'success' : 'error' },
            { name: 'Внутренние ссылки', status: Math.random() > 0.6 ? 'success' : 'warning' },
            { name: 'Мобильная адаптация', status: 'success' }
        ]
    };
}

function getStatusClass(status) {
    switch(status) {
        case 'success': return 'status-success';
        case 'warning': return 'status-warning';
        case 'error': return 'status-error';
        case 'open': return 'status-warning';
        case 'resolved': return 'status-success';
        default: return 'status-warning';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'success': return 'Оптимизирован';
        case 'warning': return 'Требует улучшения';
        case 'error': return 'Проблема';
        case 'open': return 'Открыто';
        case 'resolved': return 'Решено';
        default: return status;
    }
}

// Глобальные функции для HTML
window.editProject = function(projectId) {
    const projects = storage.getProjects();
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newName = prompt('Введите новое название проекта:', project.name);
    if (!newName) return;
    
    const newUrl = prompt('Введите новый URL проекта:', project.url);
    if (!newUrl) return;
    
    project.name = newName;
    project.url = newUrl;
    storage.saveProjects(projects);
    loadUserProjects();
    alert('Проект успешно обновлен!');
};

window.deleteProject = function(projectId) {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
        const projects = storage.getProjects();
        const updatedProjects = projects.filter(p => p.id !== projectId);
        storage.saveProjects(updatedProjects);
        loadUserProjects();
        alert('Проект успешно удален');
    }
};

window.editGroup = function(groupId) {
    const groups = storage.getProjectGroups();
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    const newName = prompt('Введите новое название группы:', group.name);
    if (!newName) return;
    
    const newDescription = prompt('Введите новое описание группы:', group.description) || '';
    
    group.name = newName;
    group.description = newDescription;
    storage.saveProjectGroups(groups);
    loadProjectGroups();
};

window.deleteGroup = function(groupId) {
    if (confirm('Вы уверены, что хотите удалить эту группу? Проекты не будут удалены.')) {
        projectGroups.deleteGroup(groupId);
        loadProjectGroups();
        notificationSystem.addNotification(
            currentUser.id,
            'Группа удалена',
            'Группа проектов была удалена'
        );
    }
};

window.toggleLike = function(topicId) {
    const likesCount = forumLikes.toggleLike(topicId, currentUser.id);
    loadForumTopics();
};

window.showComments = function(topicId) {
    const commentsSection = document.getElementById(`comments-${topicId}`);
    const isVisible = commentsSection.style.display === 'block';
    
    // Скрываем все комментарии
    document.querySelectorAll('.comments-section').forEach(section => {
        section.style.display = 'none';
    });
    
    if (!isVisible) {
        commentsSection.style.display = 'block';
        loadComments(topicId);
    }
};

function loadComments(topicId) {
    const comments = forumComments.getComments(topicId);
    const commentsSection = document.getElementById(`comments-${topicId}`);
    let commentsHTML = '';
    
    if (comments.length === 0) {
        commentsHTML = '<p>Пока нет комментариев. Будьте первым!</p>';
    } else {
        comments.forEach(comment => {
            commentsHTML += `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">${comment.username}</span>
                        <span class="comment-date">${new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                    <p>${comment.content}</p>
                    ${currentUser.role === 'admin' ? `<button class="btn btn-outline" onclick="deleteComment(${topicId}, ${comment.id})">Удалить</button>` : ''}
                </div>
            `;
        });
    }
    
    commentsHTML += `
        <div class="comment-form">
            <textarea id="comment-${topicId}" placeholder="Оставьте комментарий..."></textarea>
            <button class="btn" onclick="addComment(${topicId})">Отправить</button>
        </div>
    `;
    
    commentsSection.innerHTML = commentsHTML;
}

window.addComment = function(topicId) {
    const commentInput = document.getElementById(`comment-${topicId}`);
    const content = commentInput.value.trim();
    
    if (!content) {
        alert('Пожалуйста, введите комментарий');
        return;
    }
    
    forumComments.addComment(topicId, currentUser.id, currentUser.username, content);
    commentInput.value = '';
    loadComments(topicId);
    loadForumTopics();
    
    // Добавляем уведомление автору темы
    const topics = storage.getForumTopics();
    const topic = topics.find(t => t.id === topicId);
    if (topic && topic.user_id !== currentUser.id) {
        notificationSystem.addNotification(
            topic.user_id,
            'Новый комментарий',
            `Пользователь ${currentUser.username} оставил комментарий к вашей теме "${topic.title}"`
        );
    }
    
    // Также добавим уведомление другим пользователям, которые комментировали эту тему
    const comments = forumComments.getComments(topicId);
    const commenters = new Set();
    comments.forEach(comment => {
        if (comment.userId !== currentUser.id && comment.userId !== topic.user_id) {
            commenters.add(comment.userId);
        }
    });
    
    commenters.forEach(userId => {
        notificationSystem.addNotification(
            userId,
            'Новый комментарий',
            `К теме "${topic.title}" добавлен новый комментарий`
        );
    });
};

window.deleteComment = function(topicId, commentId) {
    if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
        forumComments.deleteComment(topicId, commentId);
        loadComments(topicId);
        loadForumTopics();
    }
};

window.deleteTopic = function(topicId) {
    if (confirm('Вы уверены, что хотите удалить эту тему?')) {
        const topics = storage.getForumTopics();
        const updatedTopics = topics.filter(t => t.id !== topicId);
        storage.saveForumTopics(updatedTopics);
        
        // Удаляем комментарии к теме
        const comments = storage.getForumComments();
        delete comments[topicId];
        storage.saveForumComments(comments);
        
        if (currentUser.role === 'admin') {
            loadAdminForum();
        } else {
            loadForumTopics();
        }
        
        alert('Тема успешно удалена');
    }
};

window.makeAnnouncement = function(topicId) {
    const topics = storage.getForumTopics();
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
        topic.is_announcement = true;
        storage.saveForumTopics(topics);
        loadAdminForum();
        alert('Тема теперь отображается как объявление');
        
        // Добавляем уведомление автору темы
        notificationSystem.addNotification(
            topic.user_id,
            'Тема выделена',
            `Ваша тема "${topic.title}" была выделена администратором как объявление`
        );
    }
};

window.editUser = function(userId) {
    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newUsername = prompt('Введите новое имя пользователя:', user.username);
    if (!newUsername) return;
    
    const newEmail = prompt('Введите новый email:', user.email);
    if (!newEmail) return;
    
    const newRole = confirm('Сделать пользователя администратором?') ? 'admin' : 'user';
    
    user.username = newUsername;
    user.email = newEmail;
    user.role = newRole;
    storage.saveUsers(users);
    loadAdminUsers();
    alert('Пользователь успешно обновлен!');
};

window.deleteUser = function(userId) {
    if (userId === 1) {
        alert('Нельзя удалить администратора по умолчанию');
        return;
    }
    
    if (confirm('Вы уверены, что хотите удалить этого пользователя? Все его проекты и данные будут удалены.')) {
        const users = storage.getUsers();
        const updatedUsers = users.filter(u => u.id !== userId);
        
        // Удаляем проекты пользователя
        const projects = storage.getProjects();
        const updatedProjects = projects.filter(p => p.user_id !== userId);
        
        // Удаляем аудиты пользователя
        const audits = storage.getAudits();
        const updatedAudits = audits.filter(a => a.user_id !== userId);
        
        storage.saveUsers(updatedUsers);
        storage.saveProjects(updatedProjects);
        storage.saveAudits(updatedAudits);
        
        loadAdminUsers();
        alert('Пользователь успешно удален');
    }
};

window.markComplaintResolved = function(complaintId) {
    const complaints = storage.getComplaints();
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        complaint.status = 'resolved';
        storage.saveComplaints(complaints);
        loadAdminComplaints();
        alert('Жалоба отмечена как решенная');
        
        // Уведомление пользователю
        notificationSystem.addNotification(
            complaint.user_id,
            'Жалоба решена',
            `Ваша жалоба "${complaint.subject}" была решена администратором`
        );
    }
};

window.replyToComplaint = function(complaintId) {
    const complaints = storage.getComplaints();
    const complaint = complaints.find(c => c.id === complaintId);
    if (complaint) {
        const reply = prompt('Введите ответ на жалобу:');
        if (reply) {
            // Добавляем ответ в чат поддержки
            supportChat.sendMessage(complaint.user_id, reply, true);
            
            // Отмечаем как отвеченную
            complaint.status = 'resolved';
            storage.saveComplaints(complaints);
            loadAdminComplaints();
            
            alert('Ответ отправлен пользователю');
            
            // Уведомление пользователю
            notificationSystem.addNotification(
                complaint.user_id,
                'Ответ на вашу жалобу',
                `Администратор ответил на вашу жалобу: "${complaint.subject}"`
            );
        }
    }
};

window.deleteComplaint = function(complaintId) {
    if (confirm('Вы уверены, что хотите удалить эту жалобу?')) {
        const complaints = storage.getComplaints();
        const updatedComplaints = complaints.filter(c => c.id !== complaintId);
        storage.saveComplaints(updatedComplaints);
        loadAdminComplaints();
        alert('Жалоба успешно удалена');
    }
};

// После загрузки DOM добавляем обработчики событий
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    
    // Переключение темы
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('admin-theme-toggle').addEventListener('click', toggleTheme);
    
    // Уведомления
    document.getElementById('notification-bell').addEventListener('click', function(e) {
        e.stopPropagation();
        const panel = document.getElementById('notifications-panel');
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });

    document.getElementById('admin-notification-bell').addEventListener('click', function(e) {
        e.stopPropagation();
        const panel = document.getElementById('admin-notifications-panel');
        panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });
    
    // Закрытие панели уведомлений при клике вне ее
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.notifications-panel') && !e.target.closest('.notification-bell')) {
            document.getElementById('notifications-panel').style.display = 'none';
            document.getElementById('admin-notifications-panel').style.display = 'none';
        }
    });
    
    // Отправка сообщения в поддержку по Enter
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('send-chat-btn').click();
        }
    });
    
    // Инициализация автодополнения проектов
    if (projectAutocomplete) {
        let allProjects = [];
        
        projectAutocomplete.addEventListener('focus', () => {
            allProjects = loadProjectAutocomplete();
        });
        
        projectAutocomplete.addEventListener('input', () => {
            allProjects = loadProjectAutocomplete();
            showAutocompleteSuggestions(projectAutocomplete, allProjects);
        });
        
        projectAutocomplete.addEventListener('blur', () => {
            // Небольшая задержка для возможности клика по подсказке
            setTimeout(() => {
                document.getElementById('autocomplete-suggestions').style.display = 'none';
            }, 200);
        });
        
        // Обработка клавиш для навигации по подсказкам
        projectAutocomplete.addEventListener('keydown', (e) => {
            const suggestions = document.querySelectorAll('.autocomplete-suggestion');
            const highlighted = document.querySelector('.autocomplete-suggestion.highlighted');
            let index = Array.from(suggestions).indexOf(highlighted);
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                index = (index + 1) % suggestions.length;
                updateHighlightedSuggestion(suggestions, index);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                index = (index - 1 + suggestions.length) % suggestions.length;
                updateHighlightedSuggestion(suggestions, index);
            } else if (e.key === 'Enter' && highlighted) {
                e.preventDefault();
                projectAutocomplete.value = highlighted.textContent;
                document.getElementById('autocomplete-suggestions').style.display = 'none';
            }
        });
    }
    
    // Восстановление состояния приложения при загрузке
    const savedUser = localStorage.getItem('metagenius_current_user');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        const users = storage.getUsers();
        const user = users.find(u => u.id === userData.id && u.email === userData.email);
        if (user) {
            currentUser = user;
            if (user.role === 'admin') {
                homePage.style.display = 'none';
                adminDashboard.style.display = 'block';
                document.getElementById('admin-avatar').textContent = user.username.charAt(0).toUpperCase();
                loadAdminData();
                restoreAppState();
            } else {
                homePage.style.display = 'none';
                userDashboard.style.display = 'block';
                userAvatar.textContent = user.username.charAt(0).toUpperCase();
                usernameDisplay.textContent = user.username;
                loadUserData();
                restoreAppState();
            }
        }
    }
});