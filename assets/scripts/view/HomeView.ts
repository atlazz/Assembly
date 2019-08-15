import Global from "../Global";
import * as Const from "../Const";
import GameView from "./GameView"
import LvlSelect from "./LvlSelect";
import Loading from '../component/Loading';
import AudioMgr from "../component/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeView extends cc.Component {
    @property(cc.Node)
    GameView: cc.Node = null;
    @property(cc.Node)
    LvlSelectView: cc.Node = null;

    @property(cc.Node)
    btn_start: cc.Node = null;
    @property(cc.Node)
    logo: cc.Node = null;
    @property({ type: Array(cc.SpriteFrame), tooltip: 'btn sprite frames', serializable: true })
    logoFrame: cc.SpriteFrame[] = [];
    @property(cc.Node)
    label_version: cc.Node = null;

    private gameScript: GameView;
    private lvlSelectScript: LvlSelect;

    private initCnt: number = 0;

    private logoSprite: cc.Sprite;
    private logoFrameIdx: number = 0;

    private touchTarget;

    constructor() {
        super();
        // clear old list
        try {
            CC_WECHATGAME && wxDownloader['cleanCache'](wxDownloader['getCacheName'](GameView.BaseUrl + 'solution/title.json'));
        } catch (e) {
            console.log("clear cache file err:", e);
        }
    }

    start() {
        // login
        if (CC_WECHATGAME) {
            Loading.initWeixin(() => {
                console.log('login succeed.');
                this.initCnt++;
                this.initCnt >= 2 && this.onInitComplete();
            });
        } else {
            GameView.BaseUrl = 'https://coolant.oss-cn-shenzhen.aliyuncs.com/Assembly/textures/game/';
            this.initCnt++;
            this.initCnt >= 2 && this.onInitComplete();
        }

        // print version
        this.label_version.getComponent(cc.Label).string = Const.VERSION;

        // init LvlSelect
        this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect);

        // init animation
        this.initAnimation();

        // load title json data
        cc.loader.load(GameView.BaseUrl + 'solution/title.json', (error, jsonData) => {
            if (error) { console.error('load title json error:', error) };
            this.lvlSelectScript.titleJson = jsonData;
            console.log('title json loaded.', this.lvlSelectScript.titleJson);
            this.initCnt++;
            this.initCnt >= 2 && this.onInitComplete();
        });
    }

    private initAnimation() {
        // logo down
        this.logo.y = 800;
        this.logo.runAction(cc.sequence(cc.moveTo(0.4, 0, 250), cc.moveTo(0.1, 0, 300)));
        // logo frame animation
        this.logoSprite = this.logo.getComponent(cc.Sprite);
        if (this.logoFrame.length) {
            this.schedule(() => {
                // show
                this.logoSprite.spriteFrame = this.logoFrame[this.logoFrameIdx];
                // update
                this.logoFrameIdx = ++this.logoFrameIdx % this.logoFrame.length;
            }, 0.5, cc.macro.REPEAT_FOREVER, 0);
        }
        // btn scale animation
        this.btn_start.active = false;
        this.schedule(() => {
            this.btn_start.scale = 0;
            this.btn_start.active = true;
            this.btn_start.runAction(cc.sequence(cc.scaleTo(0.25, 1.05), cc.scaleTo(0.5, 0.95), cc.scaleTo(0.25, 1)).repeatForever());
        }, 0.5, 0)
    }

    private addBtnListener() {
        // btn_start
        this.btn_start.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = e.target;
            this.btn_start.color = new cc.Color(180, 180, 180);
        });
        this.btn_start.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_start.color = new cc.Color(255, 255, 255);
        });
        this.btn_start.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_start.color = new cc.Color(255, 255, 255);
            AudioMgr.instance.play('button');
            this.gameScript.startGame(Global.gameData.level);
            this.node.active = false;
            this.GameView.active = true;
        });
    }

    onInitComplete() {
        // preload level
        this.gameScript = this.GameView.getComponent(GameView);
        // this.gameScript.preload(Global.gameData.level);
        if (Global.gameData.level <= Global.config.MaxLevel) {
            this.gameScript.level_preload = Global.gameData.level;
            this.gameScript.loadTimeStamp_preload = Date.now();
            this.gameScript.loadStage(this.gameScript.level_preload, this.gameScript.loadTimeStamp_preload, true);
        }
        // init lvlSelect
        this.lvlSelectScript.init();
        // add listener
        this.addBtnListener();
    }

    // update(dt) {}
}
