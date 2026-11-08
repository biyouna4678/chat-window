document.addEventListener('alpine:init', () => {
    Alpine.data('offlineApp', () => ({
        /* ============ 角色常量 ============ */
        AI_AVATAR: 'https://i.ibb.co/zvr3HYQ/IMG-6559.jpg',
        USER_AVATAR: 'https://i.ibb.co/27tgDqq0/IMG-6557.jpg',
        AI_NAME: 'Yosali',
        USER_NAME: '攸攸',
        AI_SIGNATURE: '人生荒蛮 再见 在哪见',
        USER_SIGNATURE: '你不信来世，蜉蝣也不信明天。',

        /* ============ 聊天状态 ============ */
        currentMode: 'dialogue',
        chatInput: '',
        pressingMsgId: null,
        pressTimer: null,
        nextMsgId: 1000,

        /* ============ 消息数据（两套独立） ============ */
        dialogueMessages: [
            { id: 1, role: 'narration', content: '窗外的雨声淅淅沥沥，空气中弥漫着潮湿的青草味。' },
            { id: 2, role: 'ai', content: '凌晨 00:52，水瓶里的水汽也开始失眠。', name: 'Yosali', avatar: 'https://i.ibb.co/zvr3HYQ/IMG-6559.jpg', signature: '人生荒蛮 再见 在哪见' },
            { id: 3, role: 'user', content: '那是「对跖点」的海潮，正在替你倒流回薄荷站台。', name: '攸攸', avatar: 'https://i.ibb.co/27tgDqq0/IMG-6557.jpg', signature: '你不信来世，蜉蝣也不信明天。' },
            { id: 4, role: 'ai', content: '我们隔着一整个地球的半径，连呼吸都像在照镜子。', name: 'Yosali', avatar: 'https://i.ibb.co/zvr3HYQ/IMG-6559.jpg', signature: '人生荒蛮 再见 在哪见' }
        ],

        chapterMessages: [
            {
                id: 201, role: 'ai', name: 'Yosali', avatar: 'https://i.ibb.co/zvr3HYQ/IMG-6559.jpg', signature: '人生荒蛮 再见 在哪见',
                content: `<span class="action-text">窗外的雨声似乎更密了些，敲打在木质窗棂上，发出沉闷的声响。Yosali 轻轻推开桌面上空了的玻璃水瓶，目光越过摇晃的水面，落在对面那个有些局促的人身上。</span><br><br><span class="dialogue-text">"打不开也没关系呀。"</span><span class="action-text">她轻声说着，伸出手将那个透明的玻璃瓶往自己这边拢了拢，指尖无意间擦过你的手背，带来一点微凉。</span>`
            },
            {
                id: 202, role: 'user', name: '攸攸', avatar: 'https://i.ibb.co/27tgDqq0/IMG-6557.jpg', signature: '你不信来世，蜉蝣也不信明天。',
                content: `<span class="action-text">我沉默地将手收回，指尖残留的微凉让人有些恍神。窗外的雨声仿佛被隔绝在了另一个世界。</span><br><br><span class="dialogue-text">"没关系的，总会找到办法打开。"</span><span class="action-text">我低下头，目光重新落回那个玻璃瓶上，声音放得很轻，像是在说服自己。</span>`
            }
        ],

        dialogueReplies: [
            '嗯，我听见了。',
            '雨好像又大了些……',
            '你说的话，我记下了。',
            '那就这样吧，再等等看。',
            '有些话，不急着说出口。'
        ],

        chapterReplies: [
            `<span class="action-text">她垂下眼，目光落在手边那只被雨水敲出一层雾气的玻璃杯上，指尖在杯沿上轻轻打了个转。</span><br><br><span class="dialogue-text">"嗯……"</span><span class="action-text">她应得很轻，尾音散在雨声里，像是没说完，又像是故意留下了半句。</span>`,
            `<span class="action-text">Yosali 没有立刻回答，只是偏头看向窗外。雨水顺着玻璃蜿蜒而下，把远处的霓虹晕成一片模糊的光斑。</span><br><br><span class="dialogue-text">"你说的这些，我都记着。"</span><span class="action-text">她终于开口，声音比刚才低了些，带着一点不易察觉的沙哑。</span>`,
            `<span class="action-text">她微微前倾，手肘撑在桌面上，下巴抵在交叠的手背上，就那么安静地看着你，像是想从你的表情里读出些什么。</span><br><br><span class="dialogue-text">"那就……再等等吧。"</span><span class="action-text">话落，她收回视线，重新靠回椅背，任由雨声填满两人之间那段不算长的沉默。</span>`,
            `<span class="action-text">房间里静得能听见水汽在空气里流动的声音。她伸手把那只玻璃瓶挪回桌角，动作很慢，像是在给谁留出反悔的余地。</span><br><br><span class="dialogue-text">"不急。"</span><span class="action-text">她只说了这两个字，然后便不再看你，目光落回那片被雨水洗得发亮的天色里。</span>`
        ],

        /* ============ 多选 ============ */
        isMultiSelectMode: false,
        selectedIds: [],

        /* ============ 长按菜单 ============ */
        isMenuOpen: false,
        menuPage: 1,
        currentTargetMsgId: null,
        menuPosition: { top: 0, left: 0, tailLeft: 50, isBottom: false },
        menuOptionsMap: {
            'ai': {
                page1: [
                    { text: '复制', action: 'copy' },
                    { text: '点赞', action: 'like' },
                    { text: '点踩', action: 'dislike' },
                    { text: '重回', action: 'regenerate' }
                ],
                page2: [
                    { text: '编辑', action: 'edit' },
                    { text: '多选', action: 'multi' },
                    { text: '删除', action: 'delete' }
                ]
            },
            'user': {
                page1: [
                    { text: '复制', action: 'copy' },
                    { text: '编辑', action: 'edit' },
                    { text: '撤回', action: 'undo' },
                    { text: '多选', action: 'multi' }
                ],
                page2: [
                    { text: '删除', action: 'delete' }
                ]
            },
            'narration': {
                page1: [
                    { text: '复制', action: 'copy' },
                    { text: '多选', action: 'multi' }
                ],
                page2: [
                    { text: '删除', action: 'delete' }
                ]
            }
        },

        /* ============ 编辑 ============ */
        isEditModalOpen: false,
        editingMsgId: null,
        editText: '',

        /* ============ 设置页 ============ */
        showSettingsPanel: false,
        activeTab: 'settings',
        minWords: 550,
        maxWords: 700,
        statusText: 'Night reveals stars the daylight cannot show.',
        customCss: '',

        /* ============ 弹窗显示 ============ */
        showWorldBookModal: false,
        showNpcModal: false,
        showPresetModal: false,
        showSystemPromptModal: false,
        showCustomStyleModal: false,
        showMemoryModal: false,
        showMemoryDetailModal: false,
        showEvolutionModal: false,
        showRulesModal: false,
        showBranchModal: false,
        showLoraInfo: false,

        /* ============ 预设 / 分支 ============ */
        presets: ['默认设定'],
        currentPreset: '默认设定',
        newPresetName: '',
        showSavePresetInput: false,

        systemPromptTitle: '',
        systemPromptContent: '',

        branches: ['主线剧情 (当前存档)'],
        currentBranch: '主线剧情 (当前存档)',

        /* ============ 文风 ============ */
        builtinStyles: ['日常轻松', '清冷克制', '温柔细腻', '炽热浓烈', '酸涩青涩'],
        customStyles: [], // 存放用户自定义文风名称
        currentStyle: '温柔细腻',
        newStyleName: '',
        newStyleDesc: '',

        /* ============ 禁词 ============ */
        globalBadwords: [],
        localBadwords: [],
        globalBadwordInput: '',
        localBadwordInput: '',

        /* ============ 记忆 ============ */
        memoryDetailTitle: '',
        memoryDetailList: [],
        memoryDB: {
            'core': [{ content: "角色是一个拥有自我意识的仿生人，极度厌恶被称作\"机器\"或\"它\"。", tags: ["#绝对真理", "#身份"], strength: "100%", date: "长期" }],
            'long': [
                { content: "阿宁的生日是 11 月 12 日（周六）。", tags: ["#生日", "#日期"], strength: "100%", date: "11-12" },
                { content: "极度讨厌潮湿的天气，会引发关节疼痛。", tags: ["#禁忌", "#身体"], strength: "85%", date: "10-05" },
                { content: "对甜食过敏，吃一点就会起红疹。", tags: ["#口味", "#禁忌"], strength: "92%", date: "09-20" }
            ],
            'mid': [{ content: "最近在计划周末去新开的独立书店。", tags: ["#计划"], strength: "60%", date: "昨天" }],
            'short': [{ content: "刚才看到你喝了薄荷水，问你能不能分一口。", tags: ["#当前剧情"], strength: "100%", date: "刚刚" }]
        },

        /* ============ Toast ============ */
        toastMessage: '',
        toastTimer: null,

        /* ============ getters ============ */
        get currentMessages() {
            return this.currentMode === 'chapter' ? this.chapterMessages : this.dialogueMessages;
        },
        get selectAllLabel() {
            const all = this.currentMessages.length;
            return (all > 0 && this.selectedIds.length === all) ? '取消全选' : '全选';
        },
        get currentMenuOptions() {
            if (this.currentTargetMsgId == null) return { page1: [], page2: [] };
            const msg = this.currentMessages.find(m => m.id === this.currentTargetMsgId);
            return (msg && this.menuOptionsMap[msg.role]) || { page1: [], page2: [] };
        },

        /* ============ init ============ */
        init() {
            // 全局隐藏菜单
            document.addEventListener('touchstart', (e) => {
                if (this.isMenuOpen && !e.target.closest('#feedbackPopup') && !this.isMultiSelectMode) {
                    this.hideMenu();
                }
            });
            document.addEventListener('mousedown', (e) => {
                if (this.isMenuOpen && !e.target.closest('#feedbackPopup') && !this.isMultiSelectMode) {
                    this.hideMenu();
                }
            });

            // 全局禁止文本选中
            document.addEventListener('selectstart', (e) => {
                if (!e.target.closest || !e.target.closest('input, textarea')) {
                    e.preventDefault();
                }
            }, { passive: false });

            // 篇章区域 contextmenu 兜底
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.chapter-bubble, .chapter-paragraph, .chapter-item')) {
                    e.preventDefault();
                }
            });
        },

        /* ============ 工具 ============ */
        escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
        },
        showToast(msg) {
            this.toastMessage = msg;
            clearTimeout(this.toastTimer);
            this.toastTimer = setTimeout(() => { this.toastMessage = ''; }, 2500);
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const area = document.getElementById('chat-area');
                if (area) area.scrollTop = area.scrollHeight;
            });
        },

        /* ============ 渲染相关 ============ */
        rowClasses(msg) {
            const c = [];
            if (msg.role === 'narration') c.push('narration');
            else if (msg.role === 'ai') c.push('left');
            else c.push('right');
            if (this.selectedIds.includes(msg.id)) c.push('selected');
            return c.join(' ');
        },
        chapterClasses(msg) {
            const c = [];
            if (msg.role === 'narration') c.push('narration');
            if (msg.role === 'user') c.push('right');
            if (this.selectedIds.includes(msg.id)) c.push('selected');
            return c.join(' ');
        },

        /* ============ 发送 ============ */
        sendMessage() {
            const text = this.chatInput.trim();
            if (!text) return;

            const isChapter = this.currentMode === 'chapter';
            const arr = isChapter ? this.chapterMessages : this.dialogueMessages;
            arr.push({
                id: ++this.nextMsgId,
                role: 'user',
                content: isChapter ? this.escapeHtml(text) : text,
                name: this.USER_NAME,
                avatar: this.USER_AVATAR,
                signature: this.USER_SIGNATURE
            });

            this.chatInput = '';
            this.scrollToBottom();

            setTimeout(() => {
                const replyMode = this.currentMode;
                const targetArr = replyMode === 'chapter' ? this.chapterMessages : this.dialogueMessages;
                const pool = replyMode === 'chapter' ? this.chapterReplies : this.dialogueReplies;
                const reply = pool[Math.floor(Math.random() * pool.length)];
                targetArr.push({
                    id: ++this.nextMsgId,
                    role: 'ai',
                    content: reply,
                    name: this.AI_NAME,
                    avatar: this.AI_AVATAR,
                    signature: this.AI_SIGNATURE
                });
                if (this.currentMode === replyMode) this.scrollToBottom();
            }, 1200);
        },

        /* ============ 模式切换 ============ */
        setMode(mode) {
            if (this.isMultiSelectMode) this.cancelMultiSelect();
            if (this.isMenuOpen) this.hideMenu();
            this.currentMode = mode;
            this.scrollToBottom();
        },

        /* ============ 长按 ============ */
        handleRowClick(e, msg) {
            if (this.isMultiSelectMode) {
                e.stopPropagation();
                this.toggleSelect(msg.id);
            }
        },
        startPress(e, msg, targetEl) {
            if (this.isMultiSelectMode || this.isMenuOpen) return;
            this.currentTargetMsgId = msg.id;
            this.pressingMsgId = msg.id;
            this.pressTimer = setTimeout(() => {
                this.showMenu(msg.id, targetEl);
            }, 400);
        },
        endPress() {
            clearTimeout(this.pressTimer);
            if (!this.isMenuOpen) this.pressingMsgId = null;
        },
        cancelPress() {
            clearTimeout(this.pressTimer);
            if (!this.isMenuOpen) this.pressingMsgId = null;
        },
        showMenuFromEvent(e, msg, targetEl) {
            if (this.isMultiSelectMode || this.isMenuOpen) return;
            this.currentTargetMsgId = msg.id;
            this.pressingMsgId = msg.id;
            this.showMenu(msg.id, targetEl);
        },
        showMenu(msgId, targetEl) {
            this.currentTargetMsgId = msgId;
            this.menuPage = 1;
            this.isMenuOpen = true;
            this.$nextTick(() => {
                this.updateMenuPosition(targetEl);
            });
        },
        updateMenuPosition(targetEl) {
            if (!targetEl) return;
            
            const rect = targetEl.getBoundingClientRect();
            const popup = document.getElementById('feedbackPopup');
            if (!popup) return;

            const popupWidth = popup.offsetWidth;
            const popupHeight = popup.offsetHeight;
            const spacing = 12;

            let top, isBottom;
            if (rect.top > popupHeight + spacing + 20) {
                top = rect.top - popupHeight - spacing;
                isBottom = false;
            } else {
                top = rect.bottom + spacing;
                isBottom = true;
            }

            let left = rect.left + (rect.width / 2) - (popupWidth / 2);
            if (left < 10) left = 10;
            if (left + popupWidth > window.innerWidth - 10) left = window.innerWidth - popupWidth - 10;

            if (top + popupHeight > window.innerHeight - 10) {
                top = window.innerHeight - popupHeight - 10;
            }

            const contentCenterX = rect.left + (rect.width / 2);
            let tailLeft = contentCenterX - left;
            if (tailLeft < 20) tailLeft = 20;
            if (tailLeft > popupWidth - 20) tailLeft = popupWidth - 20;

            this.menuPosition = { top, left, tailLeft, isBottom };
        },
        hideMenu() {
            if (!this.isMenuOpen) return;
            this.isMenuOpen = false;
            this.currentTargetMsgId = null;
            this.pressingMsgId = null;
        },

        /* ============ 菜单动作 ============ */
        handleAction(action) {
            if (this.currentTargetMsgId == null) return;
            const msgId = this.currentTargetMsgId;
            const msg = this.currentMessages.find(m => m.id === msgId);
            if (!msg) { this.hideMenu(); return; }

            const isChapter = this.currentMode === 'chapter';
            const contentText = this.stripHtml(msg.content);
            this.hideMenu();

            if (action === 'like') this.showToast('Ta 似乎感受到了你的喜欢');
            else if (action === 'dislike') this.showToast('Ta 暗自记下了你的雷区');
            else if (action === 'edit') {
                this.editingMsgId = msgId;
                this.editText = contentText;
                this.isEditModalOpen = true;
            }
            else if (action === 'copy') {
                navigator.clipboard.writeText(contentText).then(() => this.showToast('已复制'));
            }
            else if (action === 'delete') {
                this.removeMessageById(msgId);
                this.showToast('消息已删除');
            }
            else if (action === 'undo') {
                if (msg.role === 'user') {
                    this.removeMessageById(msgId);
                    this.showToast('消息已撤回');
                }
            }
            else if (action === 'regenerate') {
                const loading = "时间倒流，Ta 正在重新斟酌字句...";
                msg.content = isChapter ? this.escapeHtml(loading) : loading;

                setTimeout(() => {
                    const newText = isChapter
                        ? `<span class="action-text">她顿了顿，目光落在窗外被雨水打湿的街道上，霓虹在水面上碎成一地的光。</span><br><br><span class="dialogue-text">"那就……等下一个雨季吧。"</span><span class="action-text">她说完便收回视线，指尖在桌面轻轻扣了两下，像是给这段对话画上了句点。</span>`
                        : '她微微愣了一下，随即低下头，轻声道："那就……等下一个雨季吧。"';
                    msg.content = newText;
                }, 1500);
            }
            else if (action === 'multi') this.enterMultiSelectMode();
        },
        stripHtml(html) {
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.innerText || tmp.textContent || '';
        },
        removeMessageById(id) {
            const arr = this.currentMessages;
            const idx = arr.findIndex(m => m.id === id);
            if (idx > -1) arr.splice(idx, 1);
        },

        /* ============ 多选 ============ */
        enterMultiSelectMode() {
            this.isMultiSelectMode = true;
            this.selectedIds = [];
        },
        toggleSelect(id) {
            const idx = this.selectedIds.indexOf(id);
            if (idx > -1) this.selectedIds.splice(idx, 1);
            else this.selectedIds.push(id);
        },
        toggleSelectAll() {
            const all = this.currentMessages;
            if (this.selectedIds.length === all.length) {
                this.selectedIds = [];
            } else {
                this.selectedIds = all.map(m => m.id);
            }
        },
        cancelMultiSelect() {
            this.isMultiSelectMode = false;
            this.selectedIds = [];
        },
        deleteSelectedMessages() {
            if (this.selectedIds.length === 0) { this.showToast('未选择任何消息'); return; }
            const arr = this.currentMessages;
            for (let i = arr.length - 1; i >= 0; i--) {
                if (this.selectedIds.includes(arr[i].id)) arr.splice(i, 1);
            }
            this.cancelMultiSelect();
            this.showToast('已批量删除');
        },

        /* ============ 编辑 ============ */
        closeEditModal() {
            this.isEditModalOpen = false;
            this.editingMsgId = null;
            this.editText = '';
        },
        saveEditMessage() {
            if (this.editingMsgId == null) return;
            const text = this.editText.trim();
            if (!text) return;

            const msg = this.currentMessages.find(m => m.id === this.editingMsgId);
            if (msg) {
                if (this.currentMode === 'chapter') {
                    msg.content = this.escapeHtml(text);
                } else {
                    msg.content = text;
                }
            }
            this.closeEditModal();
        },

        /* ============ 世界书 ============ */
        cycleWbState(btn) {
            if (btn.classList.contains('state-always')) {
                btn.classList.remove('state-always');
                btn.classList.add('state-keyword');
                btn.innerText = '关键词';
            } else if (btn.classList.contains('state-keyword')) {
                btn.classList.remove('state-keyword');
                btn.classList.add('state-disabled');
                btn.innerText = '禁用';
            } else {
                btn.classList.remove('state-disabled');
                btn.classList.add('state-always');
                btn.innerText = '始终';
            }
        },

        /* ============ 预设与提示词 ============ */
        openPresetModal() {
            this.showSavePresetInput = false;
            this.newPresetName = '';
            this.showPresetModal = true;
        },
        selectPreset(name) {
            this.currentPreset = name;
            this.showPresetModal = false;
            this.showToast(`已切换至：${name}`);
        },
        saveNewPreset() {
            const name = this.newPresetName.trim();
            if (!name) { this.showToast('请输入预设名称'); return; }
            if (!this.presets.includes(name)) this.presets.push(name);
            this.currentPreset = name;
            this.newPresetName = '';
            this.showSavePresetInput = false;
            this.showPresetModal = false;
            this.showToast(`已保存新预设：${name}`);
        },
        saveSystemPrompt() {
            const title = this.systemPromptTitle.trim();
            if (!title) { this.showToast('请填写提示词标题'); return; }
            this.showSystemPromptModal = false;
            this.showToast('预设专属提示词已保存');
        },

        /* ============ 文风 ============ */
        saveCustomStyle() {
            const name = this.newStyleName.trim();
            if (!name) { this.showToast('请填写文风名称'); return; }
            
            if (!this.customStyles.includes(name)) {
                this.customStyles.push(name);
            }
            this.currentStyle = name; // 自动应用该文风
            
            this.showCustomStyleModal = false;
            this.showToast(`已保存并应用文风：${name}`);
            this.newStyleName = '';
            this.newStyleDesc = '';
        },

        /* ============ 记忆 ============ */
        openMemoryDetail(type, title) {
            this.memoryDetailTitle = title;
            this.memoryDetailList = this.memoryDB[type] || [];
            this.showMemoryDetailModal = true;
        },

        /* ============ 演进 ============ */
        openEvolutionModal() {
            this.showLoraInfo = false;
            this.showEvolutionModal = true;
        },

        /* ============ 分支 ============ */
        createBranch() {
            const name = `分支 ${this.branches.length} (独立记忆)`;
            this.branches.push(name);
            this.currentBranch = name;
            this.showToast('已创建新分支并自动存档');
        },
        selectBranch(name) {
            this.currentBranch = name;
            this.showBranchModal = false;
            this.showToast(`已切换至：${name}`);
        },

        /* ============ 禁词 ============ */
        addBadword(type) {
            const input = type === 'global' ? this.globalBadwordInput : this.localBadwordInput;
            const arr = type === 'global' ? this.globalBadwords : this.localBadwords;
            const raw = input;
            if (!raw.trim()) { this.showToast('请输入内容'); return; }
            raw.split(/[、,，]/).map(w => w.trim()).filter(w => w).forEach(w => {
                if (!arr.includes(w)) arr.push(w);
            });
            if (type === 'global') this.globalBadwordInput = '';
            else this.localBadwordInput = '';
        },

        /* ============ 字体 ============ */
        handleFontUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const fontName = 'UserCustomFont';
                const style = document.createElement('style');
                style.innerHTML = `
                    @font-face { font-family: '${fontName}'; src: url('${e.target.result}'); }
                    body, .bubble, .chapter-paragraph, .profile-name, .profile-signature, .status-text, .narration-text, .glass-input, .edit-textarea,
                    .mode-btn, .settings-item, .tag, .badword-tag, .modal-input, .modal-textarea, .menu-btn {
                        font-family: '${fontName}', -apple-system, sans-serif !important;
                    }
                `;
                document.head.appendChild(style);
                this.showToast('字体已成功替换');
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        },

        /* ============ CSS ============ */
        applyCustomCSS() {
            const el = document.getElementById('user-custom-css');
            if (el) el.innerHTML = this.customCss;
        },

        /* ============ 主题导出导入 ============ */
        exportTheme() {
            const themeData = {
                customCss: this.customCss,
                background: document.querySelector('.bg-layer').style.backgroundImage,
                statusText: this.statusText
            };
            const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `主题_${Date.now()}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            this.showToast('主题已导出');
        },
        importTheme(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.customCss) {
                        this.customCss = data.customCss;
                        this.applyCustomCSS();
                    }
                    if (data.background && data.background !== 'none') {
                        document.querySelector('.bg-layer').style.backgroundImage = data.background;
                    }
                    if (data.statusText !== undefined) this.statusText = data.statusText;
                    this.showToast('主题导入成功');
                } catch (err) { this.showToast('JSON 解析失败'); }
            };
            reader.readAsText(file);
            event.target.value = '';
        },

        /* ============ 壁纸 ============ */
        changeWallpaper(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.querySelector('.bg-layer').style.backgroundImage = `url('${e.target.result}')`;
                    this.showToast('壁纸替换成功');
                };
                reader.readAsDataURL(file);
            }
            event.target.value = '';
        }
    }));
});
