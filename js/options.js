/**
 * Created by youxiang on 2017/7/4.
 */


$(document).ready(function () {
    getCurrentUrl();
    loadHistory();
    showQR();
    $("#removeUrl").on("click", removeSelection);
    $("#openUrl").on("click", openCurrentUrl);
    $("#historyUrls").on("change", showQR);
    $("#openTabBtn").on("click", function () { window.open('../pages/tool.html') });
    $("#openTabBtn").on("click", function () { window.open('../pages/tool.html') });
}
);

/** 获取当前页面链接
 *
 * 通过与tab页通信获取当前页面的链接，然后将其添加到
 * */
var getCurrentUrl = function () {
    /** 与tab页通信。 */
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'get_url' }, function (response) {
            if (response && response.url) {
                var history = new HistoryUrls();
                history.add(response.url);
                loadHistory(); /** 刷新 */
                showQR();
            }
            else {
                $("#tips").text("当前页面链接不可以用。");
            }
        });
    });
};

/** 历史链接类 */
var HistoryUrls = function () {
    this.urls = [];
    this.keys = [];
    this.length = 0;
    this.ptr = 0;
    this.prefix = "history.url.";

    this.load = function () {
        this._load_ptr();   // 加载链接数
        this._load_urls();     // 加载链接
    };

    this._load_ptr = function () {
        var ptr = localStorage[this.prefix + 'ptr'] || 0;
        this.ptr = parseInt(ptr);
    };

    this._save_ptr = function () {
        localStorage[this.prefix + 'ptr'] = this.ptr;
    };

    this._load_urls = function () {
        this.urls = [];
        this.keys = [];
        for (var i = 1; i <= this.ptr; i++) {
            var key = this.prefix + i;
            var url = localStorage[key];
            if (url) {
                this.urls.push(url);
                this.keys.push(key);
            }
        }
        this.length = this.urls.length;
    };
    this.add = function (url) {
        this.ptr = this.ptr + 1;
        this._save_ptr();

        var key = this.prefix + this.ptr;
        this.keys.push(key);
        this.urls.push(url);
        localStorage[key] = url;
    };

    this.removeByKey = function (key) {
        /* 从keys和urls中移除*/
        var index = this.keys.indexOf(key);

        if (index >= 0) {
            this.keys.splice(index, 1);
            this.urls.splice(index, 1);
            this._save_ptr();
            localStorage.removeItem(key);
        }

    };

    this.removeAll = function () {
        for (var key in localStorage) {
            if (key.indexOf(this.prefix) >= 0) {
                localStorage.removeItem(key);
                this.ptr = 0;
                this.urls = [];
                this.keys = [];
                this.length = 0;
            }
        }
    };
    this.toOptions = function () {
        var optionStr = '';
        var template = '<option name="{key}" value="{url}">{url}</option>';
        for (var i = this.length - 1; i >= 0; i--) {
            var key = this.keys[i];
            var url = this.urls[i];
            var line = template.replace(/{key}/g, key);
            line = line.replace(/{url}/g, url);
            optionStr += '\n' + line;
        }
        return optionStr;
    };
    this.load();
};

/** 加载历史链接 */
var loadHistory = function () {
    var history = new HistoryUrls();
    $('#historyUrls').html(history.toOptions());
};

/** 删除当前选择 */
var removeSelection = function () {
    var key = $("#historyUrls option:selected").attr("name");
    var history = new HistoryUrls();
    history.removeByKey(key);
    $("#historyUrls").html(history.toOptions());
    //showQR();
};

/** 打开当前链接 */
var openCurrentUrl = function () {
    var url = $('#historyUrls').val();
    window.open(url);
};

var showQR = function () {
    var url = $('#historyUrls').val();
    $("#tips").text("(使用微信扫一扫查看链接)");
    $("#url").text(url);
    $("#qrcode").html("");  // 清空已有二维码
    $("#qrcode").qrcode(url);
};