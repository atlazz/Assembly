import Global from "../Global";
import * as Const from "../Const";
import GameView from "./GameView"
import AudioMgr from "../component/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OverView extends cc.Component {
    @property(cc.Node)
    HomeView: cc.Node = null;
    @property(cc.Node)
    GameView: cc.Node = null;
    @property(cc.Node)
    LvlSelectView: cc.Node = null;

    @property(cc.Node)
    btn_back: cc.Node = null;
    @property(cc.Node)
    btn_next: cc.Node = null;
    @property(cc.Node)
    lvlLabel: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;

    @property(cc.Node)
    center: cc.Node = null;
    @property(cc.Node)
    left: cc.Node = null;
    @property(cc.Node)
    right: cc.Node = null;
    @property(cc.Node)
    crown: cc.Node = null;
    @property(cc.Node)
    leftLeaf: cc.Node = null;
    @property(cc.Node)
    rightLeaf: cc.Node = null;
    @property(cc.Node)
    label: cc.Node = null;

    private gameScript: GameView;

    private touchTarget;

    start() {
        // get script
        this.gameScript = this.GameView.getComponent(GameView);

        // add listener
        this.addBtnListener();
    }

    onEnable() {
        // update label
        this.lvlLabel.getComponent(cc.Label).string = (Global.gameData.level - 1).toString();

        // play win animation
        this.center.scaleX = 0;
        this.center.runAction(cc.sequence(cc.scaleTo(0.2, 1.2), cc.scaleTo(0.05, 1)));
        this.label.scaleX = 0;
        this.label.runAction(cc.sequence(cc.scaleTo(0.2, 1.2), cc.scaleTo(0.05, 1)));
        this.left.x = 0;
        this.left.runAction(cc.sequence(cc.moveTo(0.25, -170, -37.5), cc.moveTo(0.1, -150, -37.5), cc.moveTo(0.1, -162, -37.5)));
        this.right.x = 0;
        this.right.runAction(cc.sequence(cc.moveTo(0.25, 170, -41), cc.moveTo(0.1, 150, -41), cc.moveTo(0.1, 160, -41)));
        this.crown.active = false;
        this.leftLeaf.active = false;
        this.rightLeaf.active = false;
        this.schedule(() => {
            AudioMgr.instance.play('starin');
            this.crown.active = true;
            this.crown.y = 40;
            this.crown.runAction(cc.sequence(cc.moveTo(0.1, 0, 110), cc.moveTo(0.05, 0, 105), cc.moveTo(0.15, 0, 70), cc.moveTo(0.05, 0, 85), cc.moveTo(0.05, 0, 80)));
            this.crown.scale = 0.6;
            this.crown.runAction(cc.sequence(cc.scaleTo(0.2, 1), cc.scaleTo(0.05, 0.95)));
            this.schedule(() => {
                this.crown.rotation = -5;
                this.crown.runAction(cc.sequence(cc.rotateTo(0.15, 5), cc.rotateTo(0.05, -2), cc.rotateTo(0.05, 0)));
            }, 0, 0, 0.15);
            this.schedule(() => {
                this.leftLeaf.active = true;
                this.leftLeaf.scale = 0.6;
                this.leftLeaf.runAction(cc.sequence(cc.scaleTo(0.2, 1.1), cc.scaleTo(0.05, 1)));
                this.leftLeaf.x = -50;
                this.leftLeaf.y = 40;
                this.leftLeaf.runAction(cc.sequence(cc.moveTo(0.1, -80, 80), cc.moveTo(0.05, -85, 74)));
                this.rightLeaf.active = true;
                this.rightLeaf.scale = 0.6;
                this.rightLeaf.runAction(cc.sequence(cc.scaleTo(0.2, 1.1), cc.scaleTo(0.05, 1)));
                this.rightLeaf.x = 50;
                this.rightLeaf.y = 40;
                this.rightLeaf.runAction(cc.sequence(cc.moveTo(0.1, 78, 80), cc.moveTo(0.05, 82, 73)));
            }, 0, 0, 0.3);
        }, 0, 0, 0.4);
    }

    setFrame(frame: cc.SpriteFrame) {
        this.tips.getComponent(cc.Sprite).spriteFrame = frame.clone();
        this.tips.scale = 0.85;
    }

    addBtnListener() {
        // btn next
        this.btn_next.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = e.target;
            this.btn_next.color = new cc.Color(180, 180, 180);
        });
        this.btn_next.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_next.color = new cc.Color(255, 255, 255);
        });
        this.btn_next.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_next.color = new cc.Color(255, 255, 255);
            this.gameScript.addLevel();
            this.gameScript.setState(Const.State.PLAYING);
            this.node.active = false;
            this.gameScript.gameStart();
            AudioMgr.instance.play('button');
        });
        // btn back
        this.btn_back.on(cc.Node.EventType.TOUCH_START, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = e.target;
            this.btn_back.color = new cc.Color(180, 180, 180);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_CANCEL, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_back.color = new cc.Color(255, 255, 255);
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_END, (e) => {
            if (this.touchTarget && this.touchTarget != e.target) return;
            this.touchTarget = null;
            this.btn_back.color = new cc.Color(255, 255, 255);
            this.node.active = false;
            this.GameView.active = false;
            this.LvlSelectView.active = true;
            AudioMgr.instance.play('button');
        });
    }

    // update (dt) {}
}
