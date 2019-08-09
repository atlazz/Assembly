import wx from "../SDK/wx";
import ws from "../SDK/ws";
import Global from "../Global";

let hasVideo = true;

let currentBannerPos: string = null;
let clickBannerCount: number = 0;

let banners = {};   // list of banner obj
let bannerUid = {};   // list of unit id
let bannerCnt_home = {};
let bannerCnt_treasure = {};
let currBannerIdx: number;

export const randomlyGetBanner = (pos: string) => {
    if (!CC_WECHATGAME) return;
    // 低版本SDK，无此方法返回
    if (!wx.createBannerAd) return;
    // initialize
    if (Object.keys(bannerUid).length === 0) {
        for (let i = 1; i <= Global.config.banner_number; i++) {
            bannerUid[i] = Global.config.banner[i];
            console.log("init uid: ", i, bannerUid[i])
            banners[i] = wxCreatBanner(bannerUid[i]);
            console.log("init bannerAD: ", i, banners[i])
            bannerCnt_home[i] = 0;
            bannerCnt_treasure[i] = 0;

            // onError, 不写上不给show...
            banners[i].onError((errMsg) => {
                console.log("banner onError :", errMsg)
            })
        }
    }
    // randomly select
    currBannerIdx = Math.ceil(Math.random() * Global.config.banner_number);

    /** 首页 */
    if (pos == "home") {
        // check counter
        if (bannerCnt_home[currBannerIdx] >= Global.config.show_number) {
            // recreate
            banners[currBannerIdx] && banners[currBannerIdx].destroy();
            banners[currBannerIdx] = wxCreatBanner(bannerUid[currBannerIdx]);
            bannerCnt_home[currBannerIdx] = 0;
        }
        // update counter
        bannerCnt_home[currBannerIdx]++;
    }
}

export const wxCreatBanner = (uid: string): any => {
    if (!CC_WECHATGAME || !wx.createBannerAd) return;
    let systemInfo = wx.getSystemInfoSync();
    let screenHeight = systemInfo.screenHeight;
    let screenWidth = systemInfo.screenWidth;
    let adWidth = Math.max(300, screenWidth * 300 / 350);// * 0.86
    let adHeight = adWidth * 0.348;
    let top = screenHeight - adHeight;
    let left = (screenWidth - adWidth) / 2;
    return wx.createBannerAd({
        adUnitId: uid,
        style: {
            left: left,
            top: top,
            width: adWidth,
            height: adHeight,
        }
    });
}

export const setStyle = (banner, isMini: boolean, bannerTop: number) => {
    if (!CC_WECHATGAME) return;
    if (!banner) return;
    let systemInfo = wx.getSystemInfoSync();
    let screenHeight = systemInfo.screenHeight;
    let screenWidth = systemInfo.screenWidth;
    let adWidth = screenWidth;
    if (isMini) {
        adWidth = Math.max(300, screenWidth * 300 / 350);// * 0.86
    }
    let adHeight = adWidth * 0.348;
    // defalut at bottom
    let top: number = screenHeight - adHeight;
    // over write
    if (bannerTop !== -1) {
        top = bannerTop / cc.winSize.height * screenHeight;
    }
    let left = (screenWidth - adWidth) / 2;
    banner.style.left = left;
    banner.style.top = top;
    banner.style.width = adWidth;
    banner.style.height = adHeight;
}

export const showBanner = (isMini: boolean = false, bannerTop: number = -1) => {
    if (!CC_WECHATGAME) return;
    setStyle(banners[currBannerIdx], isMini, bannerTop);
    banners[currBannerIdx] && banners[currBannerIdx].show();
    console.log("show banner uid: ", currBannerIdx, "bannerAD: ", banners[currBannerIdx])
}

export const hideBanner = () => {
    if (!CC_WECHATGAME) return;
    for (let i = 1; i <= Object.keys(banners).length; i++) {
        banners[i] && banners[i].hide();
    }
    // banners[currBannerIdx] && banners[currBannerIdx].hide();
}


export const refreshCurrentBanner = () => {
    clickBannerCount++;
    if (currentBannerPos && clickBannerCount >= Global.config.banner_click_time) {
        clickBannerCount = 0;
        posShowBanner(currentBannerPos, true);
    }
}

export const hasVideoAd = (): boolean => {
    return hasVideo;
}

export const posShowBanner = (pos: string, force: boolean = false): any => {
    if (!CC_WECHATGAME) return;
    let systemInfo = wx.getSystemInfoSync();
    let screenHeight = systemInfo.screenHeight;
    let screenWidth = systemInfo.screenWidth;
    let adWidth = Math.max(300, screenWidth * 300 / 350);// * 0.86
    let adHeight = adWidth * 0.348;
    let top = screenHeight - adHeight;
    let left = (screenWidth - adWidth) / 2;
    currentBannerPos = pos;
    return ws.createBanner({
        pos,
        style: {
            left: left,
            top: top,
            width: adWidth,
            height: adHeight,
        },
        force,
    });
};

export const posHideBanner = (pos: string) => {
    if (!CC_WECHATGAME) return;
    currentBannerPos = null;
    ws.closeBanner(pos);
};

export const posShowVideo = (pos: string, onErrorCallback: Function, onCloseCallback: Function) => {
    if (CC_WECHATGAME && ws.createVideo) {
        ws.createVideo({
            pos: pos,
            success: (res) => {
                onCloseCallback && onCloseCallback(res);
            },
            fail: (res) => {
                hasVideo = false;
                console.log('NO VIDEO AD');
                console.log("error res: ", res);
                if (Global.gameData.videoCount <= 11) {
                    ws.traceEvent("errVideoCnt_" + Global.gameData.videoCount);
                }
                else {
                    // 11次以上
                    ws.traceEvent("errVideoCnt_11");
                }
                if (res && res.errMsg) {
                    ws.traceEvent("errCode_" + res.errCode);
                    console.log("errCode: " + res.errCode);
                    console.log("errMsg: " + res.errMsg);
                }
                onErrorCallback && onErrorCallback();
            }
        });
    } else {
        hasVideo = false;
        console.log('NO VIDEO AD');
        onErrorCallback && onErrorCallback();
    }
}