chrome.commands.onCommand.addListener(async (command) => {
  console.log(`'${command}' 명령을 수신했습니다.`); // 로그 추가

  if (command === 'toggle-cleaner') {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    // 네이버 블로그 URL인지 확인
    if (tab && tab.url && (tab.url.startsWith('https://blog.naver.com') || tab.url.startsWith('http://blog.naver.com'))) {
      try {
        await chrome.tabs.sendMessage(tab.id, {action: 'toggle'});
      } catch (error) {
        console.error('메시지 전송에 실패했습니다:', error);
      }
    } else {
      console.log('현재 탭은 네이버 블로그가 아닙니다.');
    }
  }
});