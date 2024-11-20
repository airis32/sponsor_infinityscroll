
const logoContainer = document.querySelector('.logo-container');
const logoWrapper = document.querySelector('.logo-wrapper');
const originalLogos = document.querySelectorAll('.logo');

// 성능 최적화를 위한 설정
const SCROLL_SPEED = 1;
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

    // 스크롤 애니메이션
    animate = (timestamp) => {
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;

        const elapsed = timestamp - this.lastTimestamp;

        if (elapsed > FRAME_INTERVAL) {
            // position 업데이트 (음수 처리 보완)
            this.position -= SCROLL_SPEED;
            if (this.position <= -this.singleSetWidth) {
                this.position += this.singleSetWidth;
            }

            // transform 적용
            this.wrapper.style.transform = `translateX(${this.position}px)`;

            this.lastTimestamp = timestamp;
        }

        this.animationId = requestAnimationFrame(this.animate);
    };

    // 애니메이션 시작
    start() {
        if (!this.animationId) {
            this.animate(performance.now());
        }
    }

    // 애니메이션 정지
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this.lastTimestamp = 0;
        }
    }

    // 위치 리셋
    reset() {
        this.position = 0;
        this.lastTimestamp = 0;
        this.wrapper.style.transform = `translateX(0px)`;
    }
}

// 로고 복제 및 추가 함수
const setupScrollableContent = () => {
    // 기존 복제된 로고들 제거
    const existingLogos = logoWrapper.querySelectorAll('.logo');
    Array.from(existingLogos).slice(originalLogos.length).forEach(logo => logo.remove());

    // 컨테이너와 로고 세트의 너비 계산
    const containerWidth = logoContainer.offsetWidth;
    const singleSetWidth = Array.from(originalLogos).reduce((width, logo) => {
        const style = window.getComputedStyle(logo);
        const marginRight = parseInt(style.marginRight) || 0;
        const marginLeft = parseInt(style.marginLeft) || 0;
        return width + logo.offsetWidth + marginRight + marginLeft;
    }, 0);

    // 필요한 세트 수 계산 (컨테이너를 3배 이상 채우도록)
    const minSets = Math.ceil((containerWidth * 3) / singleSetWidth);

    // 로고 복제 및 추가
    for (let i = 0; i < minSets; i++) {
        originalLogos.forEach(logo => {
            const clone = logo.cloneNode(true);
            logoWrapper.appendChild(clone);
        });
    }

    return singleSetWidth;
};

let scrollController;

// 초기 설정
const init = () => {
    const singleSetWidth = setupScrollableContent();

    // 기존 컨트롤러 정지
    if (scrollController) {
        scrollController.stop();
    }

    // 새 컨트롤러 생성 및 시작
    scrollController = new InfiniteScroll(logoWrapper, singleSetWidth);
    scrollController.start();
};

// 이미지 로드 처리
const preloadImages = () => {
    return Promise.all(
        Array.from(document.images).map(img => {
            if (img.complete) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })
    );
};

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

// 초기화 시작
window.addEventListener('load', () => {
    preloadImages().then(init);
});
