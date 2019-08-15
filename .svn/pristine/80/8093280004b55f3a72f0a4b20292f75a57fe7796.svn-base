const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnAni extends cc.Component {
    @property({ type: Array(cc.SpriteFrame), tooltip: 'btn sprite frames', serializable: true })
    playFrame: cc.SpriteFrame[] = [];
    @property()
    maxScale: number = 0.95;
    @property()
    minScale: number = 1.05;

    private sprite: cc.Sprite;
    private frameIdx: number = 0;

    start() {
        // btn frame animation
        this.sprite = this.node.getComponent(cc.Sprite);
        this.schedule(() => {
            // show
            this.sprite.spriteFrame = this.playFrame[this.frameIdx];
            // update
            this.frameIdx = ++this.frameIdx % 3;
        }, 0.15, cc.macro.REPEAT_FOREVER, 0);
        // btn scale animation
        this.node.runAction(cc.sequence(cc.scaleTo(0.25, this.minScale), cc.scaleTo(0.5, this.maxScale), cc.scaleTo(0.25, 1)).repeatForever());
    }

    // update (dt) {}
}
