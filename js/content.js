/** 与chrome扩展通信。*/
chrome.extension.onMessage.addListener(
    function (request, sender, senderResponse) {
        if(request.action && request.action==="get_url"){
            senderResponse({url:location.href});
        }
    });

