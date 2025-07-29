console.log('네이버 블로그 클리너 스크립트가 로드되었습니다.');

let cleanerActive = true;

function getIframeDocument() {
    const iframe = document.querySelector('iframe#mainFrame');
    return iframe ? iframe.contentDocument || iframe.contentWindow.document : null;
}

function toggleElements(doc, forceHide = false) {
    const header = doc.querySelector('#floating_area_header');
    const bottom = doc.querySelector('#floating_bottom');

    if (header) {
        const currentDisplay = header.style.display;
        const newDisplay = (forceHide || cleanerActive) ? 'none' : '';
        if (currentDisplay !== newDisplay) {
            header.style.display = newDisplay;
            console.log(`상단 오버레이를 ${newDisplay === 'none' ? '숨김' : '표시'}합니다.`);
        }
    }

    if (bottom) {
        const currentDisplay = bottom.style.display;
        const newDisplay = (forceHide || cleanerActive) ? 'none' : '';
        if (currentDisplay !== newDisplay) {
            bottom.style.display = newDisplay;
            console.log(`하단 오버레이를 ${newDisplay === 'none' ? '숨김' : '표시'}합니다.`);
        }
    }
}

function handleToggle() {
    cleanerActive = !cleanerActive;
    console.log(`클리너 ${cleanerActive ? '활성화' : '비활성화'}`);
    const iframeDoc = getIframeDocument();
    if (iframeDoc) {
        toggleElements(iframeDoc);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        handleToggle();
        sendResponse({status: 'toggled', active: cleanerActive});
    }
    return true;
});

function observeIframe(iframe) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    if (!iframeDoc || !iframeDoc.body) {
        console.log('Iframe document 또는 body를 찾을 수 없습니다.');
        return;
    }

    const observer = new MutationObserver(() => {
        if (cleanerActive) {
            toggleElements(iframeDoc, true);
        }
    });

    observer.observe(iframeDoc.body, { childList: true, subtree: true });
    console.log('Iframe 내부 DOM 감시를 시작합니다.');

    // 초기 실행
    if (cleanerActive) {
        toggleElements(iframeDoc, true);
    }
}

function initialize() {
    const iframe = document.querySelector('iframe#mainFrame');
    if (iframe) {
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            observeIframe(iframe);
        } else {
            iframe.onload = () => observeIframe(iframe);
        }
    } else {
        // Iframe이 아직 없을 경우를 대비해 body 전체를 감시
        const bodyObserver = new MutationObserver((mutations, obs) => {
            const iframe = document.querySelector('iframe#mainFrame');
            if (iframe) {
                obs.disconnect(); // Iframe을 찾았으므로 body 감시 중단
                initialize();
            }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
}

// 초기화 시작
if (document.readyState === 'complete') {
    initialize();
} else {
    window.addEventListener('load', initialize);
}
