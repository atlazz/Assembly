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
    btn_start: cc.Node = null;
    @property(cc.Node)
    GameView: cc.Node = null;
    @property(cc.Node)
    LvlSelectView: cc.Node = null;

    private gameScript: GameView;
    private lvlSelectScript: LvlSelect;

    private isLogined: boolean = false;
    private isLoaded: boolean = false;
    private hasAddlistener: boolean = false;

    private touchTarget;

    start() {
        // login
        if (CC_WECHATGAME) {
            Loading.initWeixin(() => {
                console.log('login succeed.');
                this.isLogined = true;
            });
        } else {
            this.isLogined = true;
            GameView.BaseUrl = 'https://coolant.oss-cn-shenzhen.aliyuncs.com/Assembly/textures/game/';
        }

        // init LvlSelect
        this.lvlSelectScript = this.LvlSelectView.getComponent(LvlSelect);

        // load title json data
        cc.loader.load(GameView.BaseUrl + 'solution/title.json', (error, jsonData) => {
            if (error) { console.error('load title json error:', error) };
            this.lvlSelectScript.titleJson = jsonData;
            this.isLoaded = true;
            console.log('title json loaded.', this.lvlSelectScript.titleJson);

            // preload GameView level
            this.gameScript = this.GameView.getComponent(GameView);
            this.gameScript.preload(Global.gameData.level);
        });
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
            this.gameScript.setLevel(Global.gameData.level);
            this.gameScript.setState(Const.State.PLAYING);
            this.node.active = false;
            this.GameView.active = true;
            this.gameScript.gameStart();
            AudioMgr.instance.play('button');
        });
    }

    update(dt) {
        if (!this.hasAddlistener && this.isLogined && this.isLoaded) {
            this.lvlSelectScript.init();
            this.addBtnListener();
            this.hasAddlistener = true;
        }
    }
}
