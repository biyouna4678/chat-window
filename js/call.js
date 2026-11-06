/* ================= 通话核心逻辑 ================= */
        startCall(type = 'voice', state = 'calling') {
            this.callType = type;
            this.callState = state;
            this.isMinimized = false;
            this.showCallSelector = false;
            
            // 【修复】：只要是视频通话，发起时立刻打开本地摄像头，不再等对方接听
            if (type === 'video' && state === 'calling') {
                this.startCamera();
            }
            
            if (state === 'active') {
                this.startTimer();
                if (type === 'video') this.startCamera();
                this.initSpeechRecognition();
            }
        },
        
        acceptCall() {
            this.callState = 'active';
            this.startTimer();
            // 【修复】：接听时同步调用，不写进 Promise 里
            if (this.callType === 'video') {
                this.startCamera();
            }
            this.initSpeechRecognition();
        },

        /* ================= 视频摄像头控制 ================= */
        stopCamera() {
            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }
            if (this.$refs.videoElement) this.$refs.videoElement.srcObject = null;
            if (this.$refs.pipVideoElement) this.$refs.pipVideoElement.srcObject = null;
        },

        async startCamera() {
            if (!this.cameraOn || this.isStartingCamera) return;
            this.isStartingCamera = true;
            this.stopCamera(); 

            try {
                const constraints = { video: { facingMode: this.isFrontCamera ? 'user' : 'environment' }, audio: false };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                
                if (!this.cameraOn || this.callState === 'idle') {
                    stream.getTracks().forEach(track => track.stop());
                    this.isStartingCamera = false;
                    return;
                }
                this.mediaStream = stream;
                this.bindVideoStream();
            } catch (err) { 
                console.error("Camera Error: ", err);
                this.cameraOn = false; 
                // 【新增】：增加错误提示，让你知道到底是被拒绝了还是环境不支持
                if (err.name === 'NotAllowedError') {
                    alert('相机权限被拒绝。请去 手机设置 -> Safari浏览器 -> 相机 中允许访问。\n注意：如果是本地局域网IP或HTTP访问也无法使用。');
                } else if (err.name === 'NotFoundError') {
                    alert('未检测到摄像头设备');
                } else {
                    alert('摄像头启动失败: ' + err.message);
                }
            } finally {
                this.isStartingCamera = false;
            }
        },

        bindVideoStream() {
            this.$nextTick(() => {
                if (this.$refs.videoElement) this.$refs.videoElement.srcObject = null;
                if (this.$refs.pipVideoElement) this.$refs.pipVideoElement.srcObject = null;

                if (!this.isMinimized && this.$refs.videoElement) {
                    this.$refs.videoElement.srcObject = this.mediaStream;
                } else if (this.isMinimized && this.$refs.pipVideoElement) {
                    this.$refs.pipVideoElement.srcObject = this.mediaStream;
                }
            });
        },
        
        switchCamera() {
            this.isFrontCamera = !this.isFrontCamera;
            if (this.cameraOn) this.startCamera();
        },
        
        toggleCamera() {
            // 【关键修复】：必须同步执行！不能加 $nextTick，否则 iOS 会拦截权限弹窗
            if (this.cameraOn) {
                this.cameraOn = false;
                this.stopCamera();
            } else {
                this.cameraOn = true;
                this.startCamera(); // 直接同步调用
            }
        },
