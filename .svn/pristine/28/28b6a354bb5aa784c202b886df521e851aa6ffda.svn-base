import Global from "../Global";
import * as Const from "../Const";
import LvlSelect from "./LvlSelect";
import OverView from "./OverView";
import ScrollViewBetter from "../component/ScrollViewBetter";
import AudioMgr from "../component/AudioMgr";
import wx from "../SDK/wx";
import ws from "../SDK/ws";
import Loading from "../component/Loading";
import Reward from "../component/Reward";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameView extends cc.Component {
    @property(cc.Node)
    btn_back: cc.Node = null;
    @property(cc.Node)
    btn_restart: cc.Node = null;
    @property(cc.Node)
    btn_hint: cc.Node = null;
    @property(cc.Node)
    progressBar: cc.Node = null;
    @property(cc.Node)
    frame_solution: cc.Node = null;
    @property(cc.Node)
    frame_question: cc.Node = null;
    @property(cc.Node)
    title: cc.Node = null;
    @property(cc.Node)
    lvlLabel: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;
    @property(cc.Node)
    container: cc.Node = null;
    @property(cc.Node)
    completeIcon: cc.Node = null;
    @property(cc.Node)
    flash: cc.Node = null;
    @property(cc.Node)
    mask1: cc.Node = null;
    @property(cc.Node)
    mask2: cc.Node = null;
    @property(cc.Node)
    line_left: cc.Node = null;
    @property(cc.Node)
    line_right: cc.Node = null;
    @property(cc.Node)
    line_left2: cc.Node = null;
    @property(cc.Node)
    line_right2: cc.Node = null;
    @property(cc.Node)
    line_rotate: cc.Node = null;
    @property(cc.Node)
    finger: cc.Node = null;

    @property(cc.Node)
    HomeView: cc.Node = null;
    @property(cc.Node)
    LvlSelectView: cc.Node = null;
    @property(cc.Node)
    OverView: cc.Node = null;

    static BaseUrl: string = "textures/game/";

    private lvlSelectScript: LvlSelect;
    private overScript: OverView;

    private state: number;
    private selected: string;
    private prevPos: cc.Vec2;
    private prevRot: number;
    private posBeforeMove: cc.Vec2;
    private winBar: cc.ProgressBar;
    private prevProgress: number;
    private winFlag: boolean;
    private isWin: boolean;

    /** load */
    private level: number;
    private lvlConf;
    private items;
    private itemsFrame;
    private tipsFrame;
    private winStep: number = 0.1;
    private resCnt: number;

    /** preload */
    public level_preload: number;
    private lvlConf_preload;
    private items_preload;
    private itemsFrame_preload;
    private tipsFrame_preload;
    private winStep_preload: number = 0.1;
    private resCnt_preload: number;

    public loadLvl: number;
    public preLoadLvl: number;

    private loadTimeStamp: number; // 资源加载时间戳，用于回调中标识确认
    public loadTimeStamp_preload: number; // 资源加载时间戳，用于回调中标识确认

    private canTouch: boolean = true;
    private touchID: number = null;

    start() {
        // get script
        !this.lvlSelectScript && (this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect));
        this.overScript = this.OverView.getComponent(OverView);

        this.addBtnListener();
        this.addRotListener();

        // btn hint animation
        this.btn_hint.runAction(cc.sequence(cc.scaleTo(0.5, 1.3), cc.scaleTo(0.5, 1)).repeatForever());
    }

    startGame(lvlIdx?: number) {
        lvlIdx && (this.level = lvlIdx);
        if (this.level > Global.config.MaxLevel) {
            console.log('over max level', this.level);
            this.node.active = false;
            this.LvlSelectView.active = true;
            return;
        }
        console.log('gameStart. level: ', this.level);
        // update
        this.lvlLabel.getComponent(cc.Label).string = '第 ' + this.level + ' 关';
        // load
        this.loadTimeStamp = Date.now();
        this.loadStage(this.level, this.loadTimeStamp, false);
    }

    nextGame() {
        this.level++;
        if (this.level > Global.config.MaxLevel) {
            console.log('over max level', this.level);
            this.node.active = false;
            this.LvlSelectView.active = true;
            return;
        }
        this.startGame();
    }

    restartGame() {
        // reset items
        Object.keys(this.items).forEach(key => {
            this.items[key].runAction(cc.moveTo(0.2, this.lvlConf.question[key].posX, this.lvlConf.question[key].posY));
            this.items[key].runAction(cc.rotateTo(0.2, this.lvlConf.question[key].rot));
        });
        this.selected && (this.items[this.selected].color = new cc.Color(255, 255, 255));
        // reset
        this.reset();
        if (Const.TutorialLvl.indexOf(this.level) >= 0) {
            // show tutorial
            this.schedule(() => { this.showTutorial(this.level) }, 0.21, 0);
        }
    }

    private reset() {
        this.isWin = false;
        !this.winBar && (this.winBar = this.progressBar.getComponent(cc.ProgressBar));
        this.completeIcon.active = false;
        this.winBar.progress = 0;
        this.selected = null;
        this.btn_restart.active = false;
        this.btn_back.active = true;
        this.tips.active = false;
        this.btn_hint.active = true;
        this.flash.active = false;
        this.canTouch = true;
    }

    // preload(lvlIdx: number) {
    //     if (lvlIdx > Global.config.MaxLevel || lvlIdx === this.preLoadLvl) return;
    //     console.log('preload start. level: ', lvlIdx);

    //     this.preLoadLvl = lvlIdx;
    //     this.resCnt_preload = 0;
    //     cc.loader.load(GameView.BaseUrl + 'question/level' + lvlIdx + '/config.json', (err, res) => {
    //         if (err) { console.error('load conf error:', err) };
    //         this.lvlConf_preload = res;
    //         console.log('>>> [preload] conf: ', this.lvlConf_preload);

    //         // reset
    //         this.items_preload = {};
    //         this.itemsFrame_preload = {};

    //         // solution
    //         !this.lvlSelectScript && (this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect));
    //         cc.loader.load(GameView.BaseUrl + 'solution/' + this.lvlSelectScript.titleJson[lvlIdx] + '.png', (error, res1) => {
    //             if (error) { console.error('preload solution error:', this.lvlSelectScript.titleJson[lvlIdx], error) };
    //             (this.preLoadLvl == lvlIdx) && this.resCnt_preload++;
    //             console.log('preload solution done. level: ' + lvlIdx + ' loadedCnt: ' + this.resCnt_preload + '/2');
    //             this.tipsFrame_preload = new cc.SpriteFrame(res1);
    //         });

    //         // question item
    //         let urls = [], names = [];
    //         Object.keys(this.lvlConf_preload.question).forEach(v => {
    //             names.push(v);
    //             urls.push(GameView.BaseUrl + 'question/level' + lvlIdx + '/' + v + '.png');
    //         });
    //         console.log('>>> [preload] urls:', urls);
    //         cc.loader.load(urls, (err, assets) => {
    //             if (err) { console.error('preload question error:', lvlIdx, err) };
    //             (this.preLoadLvl == lvlIdx) && this.resCnt_preload++;
    //             console.log('preload question done. level: ' + lvlIdx + ' loadedCnt: ' + this.resCnt_preload + '/2');
    //             // get each item
    //             urls.forEach((url, i) => {
    //                 let tex: cc.Texture2D = assets.getContent(url);
    //                 if (this.lvlConf_preload.question[names[i]]) {
    //                     let item = new cc.Node(names[i]);
    //                     let sp = item.addComponent(cc.Sprite);
    //                     sp.spriteFrame = new cc.SpriteFrame(tex);
    //                     this.items_preload[names[i]] = item;
    //                     this.itemsFrame_preload[names[i]] = 'question';
    //                     // set transform
    //                     item.x = this.lvlConf_preload.question[names[i]].posX;
    //                     item.y = this.lvlConf_preload.question[names[i]].posY;
    //                     item.rotation = (this.lvlConf_preload.question[names[i]].rot + 360) % 360;
    //                     item.zIndex = this.lvlConf_preload.question[names[i]].zIndex;
    //                     // add listener
    //                     this.addItemListener(item);
    //                 }
    //             })
    //             // set win step
    //             let len = Object.keys(this.lvlConf_preload.solution).length;
    //             this.winStep_preload = 0.9 / (len * len); // (len*(len-1))/(1*2) * 2 + len
    //         });
    //     });
    // }

    private showNetErr() {
        CC_WECHATGAME && wx.showToast && wx.showToast({
            title: '请检查网络',
            icon: 'fail',
        })
    }

    private hideTutorial() {
        this.mask1.active = false;
        this.mask2.active = false;
        this.line_left.active = false;
        this.line_right.active = false;
        this.line_rotate.active = false;
        this.finger.active = false;
        this.finger.stopAllActions();
        this.unscheduleAllCallbacks();
    }

    private showTutorial(lvlIdx: number) {
        this.hideTutorial();
        switch (lvlIdx) {
            case 1:
                this.mask1.active = true;
                let item = this.container.getChildByName('3');
                this.line_left.active = true;
                this.line_left.x = item.x;
                this.line_left.y = item.y;
                // finger animation
                this.finger.active = true;
                let srcPos1 = item.getPosition().clone();
                let dstPos1 = new cc.Vec2(this.lvlConf.solution['3'].posX, this.lvlConf.solution['3'].posY);
                let tmpPos1 = new cc.Vec2((this.lvlConf.solution['3'].posX - item.x) / 2 - 200, (this.lvlConf.solution['3'].posY - item.y) / 3);
                this.finger.setPosition(srcPos1);
                let play1 = () => {
                    this.finger.setPosition(srcPos1);
                    this.finger.runAction(cc.bezierTo(0.5, [srcPos1, tmpPos1, dstPos1]));
                }
                this.schedule(play1, 1, cc.macro.REPEAT_FOREVER, 0);
                // add listener
                item && this.addItemListener(item, () => {
                    this.setSelectFramePos();
                    this.updateProgress();
                    item.color = new cc.Color(255, 255, 255);
                    item.off(cc.Node.EventType.TOUCH_START), item.off(cc.Node.EventType.TOUCH_MOVE), item.off(cc.Node.EventType.TOUCH_CANCEL), item.off(cc.Node.EventType.TOUCH_END);
                    this.selected = null;
                    item.runAction(cc.moveTo(0.2, this.lvlConf.solution['3'].posX, this.lvlConf.solution['3'].posY));
                    this.schedule(() => {
                        this.line_left.active = false;
                        this.finger.stopAllActions();
                        this.unscheduleAllCallbacks();
                        // this.unschedule(play1);
                        let item2 = this.container.getChildByName('1');
                        item2 && this.addItemListener(item2);
                        this.line_right.active = true;
                        this.line_right.x = item2.x;
                        this.line_right.y = item2.y;
                        // finger animation
                        let srcPos2 = item2.getPosition().clone();
                        let dstPos2 = new cc.Vec2(this.lvlConf.solution['1'].posX, this.lvlConf.solution['1'].posY);
                        let tmpPos2 = new cc.Vec2((this.lvlConf.solution['1'].posX - item2.x) / 2 + 300, (this.lvlConf.solution['1'].posY - item2.y) / 3);
                        this.finger.setPosition(srcPos2);
                        let play2 = () => {
                            this.finger.setPosition(srcPos2);
                            this.finger.runAction(cc.bezierTo(0.5, [srcPos2, tmpPos2, dstPos2]));
                        }
                        this.schedule(play2, 1, cc.macro.REPEAT_FOREVER, 0);
                    }, 0.2, 0);
                });
                break;
            case 5:
                this.mask1.active = true;
                let item3 = this.container.getChildByName('3');
                this.line_left2.active = true;
                this.line_left2.x = item3.x;
                this.line_left2.y = item3.y;
                // finger animation
                this.finger.active = true;
                let srcPos = item3.getPosition().clone();
                let dstPos = new cc.Vec2(this.lvlConf.solution['3'].posX, this.lvlConf.solution['3'].posY);
                let tmpPos = new cc.Vec2((this.lvlConf.solution['3'].posX - item3.x) / 2 - 300, (this.lvlConf.solution['3'].posY - item3.y) / 3);
                this.finger.setPosition(srcPos);
                let play3 = () => {
                    this.finger.setPosition(srcPos);
                    this.finger.runAction(cc.bezierTo(0.5, [srcPos, tmpPos, dstPos]));
                }
                this.schedule(play3, 1, cc.macro.REPEAT_FOREVER, 0);
                // add listener
                item3 && this.addItemListener(item3, () => {
                    this.setSelectFramePos();
                    this.updateProgress();
                    item3.color = new cc.Color(255, 255, 255);
                    item3.off(cc.Node.EventType.TOUCH_START), item3.off(cc.Node.EventType.TOUCH_MOVE), item3.off(cc.Node.EventType.TOUCH_CANCEL), item3.off(cc.Node.EventType.TOUCH_END);
                    this.selected = null;
                    item3.runAction(cc.moveTo(0.2, this.lvlConf.solution['3'].posX, this.lvlConf.solution['3'].posY));
                    this.schedule(() => {
                        this.line_left2.active = false;
                        this.finger.stopAllActions();
                        this.unscheduleAllCallbacks();
                        // this.unschedule(play1);
                        let item2 = this.container.getChildByName('1');
                        this.line_right2.active = true;
                        this.line_right2.x = item2.x;
                        this.line_right2.y = item2.y;
                        // finger animation
                        let srcPos2 = item2.getPosition().clone();
                        let dstPos2 = new cc.Vec2(this.lvlConf.solution['1'].posX, this.lvlConf.solution['1'].posY);
                        let tmpPos2 = new cc.Vec2((this.lvlConf.solution['1'].posX - item2.x) / 2 + 300, (this.lvlConf.solution['1'].posY - item2.y) / 3);
                        this.finger.setPosition(srcPos2);
                        let play2 = () => {
                            this.finger.setPosition(srcPos2);
                            this.finger.runAction(cc.bezierTo(0.5, [srcPos2, tmpPos2, dstPos2]));
                        }
                        this.schedule(play2, 1, cc.macro.REPEAT_FOREVER, 0);
                        // add listener
                        item2 && this.addItemListener(item2, () => {
                            this.setSelectFramePos();
                            this.updateProgress();
                            item2.runAction(cc.moveTo(0.2, this.lvlConf.solution['1'].posX, this.lvlConf.solution['1'].posY));
                            this.schedule(() => {
                                this.mask1.active = false;
                                this.mask2.active = true;
                                this.line_right2.active = false;
                                this.finger.stopAllActions();
                                this.unscheduleAllCallbacks();
                                // this.unschedule(play1);
                                this.line_rotate.active = true;
                                this.line_rotate.x = item2.x;
                                this.line_rotate.y = item2.y;
                                // finger animation
                                let srcPos3 = new cc.Vec2(item2.x + 150, item2.y + 50);
                                let tmpPos3 = new cc.Vec2(item2.x + 120, item2.y - 120);
                                let dstPos3 = new cc.Vec2(item2.x - 50, item2.y - 150);
                                this.finger.setPosition(srcPos3);
                                let play2 = () => {
                                    this.finger.setPosition(srcPos3);
                                    this.finger.runAction(cc.bezierTo(0.5, [srcPos3, tmpPos3, dstPos3]));
                                }
                                this.schedule(play2, 1, cc.macro.REPEAT_FOREVER, 0);
                            }, 0.2, 0);
                        });
                    }, 0.2, 0);
                });
                break;
            default:
                break;
        }
    }

    loadStage(lvlIdx: number, timeStamp: number, isPreload: boolean = false) {
        let log_prefix = isPreload ? 'preload' : 'load';
        let key_suffix = isPreload ? '_preload' : '';
        let isTutorialLvl: boolean = Const.TutorialLvl.indexOf(lvlIdx) >= 0;

        // reset
        this.reset();

        // [load] already preloaded: assign preload to load
        if (!isPreload && this.level_preload == lvlIdx && this.resCnt_preload >= 2) {
            console.log('show preload', this.lvlConf_preload);
            // level config
            this.lvlConf = this.lvlConf_preload;
            this.lvlConf_preload = null;
            this.title.getComponent(cc.Label).string = this.lvlConf.title;
            this.title.active = true;
            // play title animation
            this.title.scale = 2.5;
            this.title.runAction(cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(0.05, 1.05), cc.scaleTo(0.05, 1)));

            // solution
            this.tipsFrame = this.tipsFrame_preload;
            this.tipsFrame_preload = null;
            this.tips.getComponent(cc.Sprite).spriteFrame = this.tipsFrame.clone();
            !this.overScript && (this.overScript = this.OverView.getComponent(OverView));
            this.overScript.setFrame(lvlIdx);
            // question item
            this.items = this.items_preload;
            this.items_preload = null;
            this.itemsFrame = this.itemsFrame_preload;
            this.itemsFrame_preload = null;
            Object.keys(this.items).forEach(key => {
                this.container.addChild(this.items[key]);
            });
            this.winStep = this.winStep_preload;

            // show tutorial
            isTutorialLvl && this.showTutorial(lvlIdx);

            // preload next lvl
            this.level_preload = lvlIdx + 1;
            this.loadTimeStamp_preload = Date.now();
            this.loadStage(this.level_preload, this.loadTimeStamp_preload, true);

            return;
        }

        // [load] level lvlIdx unloaded or [preload]
        !isPreload && CC_WECHATGAME && wx.showLoading && wx.showLoading({ title: '加载中' });
        console.log(log_prefix + ' start. level: ', lvlIdx);
        this['resCnt' + key_suffix] = 0;
        cc.loader.load(GameView.BaseUrl + 'question/level' + lvlIdx + '/config.json', (err, confJson) => {
            if (err) {
                console.error(log_prefix + ' conf error:', err);
                if (!isPreload && CC_WECHATGAME) {
                    wx.hideLoading && wx.hideLoading();
                    this.showNetErr();
                    return;
                }
            };
            // 已重新发起加载，前次加载弃用
            if (timeStamp !== this['loadTimeStamp' + key_suffix]) return;

            this['lvlConf' + key_suffix] = confJson;
            console.log('>>> [' + log_prefix + '] conf: ', this['lvlConf' + key_suffix]);

            if (!isPreload) {
                this.title.getComponent(cc.Label).string = this.lvlConf.title;
                this.title.active = true;
                // play title animation
                this.title.scale = 2.5;
                this.title.runAction(cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(0.05, 1.05), cc.scaleTo(0.05, 1)));
            }

            this['items' + key_suffix] = {};
            this['itemsFrame' + key_suffix] = {};

            // solution
            !this.lvlSelectScript && (this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect));
            cc.loader.load(GameView.BaseUrl + 'solution/' + this.lvlSelectScript.titleJson[lvlIdx] + '.png', (error, tex) => {
                if (error) {
                    console.error(log_prefix + ' solution error:', this.lvlSelectScript.titleJson[lvlIdx], error);
                    if (!isPreload && CC_WECHATGAME) {
                        wx.hideLoading && wx.hideLoading();
                        this.showNetErr();
                        return;
                    }
                };
                // 已重新发起加载，前次加载弃用
                if (timeStamp !== this['loadTimeStamp' + key_suffix]) return;

                this['resCnt' + key_suffix]++;
                console.log(log_prefix + ' solution done. level: ' + lvlIdx + ' loadedCnt: ' + this['resCnt' + key_suffix] + '/2');
                this['tipsFrame' + key_suffix] = new cc.SpriteFrame(tex);
                if (!isPreload) {
                    this.tips.getComponent(cc.Sprite).spriteFrame = this.tipsFrame.clone();
                    !this.overScript && (this.overScript = this.OverView.getComponent(OverView));
                    this.overScript.setFrame(lvlIdx);
                }
            });

            // question item
            let urls = [], names = [];
            Object.keys(this['lvlConf' + key_suffix].question).forEach(v => {
                names.push(v);
                urls.push(GameView.BaseUrl + 'question/level' + lvlIdx + '/' + v + '.png');
            });
            console.log('>>> [' + log_prefix + '] urls:', urls);
            cc.loader.load(urls, (err2, assets) => {
                if (err2) {
                    console.error(log_prefix + ' question error:', lvlIdx, err2);
                    if (!isPreload && CC_WECHATGAME) {
                        wx.hideLoading && wx.hideLoading();
                        this.showNetErr();
                        return;
                    }
                };
                // 已重新发起加载，前次加载弃用
                if (timeStamp !== this['loadTimeStamp' + key_suffix]) return;
                // 加载完成
                !isPreload && CC_WECHATGAME && wx.hideLoading && wx.hideLoading();

                this['resCnt' + key_suffix]++;
                console.log(log_prefix + ' question done. level: ' + lvlIdx + ' loadedCnt: ' + this['resCnt' + key_suffix] + '/2');
                // get each item
                urls.forEach((url, idx) => {
                    let tex: cc.Texture2D = assets.getContent(url);
                    // if (this['lvlConf' + key_suffix].question[names[idx]]) {
                    // create node
                    let item = new cc.Node(names[idx]);
                    let sp = item.addComponent(cc.Sprite);
                    sp.spriteFrame = new cc.SpriteFrame(tex);
                    this['items' + key_suffix][names[idx]] = item;
                    this['itemsFrame' + key_suffix][names[idx]] = 'question';
                    // set transform
                    item.x = this['lvlConf' + key_suffix].question[names[idx]].posX;
                    item.y = this['lvlConf' + key_suffix].question[names[idx]].posY;
                    item.rotation = (this['lvlConf' + key_suffix].question[names[idx]].rot + 360) % 360;
                    item.zIndex = this['lvlConf' + key_suffix].question[names[idx]].zIndex;
                    // add listener
                    !isTutorialLvl && this.addItemListener(item);
                    // add to scene
                    !isPreload && this.container.addChild(item);
                    // }
                });
                // set win step
                let len = Object.keys(this['lvlConf' + key_suffix].solution).length;
                this['winStep' + key_suffix] = 0.9 / (len * len); // (len*(len-1))/(1*2) * 2 + len

                // show tutorial
                !isPreload && isTutorialLvl && this.showTutorial(lvlIdx);

                // preload next lvl
                if (!isPreload) {
                    this.level_preload = lvlIdx + 1;
                    this.loadTimeStamp_preload = Date.now();
                    this.loadStage(this.level_preload, this.loadTimeStamp_preload, true);
                }
            });
        });
    }

    private clearStage() {
        console.log('clearStage');
        this.title.active = false;
        this.container.removeAllChildren();
    }

    // add item listener: select and transpostion
    private addItemListener(item: cc.Node, cb?: Function) {
        item.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;

            this.selected && (this.items[this.selected].color = new cc.Color(255, 255, 255));
            this.selected = item.name;
            item.color = new cc.Color(180, 180, 180);
            // set pos
            this.prevPos = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation()).clone();
            this.posBeforeMove = item.getPosition().clone();
        });
        item.on(cc.Node.EventType.TOUCH_MOVE, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;

            let currPos: cc.Vec2 = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation());
            item.x += (currPos.x - this.prevPos.x);
            item.y += (currPos.y - this.prevPos.y);
            // update pos
            this.prevPos.x = currPos.x;
            this.prevPos.y = currPos.y;
            this.setSelectFramePos();
            // update progressBar
            this.updateProgress();
        });
        item.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;

            this.selected = item.name;
            // is pos valid
            if (this.itemsFrame[this.selected]) {
                cb && this.itemsFrame[this.selected] == 'solution' && cb();
                AudioMgr.instance.play('move');
                // on btn_restart
                !this.btn_restart.active && (this.btn_restart.active = true);
                // update progressBar
                this.updateProgress();
                // win check
                this.winCheck();
            } else {
                AudioMgr.instance.play('close');
                // pos rollback
                item.runAction(cc.moveTo(0.2, this.posBeforeMove));
                this.schedule(() => {
                    this.setSelectFramePos();
                    // update progressBar
                    this.updateProgress();
                }, 0.2, 0);
            }
            this.prevProgress = this.winBar.progress;
        });
        item.on(cc.Node.EventType.TOUCH_CANCEL, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;

            this.selected = item.name;
            // is pos valid
            if (this.itemsFrame[this.selected]) {
                AudioMgr.instance.play('move');
                cb && this.itemsFrame[this.selected] == 'solution' && cb();
                // on btn_restart
                !this.btn_restart.active && (this.btn_restart.active = true);
                // update progressBar
                this.updateProgress();
                // win check
                this.winCheck();
            } else {
                AudioMgr.instance.play('close');
                // pos rollback
                item.runAction(cc.moveTo(0.2, this.posBeforeMove));
                this.schedule(() => {
                    this.setSelectFramePos();
                    // update progressBar
                    this.updateProgress();
                }, 0.2, 0);
            }
            this.prevProgress = this.winBar.progress;
        });
    }

    // add stage listener: rotation
    private addRotListener() {
        this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                // set rot
                let pos = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation());
                let deltaX = pos.x - this.items[this.selected].x;
                let deltaY = pos.y - this.items[this.selected].y;
                this.prevRot = Math.atan2(deltaX, deltaY) / Math.PI * 180;
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                // update rot
                let pos = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation());
                let deltaX = pos.x - this.items[this.selected].x;
                let deltaY = pos.y - this.items[this.selected].y;
                let currRot = Math.atan2(deltaX, deltaY) / Math.PI * 180;
                let deltaRot = currRot - this.prevRot;
                deltaRot > 180 && (deltaRot -= 360);
                deltaRot < -180 && (deltaRot += 360);
                this.items[this.selected].rotation += deltaRot;
                this.items[this.selected].rotation = this.items[this.selected].rotation % 360;
                this.prevRot = currRot;
                // update progressBar
                this.updateProgress();
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_END, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                this.winCheck();
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                this.winCheck();
            }
        });
    }

    private addBtnListener() {
        // btn back
        this.btn_back.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation();
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            this.btn_back.color = new cc.Color(180, 180, 180);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_back.color = new cc.Color(255, 255, 255);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_back.color = new cc.Color(255, 255, 255);

            AudioMgr.instance.play('button');
            this.clearStage();
            this.hideTutorial();
            this.node.active = false;
            this.LvlSelectView.active = true;
        });
        // btn restart
        this.btn_restart.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation();
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            this.btn_restart.color = new cc.Color(180, 180, 180);
        });
        this.btn_restart.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_restart.color = new cc.Color(255, 255, 255);
        });
        this.btn_restart.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_restart.color = new cc.Color(255, 255, 255);
            AudioMgr.instance.play('button');
            this.restartGame();
        });
        // btn hint
        this.btn_hint.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation();
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            let onTouch = () => {
                AudioMgr.instance.play('hint');
                this.btn_hint.active = false;
                this.tips.active = true;
            }
            if (CC_WECHATGAME) {
                if (Global.config.game_hint == 1 && this.canTouch) {
                    // 未超过每天视频观看次数
                    if (!Reward.instance.isOverVideo()) {
                        this.canTouch = false;
                        Reward.instance.video({
                            pos: "game_hint",
                            success: () => { onTouch(); },
                            fail: () => {
                                Reward.instance.share({
                                    pos: "game_hint",
                                    success: () => { onTouch(); },
                                });
                            },
                            complete: () => {
                                this.canTouch = true;
                            }
                        });
                    }
                    else {
                        Reward.instance.share({
                            pos: "game_hint",
                            success: () => { onTouch(); },
                        });
                    }
                }
                // share
                Global.config.game_hint == 2 && Reward.instance.share({
                    pos: "game_hint",
                    success: () => { onTouch(); },
                });
            } else {
                onTouch();
            }
        });
        this.btn_hint.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
        });
        this.btn_hint.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            if (this.touchID != e.getID()) return;
            this.touchID = null;
        });
    }

    // set selected pos in frame: question, solution or outside
    private setSelectFramePos() {
        let pos_question = this.frame_question.parent.convertToNodeSpace(this.items[this.selected].getPosition());
        let pos_solution = this.frame_solution.parent.convertToNodeSpace(this.items[this.selected].getPosition());
        // in frame soulution
        if (Math.abs(pos_solution.x - this.frame_solution.x) < (this.frame_solution.width / 2 - Math.min(this.items[this.selected].width, this.items[this.selected].height, this.frame_solution.height * 0.15) / 2)
            && Math.abs(pos_solution.y - this.frame_solution.y) < (this.frame_solution.height / 2 - Math.min(this.items[this.selected].width, this.items[this.selected].height, this.frame_solution.height * 0.15) / 2)) {
            this.itemsFrame[this.selected] = 'solution';
        }
        // in frame question
        else if (Math.abs(pos_question.x - this.frame_question.x) < (this.frame_question.width / 2 - Math.min(this.items[this.selected].width, this.items[this.selected].height, this.frame_question.height * 0.15) / 2)
            && Math.abs(pos_question.y - this.frame_question.y) < (this.frame_question.height / 2 - Math.min(this.items[this.selected].width, this.items[this.selected].height, this.frame_question.height * 0.15) / 2)) {
            this.itemsFrame[this.selected] = 'question';
        } else { // outside
            this.itemsFrame[this.selected] = null;
        }
    }

    private updateProgress() {
        let winCnt = 0;
        this.winFlag = true;
        let solutionItems = {};
        Object.keys(this.itemsFrame).forEach(key => {
            // all items in frame solution
            if (this.itemsFrame[key] == 'solution') {
                // right item
                if (this.lvlConf.solution[key]) {
                    // 1. check exist
                    winCnt += this.winStep;
                    Object.keys(solutionItems).forEach(keySol => {
                        // 2. win check for two items
                        let rot1 = this.lvlConf.solution[key].rot;
                        let rot2 = this.lvlConf.solution[keySol].rot;
                        // a. null: for angle 0 - 360
                        if (rot1 == null) {
                            let cnt = this.checkTwoItems(keySol, key);
                            winCnt += this.winStep * cnt;
                            cnt < 2 && (this.winFlag = false);
                        }
                        else if (rot2 == null) {
                            let cnt = this.checkTwoItems(key, keySol);
                            winCnt += this.winStep * cnt;
                            cnt < 2 && (this.winFlag = false);
                        }
                        // b. number or Array<numer>
                        else {
                            let cnt = Math.min(this.checkTwoItems(keySol, key), this.checkTwoItems(key, keySol));
                            winCnt += this.winStep * cnt;
                            cnt < 2 && (this.winFlag = false);
                        }
                    });
                    solutionItems[key] = this.items[key];
                }
                // wrong item
                else {
                    winCnt -= this.winStep * 2;
                    this.winFlag = false;
                }
            }
            // not all right items found
            else if (this.lvlConf.solution[key]) {
                // console.log('unfound item:', key)
                this.winFlag = false;
            }
        });
        winCnt >= 1 && (winCnt = 0.9);
        winCnt < 0 && (winCnt = 0);
        this.winBar.progress = this.winFlag ? 1 : winCnt;
        this.completeIcon.active = this.winBar.progress == 1 ? true : false;
    }

    // check pos and angle for two items, return value: 0, 1, 2
    private checkTwoItems(key1, key2): number {
        let cnt = 0;
        let rot1 = this.lvlConf.solution[key1].rot;
        let rot2 = this.lvlConf.solution[key2].rot;
        let deltaRot = ((this.items[key2].rotation - this.items[key1].rotation) + 720) % 360;
        // a. angle type null: 无指向性, 仅判断距离
        if (rot1 == null) {
            cnt++;
            this.checkPos(key1, key2, rot1) && cnt++;
        }
        // b. angle1 type number: conver to node space: 参照item1局部坐标系标记item2位置
        else if (typeof rot1 == 'number') {
            /** check pos */
            this.checkPos(key1, key2, rot1) && cnt++;
            /** check rot */
            if (rot2 == null) {
                cnt++;
            }
            else if (typeof rot2 == 'number') {
                if (this.checkRot(rot1, rot2, deltaRot)) {
                    cnt++;
                }
            } else {
                for (let j = 0; j < rot2.length; j++) {
                    if (this.checkRot(rot1, rot2[j], deltaRot)) {
                        cnt++;
                        break;
                    }
                };
            }
        }
        // c. angle1 type Array<number>: conver to node space: 参照item1局部坐标系标记item2位置
        else {
            let flag_pos = true, flag_rot = true;
            for (let i = 0; (flag_pos || flag_rot) && i < rot1.length; i++) {
                /** check pos */
                if (flag_pos) {
                    if (this.checkPos(key1, key2, rot1[i])) {
                        flag_pos = false;
                        cnt++;
                    }
                }
                /** check rot */
                if (flag_rot) {
                    if (rot2 == null) {
                        flag_rot = false;
                        cnt++;
                    }
                    else if (typeof rot2 == 'number') {
                        if (this.checkRot(rot1[i], rot2, deltaRot)) {
                            flag_rot = false;
                            cnt++;
                        }
                    } else {
                        for (let j = 0; flag_rot && j < rot2.length; j++) {
                            if (this.checkRot(rot1[i], rot2[j], deltaRot)) {
                                flag_rot = false;
                                cnt++;
                            }
                        }
                    }
                }
            }
        }
        return cnt;
    }

    private checkPos(key1, key2, rot1): boolean {
        let dist;
        let pos1 = this.items[key1].convertToWorldSpaceAR(new cc.Vec2(0, 0));
        let pos2 = this.items[key2].convertToWorldSpaceAR(new cc.Vec2(0, 0));
        let vecX = pos2.x - pos1.x;
        let vecY = pos2.y - pos1.y;
        let vecX_conf = this.lvlConf.solution[key2].posX - this.lvlConf.solution[key1].posX;
        let vecY_conf = this.lvlConf.solution[key2].posY - this.lvlConf.solution[key1].posY;
        // 角度360度有效，无指向性
        if (rot1 == null) {
            let dist1 = Math.sqrt(vecX * vecX + vecY * vecY);
            let dist2 = Math.sqrt(vecX_conf * vecX_conf + vecY_conf * vecY_conf);
            dist = Math.abs(dist1 - dist2);
        } else {
            // convert item2 to item1 space
            let sin = Math.sin(this.items[key1].rotation * Math.PI / 180);
            let cos = Math.cos(this.items[key1].rotation * Math.PI / 180);
            let x1 = cos * vecX - sin * vecY;
            let y1 = sin * vecX + cos * vecY;
            // convert answer_item2 to answer_item1 space
            sin = Math.sin(rot1 * Math.PI / 180);
            cos = Math.cos(rot1 * Math.PI / 180);
            let x2 = cos * vecX_conf - sin * vecY_conf;
            let y2 = sin * vecX_conf + cos * vecY_conf;
            // calc dist
            dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        }
        // check
        return dist < Const.WinDeltaDist
    }

    private checkRot(rot1, rot2, deltaRot): boolean {
        let angle = Math.abs(deltaRot - (rot2 - rot1 + 720) % 360);
        angle = Math.min(angle, Math.abs(angle - 360));
        if (angle < Const.WinDeltaAngle) {
            return true;
        }
        return false;
    }

    private winCheck() {
        if (!this.isWin && this.winBar.progress >= 1) {
            // block touch
            this.canTouch = false;
            // play win animation
            Object.keys(this.lvlConf.solution).forEach(key => {
                this.items[key].runAction(cc.moveTo(0.2, this.lvlConf.solution[key].posX, this.lvlConf.solution[key].posY));
                if (this.lvlConf.solution[key].rot != null) {
                    typeof (this.lvlConf.solution[key].rot) == 'number' ? this.items[key].runAction(cc.rotateTo(0.2, this.lvlConf.solution[key].rot)) : this.items[key].runAction(cc.rotateTo(0.2, this.lvlConf.solution[key].rot[0]));
                }
            });
            // reset
            this.selected && (this.items[this.selected].color = new cc.Color(255, 255, 255));
            this.tips.active = false;
            // hide
            this.btn_hint.active = false;
            this.btn_restart.active = false;
            this.btn_back.active = false;
            this.hideTutorial();
            // update
            this.isWin = true;
            if (this.level == Global.gameData.level) {
                Global.gameData.level++;
                Loading.updateGameData(true);
                // this.lvlSelectScript.updateList(Global.gameData.level - 1, Global.gameData.level);
                this.LvlSelectView.getChildByName('scrollView').getComponent(ScrollViewBetter).updateItemsContent();
            }
            // play sound
            AudioMgr.instance.play('win');
            // show win animation
            this.flash.active = true;
            this.schedule(() => { this.flash.rotation += 1.5 }, 0.03, 100);
            // show overView
            let showNext: Function = () => {
                // clear
                this.clearStage();
                this.unschedule(showNext);
                this.flash.active = false;
                // this.node.active = false;
                this.OverView.active = true;
            };
            this.scheduleOnce(showNext, 2.5);
            // post score
            CC_WECHATGAME && ws.postGameScore({
                key: 'clearStage',
                id: Date.now() + "",
                score: Global.gameData.level,
            })
        }
    }

    setState(state: number) {
        this.state = state;
    }

    // update (dt) {}
}
