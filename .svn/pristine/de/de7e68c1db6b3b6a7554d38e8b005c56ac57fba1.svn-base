import Global from "../Global";
import * as Const from "../Const";
import wx from '../SDK/wx';
import ws from '../SDK/ws';

class Loading {

    public isGameDataLoaded: boolean = false;

    private onGameDataLoaded: Function;

    /**微信环境初始化*/
    public initWeixin(onGameDataLoaded?: Function) {
        this.onGameDataLoaded = onGameDataLoaded;

        wx.showShareMenu({
            withShareTicket: true
        });
        wx.onShareAppMessage(() => {
            let option = ws.createShareOptions({ pos: 'ShareAppButton' });
            return {
                title: option.title,
                imageUrl: option.imageUrl,
                query: option.query,
            }
        });
        ws.init({
            host: 'ws.lesscool.cn', // 暂时用这个域名，后面会支持api.websdk.cn这个域名
            version: Const.VERSION, // 当前的小游戏版本号，只能以数字
            appid: 1141, // 此项目在云平台的appid
            secret: '8a4b117c17f8134b3bdc5567571339d6', // 此项目在云平台的secret, 用于与后端通信签名
            share: {
                title: '全民欢乐，天天游戏！', // 默认分享文案
                image: 'http://oss.lesscool.cn/fcdh/96d172496dbafa4ab9c8335a7133476c.png', // 默认分享图片
            },
        })
        this.loginWs();
    }

    /**登录ws后台*/
    private loginWs() {
        wx.showLoading({ title: '登录中', mask: true });
        ws.onLoginComplete(this.onLoginComplete.bind(this));
        ws.login();
    }

    /**登录ws后台完成*/
    private onLoginComplete(res, gameData) {
        if (ws.getLoginStatus() === 'success') {
            console.log("login_succeed")
            ws.traceEvent('login_succeed');
            wx.hideLoading();
            console.log('ws.conf', ws.conf); // 通用配置
            console.log('ws.user', ws.user); // 用户信息
            console.log('ws.data', ws.data); // 本地保存的游戏数据
            this.loadConfig();
            this.loadGameData(gameData);
        } else if (ws.getLoginStatus() === 'fail') {
            console.log("login_failed")
            ws.traceEvent('login_failed');
            wx.hideLoading();
            wx.showModal({
                title: '登陆失败',
                content: '请允许授权',
                confirmText: '重新登陆',
                cancelText: '关闭',
                success(res) {
                    wx.showLoading({ title: '登录中', mask: true });
                    ws.login();
                }
            });
        }
    }

    /**后台配置加载完成*/
    private loadConfig() {
        (<any>Object).assign(Global.config, ws.conf);
    }

    /**加载后台游戏数据*/
    private loadGameData(gameData) {
        if (gameData && gameData.updateTimestamp) {
            if (ws.data && ws.data.updateTimestamp && ws.data.updateTimestamp > gameData.updateTimestamp) {
                ws.setAllData(ws.data, true);
            } else {
                ws.setAllData(gameData);
            }
        } else if (!ws.data || !ws.data.updateTimestamp) {
            ws.setAllData(Global.gameData, true);
        }
        Global.gameData = (<any>Object).assign(Global.gameData, ws.data);
        //关闭更新游戏数据
        wx.onHide(() => {
            this.updateGameData(true);
        });
        //刷新当前广告banner
        ws.onShow((res) => {

        });

        this.isGameDataLoaded = true;

        this.onGameDataLoaded && this.onGameDataLoaded();
    }

    /**提交游戏数据*/
    updateGameData(post: boolean) {
        Global.gameData.updateTimestamp = Date.now();
        post && console.log('updateGameData', Global.gameData);
        CC_WECHATGAME && ws.setAllData(Global.gameData, post);
    }
}

export default new Loading();