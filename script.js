const logoContainer = document.querySelector('.logo-container');
const logoWrapper = document.querySelector('.logo-wrapper');
const originalLogos = document.querySelectorAll('.logo');

// 성능 최적화를 위한 설정
const SCROLL_SPEED = 2;
const FRAME_RATE = 60;
const FRAME_INTERVAL = 1000 / FRAME_RATE;

class InfiniteScroll {
    constructor(wrapper, singleSetWidth) {
        this.wrapper = wrapper;
        this.singleSetWidth = singleSetWidth;
        this.position = 0;
        this.lastTimestamp = 0;
        this.animationId = null;
    }

    animate = (timestamp) => {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;

        const elapsed = timestamp - this.lastTimestamp;

        if (elapsed > FRAME_INTERVAL) {
            this.position -= SCROLL_SPEED;
            
            if (Math.abs(this.position) >= this.singleSetWidth) {
                this.position += this.singleSetWidth;
            }

            this.wrapper.style.transform = `translate3d(${this.position}px, 0, 0)`;
            this.lastTimestamp = timestamp;
        }

        this.animationId = requestAnimationFrame(this.animate);
    };

    start() {
        if (!this.animationId) {
            this.animate(performance.now());
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.lastTimestamp = 0;
        }
    }

    reset() {
        this.position = 0;
        this.lastTimestamp = 0;
        this.wrapper.style.transform = `translate3d(0, 0, 0)`;
    }
}

const setupScrollableContent = () => {
    // 기존 복제된 로고들 제거
    logoWrapper.innerHTML = '';
    
    // 원본 로고들을 복제하여 첫 번째 세트 생성
    const firstSet = Array.from(originalLogos).map(logo => logo.cloneNode(true));
    firstSet.forEach(logo => logoWrapper.appendChild(logo));

    // 컨테이너와 로고 세트의 너비 계산
    const containerWidth = logoContainer.offsetWidth;
    const singleSetWidth = firstSet.reduce((width, logo) => {
        const style = window.getComputedStyle(logo);
        const totalWidth = logo.offsetWidth + 
            parseInt(style.marginLeft || 0) + 
            parseInt(style.marginRight || 0);
        return width + totalWidth;
    }, 0);

    // 필요한 세트 수 계산 (컨테이너를 2배 이상 채우도록 수정)
    const minSets = Math.ceil((containerWidth * 2) / singleSetWidth) + 1;

    // 추가 세트 복제 및 추가
    for (let i = 1; i < minSets; i++) {
        firstSet.forEach(logo => {
            const clone = logo.cloneNode(true);
            logoWrapper.appendChild(clone);
        });
    }

    return singleSetWidth;
};

let scrollController;

const init = () => {
    try {
        const singleSetWidth = setupScrollableContent();

        if (scrollController) {
            scrollController.stop();
        }

        logoWrapper.style.transition = 'none';
        scrollController = new InfiniteScroll(logoWrapper, singleSetWidth);
        scrollController.start();
    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
    }
};

// 초기화 시작 - 이미지 로드 체크 없이 바로 시작
window.addEventListener('load', init);

// 페이지 가시성 변경 처리
document.addEventListener('visibilitychange', () => {
    if (!scrollController) return;
    
    if (document.hidden) {
        scrollController.stop();
    } else {
        scrollController.start();
    }
});

// 윈도우 리사이즈 처리
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(init, 150);
});