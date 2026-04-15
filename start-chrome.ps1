$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$arg = "--remote-debugging-port=9222 http://localhost:3002"
Start-Process -FilePath $chromePath -ArgumentList $arg -WindowStyle Hidden
