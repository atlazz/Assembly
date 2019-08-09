import Global from "../Global";
import * as Const from "../Const";
import LvlSelect from "./LvlSelect";
import OverView from "./OverView";
import ScrollViewBetter from "../component/ScrollViewBetter";
import AudioMgr from "../component/AudioMgr";
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
    HomeView: cc.Node = null;
    @property(cc.Node)
    LvlSelectView: cc.Node = null;
    @property(cc.Node)
    OverView: cc.Node = null;

    static BaseUrl: string = "textures/game/";

    private lvlSelectScript: LvlSelect;
    private overScript: OverView;

    private state: number;
    private level: number;
    private lvlConf;
    private items;
    private itemsFrame;
    private selected: string;
    private prevPos: cc.Vec2;
    private prevRot: number;
    private posBeforeMove: cc.Vec2;
    private winBar: cc.ProgressBar;
    private winStep: number = 0.1;
    private prevProgress: number;
    private winFlag: boolean;
    private isWin: boolean;

    private lvlConf_preload;
    private items_preload;
    private itemsFrame_preload;
    private tipsFrame_preload;
    private winStep_preload: number = 0.1;
    public preLoadLvl: number;
    private loadedCnt: number;

    private canTouch: boolean = true;
    // private eventTouch: cc.Event.EventTouch = null;
    // private touchDist: number = 0.1;
    private touchID: number = null;

    // onLoad () {}

    start() {
        // get script
        !this.lvlSelectScript && (this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect));
        this.overScript = this.OverView.getComponent(OverView);

        this.addBtnListener();
        this.addRotListener();

        // btn hint animation
        this.btn_hint.runAction(cc.sequence(cc.scaleTo(0.5, 1.3), cc.scaleTo(0.5, 1)).repeatForever());
    }

    onEnable() {
        // switch (this.state) {
        //     case Const.State.PLAYING:
        //         this.gameStart();
        //         break;
        // }
    }

    preload(lvlIdx: number) {
        if (lvlIdx > Global.config.MaxLevel) return;

        this.preLoadLvl = lvlIdx;
        this.loadedCnt = 0;
        cc.loader.load(GameView.BaseUrl + 'question/level' + lvlIdx + '/config.json', (err, res) => {
            if (err) { console.error('load error:', err) };
            this.lvlConf_preload = res;
            console.log('preload done. level: ', lvlIdx, this.lvlConf_preload);

            // reset
            this.items_preload = {};
            this.itemsFrame_preload = {};

            // solution
            !this.lvlSelectScript && (this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect));
            cc.loader.load(GameView.BaseUrl + 'solution/' + this.lvlSelectScript.titleJson[lvlIdx] + '.png', (error, res1) => {
                if (error) { console.error('load error:', this.lvlSelectScript.titleJson[lvlIdx], error) };
                this.tipsFrame_preload = new cc.SpriteFrame(res1);
                (this.preLoadLvl == lvlIdx) && this.loadedCnt++;
            });

            // question item
            let urls = [], names = [];
            Object.keys(this.lvlConf_preload.question).forEach(v => {
                names.push(v);
                urls.push(GameView.BaseUrl + 'question/level' + lvlIdx + '/' + v + '.png');
            });
            cc.loader.load(urls, (err, assets) => {
                if (err) { console.error('load error:', lvlIdx, err) };
                (this.preLoadLvl == lvlIdx) && this.loadedCnt++;
                // get each item
                urls.forEach((url, i) => {
                    let tex: cc.Texture2D = assets.getContent(url);
                    if (this.lvlConf_preload.question[names[i]]) {
                        let item = new cc.Node(names[i]);
                        let sp = item.addComponent(cc.Sprite);
                        sp.spriteFrame = new cc.SpriteFrame(tex);
                        this.items_preload[names[i]] = item;
                        this.itemsFrame_preload[names[i]] = 'question';
                        // set transform
                        item.x = this.lvlConf_preload.question[names[i]].posX;
                        item.y = this.lvlConf_preload.question[names[i]].posY;
                        item.rotation = (this.lvlConf_preload.question[names[i]].rot + 360) % 360;
                        item.zIndex = this.lvlConf_preload.question[names[i]].zIndex;
                        // add listener
                        this.addItemListener(item);
                    }
                })
                // set win step
                let len = Object.keys(this.lvlConf_preload.solution).length;
                let c_n_i = 1, n = len, i = 2;
                while (i > 0) {
                    c_n_i *= n / i;
                    n--;
                    i--;
                }
                this.winStep_preload = Math.max(0.05, 0.8 / (c_n_i * 2 + len));
            });
        });
    }

    gameStart() {
        if (this.level > Global.config.MaxLevel) {
            console.log('over max level', this.level);
            this.node.active = false;
            this.LvlSelectView.active = true;
            return;
        }
        console.log('gameStart. currLvl: ', this.level);
        // update
        this.lvlLabel.getComponent(cc.Label).string = '第 ' + this.level + ' 关';
        // load
        this.loadStage();
    }

    private reset() {
        this.isWin = false;
        !this.winBar && (this.winBar = this.progressBar.getComponent(cc.ProgressBar));
        this.completeIcon.active = false;
        this.title.getComponent(cc.Label).string = this.lvlConf.title;
        this.winBar.progress = 0;
        this.selected = null;
        this.btn_restart.active = false;
        this.btn_back.active = true;
        this.tips.active = false;
        this.btn_hint.active = true;
        this.flash.active = false;
        this.canTouch = true;
    }

    private loadStage() {
        // already loaded
        if (this.preLoadLvl == this.level && this.loadedCnt >= 2) {
            console.log('show preload', this.lvlConf_preload);

            // level config
            this.lvlConf = Object.assign({}, this.lvlConf_preload);

            /** reset */
            this.reset();

            // play title animation
            this.title.scale = 2.5;
            this.title.runAction(cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(0.05, 1.05), cc.scaleTo(0.05, 1)));

            /** set preload */
            // solution
            this.tips.getComponent(cc.Sprite).spriteFrame = this.tipsFrame_preload;
            !this.overScript && (this.overScript = this.OverView.getComponent(OverView));
            this.overScript.setFrame(this.tipsFrame_preload);
            // question item
            this.items = Object.assign({}, this.items_preload);
            this.itemsFrame = Object.assign({}, this.items_preload);
            Object.keys(this.items_preload).forEach(key => {
                this.container.addChild(this.items_preload[key]);
            });
            this.winStep = this.winStep_preload;

            /** preload next lvl */
            this.preload(this.level + 1);

            return;
        }

        // current level unloaded
        console.log('load');
        cc.loader.load(GameView.BaseUrl + 'question/level' + this.level + '/config.json', (err, res) => {
            if (err) { console.error('load error:', err) };
            this.lvlConf = res;
            console.log('level config: ', this.lvlConf);

            // reset
            this.reset();

            // play title animation
            this.title.scale = 2.5;
            this.title.runAction(cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(0.05, 1.05), cc.scaleTo(0.05, 1)));

            this.items = {};
            this.itemsFrame = {};

            // solution
            cc.loader.load(GameView.BaseUrl + 'solution/' + this.lvlSelectScript.titleJson[this.level] + '.png', (error, res) => {
                if (error) { console.error('load error:', this.lvlSelectScript.titleJson[this.level] + '.png', error) };
                let sp = new cc.SpriteFrame(res);
                this.tips.getComponent(cc.Sprite).spriteFrame = sp;
                !this.overScript && (this.overScript = this.OverView.getComponent(OverView));
                this.overScript.setFrame(sp);
            });

            // question item
            let urls = [], names = [];
            Object.keys(this.lvlConf.question).forEach(v => {
                names.push(v);
                urls.push(GameView.BaseUrl + 'question/level' + this.level + '/' + v + '.png');
            });
            cc.loader.load(urls, (err, assets) => {
                if (err) { console.error('load error:', this.level, err) };
                // get each item
                urls.forEach((url, idx) => {
                    let tex: cc.Texture2D = assets.getContent(url);
                    if (this.lvlConf.question[names[idx]]) {
                        let item = new cc.Node(names[idx]);
                        let sp = item.addComponent(cc.Sprite);
                        sp.spriteFrame = new cc.SpriteFrame(tex);
                        this.items[names[idx]] = item;
                        this.itemsFrame[names[idx]] = 'question';
                        this.container.addChild(item);
                        // set transform
                        item.x = this.lvlConf.question[names[idx]].posX;
                        item.y = this.lvlConf.question[names[idx]].posY;
                        item.rotation = (this.lvlConf.question[names[idx]].rot + 360) % 360;
                        item.zIndex = this.lvlConf.question[names[idx]].zIndex;
                        // add listener
                        this.addItemListener(item);
                    }
                });
                // set win step
                let len = Object.keys(this.lvlConf.solution).length;
                let c_n_i = 1, n = len, i = 2;
                while (i > 0) {
                    c_n_i *= n / i;
                    n--;
                    i--;
                }
                this.winStep = Math.max(0.05, 0.8 / (c_n_i * 2 + len));
            });

            /** preload next lvl */
            this.preload(this.level + 1);
        });
    }

    private clearStage() {
        console.log('clearStage');
        this.container.removeAllChildren();
    }

    // add item listener: select and transpostion
    private addItemListener(item: cc.Node) {
        item.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            // stop
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;
            // console.log('touch start: ', item.name);
            this.selected && (this.items[this.selected].color = new cc.Color(255, 255, 255));
            this.selected = item.name;
            item.color = new cc.Color(180, 180, 180);
            // set pos
            this.prevPos = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation()).clone();
            this.posBeforeMove = item.getPosition().clone();
        });
        item.on(cc.Node.EventType.TOUCH_MOVE, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            // if (this.eventTouch == null || (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
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
            // stop
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;
            // console.log('touch end: ', item.name);
            this.selected = item.name;
            // is pos valid
            if (this.itemsFrame[this.selected]) {
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
            // stop
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;
            // console.log('touch end: ', item.name);
            this.selected = item.name;
            // is pos valid
            if (this.itemsFrame[this.selected]) {
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
    }

    // add stage listener: rotation
    private addRotListener() {
        this.node.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                // console.log('touch start: ', this.node.name);
                // set rot
                let pos = (e.target.parent as cc.Node).convertToNodeSpaceAR(e.getLocation());
                let deltaX = pos.x - this.items[this.selected].x;
                let deltaY = pos.y - this.items[this.selected].y;
                this.prevRot = Math.atan2(deltaX, deltaY) / Math.PI * 180;
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            // if (this.eventTouch == null || (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
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
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            if (!this.canTouch) return;
            if (this.selected && this.items[this.selected]) {
                this.winCheck();
            }
        });
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (e: cc.Event.EventTouch) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
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
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            this.btn_back.color = new cc.Color(180, 180, 180);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_back.color = new cc.Color(255, 255, 255);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_back.color = new cc.Color(255, 255, 255);
            this.clearStage();
            this.node.active = false;
            this.LvlSelectView.active = true;
            AudioMgr.instance.play('button');
        });
        // btn restart
        this.btn_restart.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            this.btn_restart.color = new cc.Color(180, 180, 180);
        });
        this.btn_restart.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_restart.color = new cc.Color(255, 255, 255);
        });
        this.btn_restart.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
            this.btn_restart.color = new cc.Color(255, 255, 255);
            // reset items
            Object.keys(this.items).forEach(key => {
                console.log(key, this.lvlConf.question[key])
                this.items[key].runAction(cc.moveTo(0.2, this.lvlConf.question[key].posX, this.lvlConf.question[key].posY));
                this.items[key].runAction(cc.rotateTo(0.2, this.lvlConf.question[key].rot));
            });
            this.items[this.selected].color = new cc.Color(255, 255, 255);
            // reset
            this.reset();
            AudioMgr.instance.play('button');
        });
        // btn hint
        this.btn_hint.on(cc.Node.EventType.TOUCH_START, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = e;
            this.touchID == null && (this.touchID = e.getID());
            if (this.touchID != e.getID()) return;
            let onTouch = () => {
                this.btn_hint.active = false;
                this.tips.active = true;
                AudioMgr.instance.play('hint');
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
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
            if (this.touchID != e.getID()) return;
            this.touchID = null;
        });
        this.btn_hint.on(cc.Node.EventType.TOUCH_END, (e) => {
            e.stopPropagation();
            // if (this.eventTouch != null && (this.eventTouch.getID() != e.getID() || this.eventTouch.touch != e.touch || (Math.pow(this.eventTouch.getLocationX() - e.getLocationX(), 2) + Math.pow(this.eventTouch.getLocationY() - e.getLocationY(), 2)) > this.touchDist)) return;
            // this.eventTouch = null;
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
        winCnt > 1 && (winCnt = 1);
        winCnt < 0 && (winCnt = 0);
        this.winBar.progress = this.winFlag ? 1 : winCnt;
        this.winBar.progress == 1 ? (this.completeIcon.active = true) : (this.completeIcon.active = false);
    }

    // check pos and angle for two items, return value: 0, 1, 2
    private checkTwoItems(key1, key2): number {
        let cnt = 0;
        let rot1 = this.lvlConf.solution[key1].rot;
        let rot2 = this.lvlConf.solution[key2].rot;
        let deltaRot = ((this.items[key2].rotation - this.items[key1].rotation) + 720) % 360;
        // a. angle type null: 无指向性, 仅判断距离
        if (rot1 == null) {
            let dist = Math.sqrt(Math.pow(this.items[key1].x - this.items[key2].x, 2) + Math.pow(this.items[key1].y - this.items[key2].y, 2));
            if (dist < Const.WinDeltaDist) {
                cnt += 2;
            }
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
            for (let i = 0; i < rot1.length && (flag_pos || flag_rot); i++) {
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
                        cnt++;
                    }
                    else if (typeof rot2 == 'number') {
                        if (this.checkRot(rot1[i], rot2, deltaRot)) {
                            flag_rot = false;
                            cnt++;
                        }
                    } else {
                        for (let j = 0; j < rot2.length && flag_rot; j++) {
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
        // convert item2 to item1 space
        let sin = Math.sin(this.items[key1].rotation * Math.PI / 180);
        let cos = Math.cos(this.items[key1].rotation * Math.PI / 180);
        let pos1 = this.items[key1].convertToWorldSpaceAR(new cc.Vec2(0, 0));
        let pos2 = this.items[key2].convertToWorldSpaceAR(new cc.Vec2(0, 0));
        let tmpX = pos2.x - pos1.x;
        let tmpY = pos2.y - pos1.y;
        let x1 = cos * tmpX - sin * tmpY;
        let y1 = sin * tmpX + cos * tmpY;
        // convert answer_item2 to answer_item1 space
        sin = Math.sin(rot1 * Math.PI / 180);
        cos = Math.cos(rot1 * Math.PI / 180);
        tmpX = this.lvlConf.solution[key2].posX - this.lvlConf.solution[key1].posX;
        tmpY = this.lvlConf.solution[key2].posY - this.lvlConf.solution[key1].posY;
        let x2 = cos * tmpX - sin * tmpY;
        let y2 = sin * tmpX + cos * tmpY;
        // check
        let dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
        if (dist < Const.WinDeltaDist) {
            return true;
        }
        return false;
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
            // update
            this.isWin = true;
            if (this.level == Global.gameData.level) {
                Global.gameData.level++;
                Loading.updateGameData(true);
                // this.lvlSelectScript.updateList(Global.gameData.level - 1, Global.gameData.level);
                this.LvlSelectView.getChildByName('scrollView').getComponent(ScrollViewBetter).updateItemsContent();
            }
            // play sound
            this.schedule(() => AudioMgr.instance.play('win'), 0.15, 0);
            // show win animation
            this.flash.active = true;
            this.schedule(() => { this.flash.rotation += 1.5 }, 0.03, 60);
            // show overView
            let showNext: Function = () => {
                // clear
                this.clearStage();
                this.unschedule(showNext);
                this.flash.active = false;
                // this.node.active = false;
                this.OverView.active = true;
            };
            this.scheduleOnce(showNext, 2);
            // post score
            ws.postGameScore({
                key: 'clearStage',
                id: Date.now() + "",
                score: Global.gameData.level,
            })
        }
    }

    setLevel(idx: number) {
        this.level = idx;
    }

    addLevel() {
        this.level++;
    }

    setState(state: number) {
        this.state = state;
    }

    // update (dt) {}
}
