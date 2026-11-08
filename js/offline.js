document.addEventListener('alpine:init', () => {
    Alpine.data('offlineManager', () => ({
        // ================= 状态 =================
        showOfflineMode: false,
        currentMode: 'dialogue', // 'dialogue' | 'chapter'
        
        // 消息数据
        dialogueMessages: [
            { id: 1, role: 'narration', content: '窗外的雨声淅淅沥沥，空气中弥漫着潮湿的青草味。' },
            { id: 2, role: 'ai', content: '凌晨 00:52，水瓶里的水汽也开始失眠。' },
            { id: 3, role: 'user', content: '那是「对跖点」的海潮，正在替你倒流回薄荷站台。' },
            { id: 4, role: 'ai', content: '我们隔着一整个地球的半径，连呼吸都像在照镜子。' }
        ],
        chapterMessages: [
            {
                id: 201, role: 'ai',
                content: `<span class="action-text">窗外的雨声似乎更密了些，敲打在木质窗棂上，发出沉闷的声响。Yosali轻轻推开桌面上空了的玻璃水瓶，目光越过摇晃的水面，落在对面那个有些局促的人身上。</span><br><br><span class="dialogue-text">“打不开也没关系呀。”</span><span class="action-text">她轻声说着，伸出手将那个透明的玻璃瓶往自己这边拢了拢，指尖无意间擦过你的手背，带来一点微凉。</span>`
            },
            {
                id: 202, role: 'user',
                content: `<span class="action-text">我沉默地将手收回，指尖残留的微凉让人有些恍神。窗外的雨声仿佛被隔绝在了另一个世界。</span><br><br><span class="dialogue-text">“没关系的，总会找到办法打开。”</span><span class="action-text">我低下头，目光重新落回那个玻璃瓶上，声音放得很轻，像是在说服自己。</span>`
            }
        ],
        msgIdCounter: 100,
        chatInput: '',
        
        // 角色常量
        aiInfo: { name: 'Yosali', avatar: 'https://i.ibb.co/zvr3HYQ/IMG-6559.jpg', signature: '人生荒蛮 再见 在哪见' },
        userInfo: { name: '攸攸', avatar: 'https://i.ibb.co/27tgDqq0/IMG-6557.jpg', signature: '你不信来世，蜉蝣也不信明天。' },

        // UI 状态
        showSettingsPanel: false,
        settingsTab: 'settings', // 'settings' | 'beauty'
        showToastMsg: '',
        toastTimeout: null,
        
        // 长按菜单状态
        menuShow: false,
        menuStyle: 'top: 0px; left: 0px;',
        menuPage: 1,
        currentTargetMsg: null,
        pressTimer: null,
        isPressing: false,
        
        // 多选状态
        isMultiSelectMode: false,
        selectedIds: [],
        
        // 编辑状态
        showEditModal: false,
        editTextarea: '',
        
        // 弹窗状态 (世界书/记忆等)
        showWorldBookModal: false,
        showNpcModal: false,
        showMemoryModal: false,
        showMemoryDetailModal: false,
        currentMemoryDetail: { title: '', list: [] },
        
        // 主题设置
        customCss: '',
        statusText: 'Night reveals stars the daylight cannot show.',
        customStylePreview: '未设定',

        // ================= 初始化 =================
        initOffline() {
            // 开启应用内禁止选中
            document.addEventListener('selectstart', (e) => {
                if (!e.target.closest || !e.target.closest('input, textarea')) {
                    e.preventDefault();
                }
            }, { passive: false });
        },

        // ================= 核心方法 =================
        openApp() {
            this.showOfflineMode = true;
            this.$nextTick(() => this.scrollToBottom());
        },
        closeApp() {
            this.showOfflineMode = false;
            this.cancelMultiSelect();
            this.hideMenu();
        },

        get currentMessages() {
            return this.currentMode === 'chapter' ? this.chapterMessages : this.dialogueMessages;
        },

        setMode(mode) {
            if (this.isMultiSelectMode) this.cancelMultiSelect();
            if (this.menuShow) this.hideMenu();
            this.currentMode = mode;
            this.$nextTick(() => this.scrollToBottom());
        },

        scrollToBottom() {
            const area = document.getElementById('offline-chat-area');
            if(area) area.scrollTop = area.scrollHeight;
        },

        sendMessage() {
            if (!this.chatInput.trim()) return;
            const text = this.chatInput.trim();
            const isChapter = this.currentMode === 'chapter';
            
            this.currentMessages.push({
                id: ++this.msgIdCounter,
                role: 'user',
                content: isChapter ? this.escapeHtml(text) : text
            });
            
            this.chatInput = '';
            this.$nextTick(() => this.scrollToBottom());

            // 模拟回复
            setTimeout(() => {
                const targetArr = isChapter ? this.chapterMessages : this.dialogueMessages;
                const replies = isChapter 
                    ? [`<span class="action-text">她顿了顿，目光落在窗外被雨水打湿的街道上，霓虹在水面上碎成一地的光。</span><br><br><span class="dialogue-text">“那就……等下一个雨季吧。”</span><span class="action-text">她说完便收回视线，指尖在桌面轻轻扣了两下，像是给这段对话画上了句点。</span>`]
                    : ['嗯，我听见了。', '雨好像又大了些……', '你说的话，我记下了。'];
                
                targetArr.push({
                    id: ++this.msgIdCounter,
                    role: 'ai',
                    content: replies[Math.floor(Math.random() * replies.length)]
                });
                if (this.currentMode === (isChapter ? 'chapter' : 'dialogue')) {
                    this.$nextTick(() => this.scrollToBottom());
                }
            }, 1200);
        },

        escapeHtml(str) {
            return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
        },

        showToast(msg) {
            this.showToastMsg = msg;
            clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => { this.showToastMsg = ''; }, 2500);
        },

        // ================= 长按与多选 =================
        handlePressStart(e, msg) {
            if (this.isMultiSelectMode) return;
            if (this.menuShow) return;
            
            this.currentTargetMsg = msg;
            this.isPressing = true;
            
            this.pressTimer = setTimeout(() => {
                if(e.cancelable) e.preventDefault();
                this.showMenu(e, msg);
            }, 400);
        },

        handlePressEnd() {
            clearTimeout(this.pressTimer);
            if (!this.menuShow) this.isPressing = false;
        },

        showMenu(e, msg) {
            const rect = e.target.closest('.offline-message-row').getBoundingClientRect();
            this.menuShow = true;
            this.menuPage = 1;
            
            // 简易定位计算
            this.menuStyle = `top: ${rect.top - 50}px; left: 20px;`; 
            // 实际业务中你可以用更精确的 getBoundingClientRect 算中心点
        },

        hideMenu() {
            this.menuShow = false;
            this.isPressing = false;
            this.currentTargetMsg = null;
        },

        handleMenuAction(action) {
            const msg = this.currentTargetMsg;
            if (!msg) return;
            this.hideMenu();

            if (action === 'copy') {
                navigator.clipboard.writeText(msg.content.replace(/<[^>]+>/g, ''));
                this.showToast('已复制');
            } else if (action === 'delete') {
                const arr = this.currentMessages;
                const idx = arr.findIndex(m => m.id === msg.id);
                if (idx > -1) arr.splice(idx, 1);
                this.showToast('已删除');
            } else if (action === 'edit') {
                this.editTextarea = msg.content.replace(/<[^>]+>/g, '');
                this.showEditModal = true;
            } else if (action === 'multi') {
                this.enterMultiSelect(msg.id);
            }
        },

        saveEditMessage() {
            if (this.currentTargetMsg) {
                const msg = this.currentMessages.find(m => m.id === this.currentTargetMsg.id);
                if (msg) msg.content = this.editTextarea;
            }
            this.showEditModal = false;
            this.currentTargetMsg = null;
        },

        enterMultiSelect(initialId = null) {
            this.isMultiSelectMode = true;
            this.selectedIds = initialId ? [initialId] : [];
        },
        
        toggleSelect(id) {
            if (!this.isMultiSelectMode) return;
            const idx = this.selectedIds.indexOf(id);
            if (idx > -1) this.selectedIds.splice(idx, 1);
            else this.selectedIds.push(id);
        },

        deleteSelected() {
            if (this.selectedIds.length === 0) return;
            const arr = this.currentMessages;
            for (let i = arr.length - 1; i >= 0; i--) {
                if (this.selectedIds.includes(arr[i].id)) arr.splice(i, 1);
            }
            this.cancelMultiSelect();
            this.showToast('已批量删除');
        },

        cancelMultiSelect() {
            this.isMultiSelectMode = false;
            this.selectedIds = [];
        },

        selectAll() {
            if (this.selectedIds.length === this.currentMessages.length) {
                this.selectedIds = [];
            } else {
                this.selectedIds = this.currentMessages.map(m => m.id);
            }
        },

        // ================= 设置面板相关 =================
        applyCustomCss() {
            let styleEl = document.getElementById('offline-custom-css');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'offline-custom-css';
                document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = this.customCss;
        },

        // 记忆面板数据
        memoryDB: {
            'core': [{ content: "角色是一个拥有自我意识的仿生人，极度厌恶被称作\"机器\"或\"它\"。", tags: ["#绝对真理", "#身份"], strength: "100%", date: "长期" }],
            'long': [
                { content: "阿宁的生日是 11 月 12 日（周六）。", tags: ["#生日", "#日期"], strength: "100%", date: "11-12" },
                { content: "极度讨厌潮湿的天气，会引发关节疼痛。", tags: ["#禁忌", "#身体"], strength: "85%", date: "10-05" }
            ]
        },
        openMemoryDetail(type, title) {
            this.currentMemoryDetail = {
                title: title,
                list: this.memoryDB[type] || []
            };
            this.showMemoryDetailModal = true;
        },
        
        // 简化模拟
        toggleSwitch(el) { el.classList.toggle('active'); },
        switchControl(btn) {
            const siblings = btn.parentElement.children;
            for (let b of siblings) b.classList.remove('active');
            btn.classList.add('active');
        }
    }));
});
