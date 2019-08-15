import Global from "../Global";
import * as Const from "../Const";
import GameView from "./GameView"
import HomeView from "./HomeView";
import ScrollViewBetter from "../component/ScrollViewBetter";
import AudioMgr from "../component/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class lvlSelect extends cc.Component {

    @property(cc.Node)
    HomeView: cc.Node = null;
    @property(cc.Node)
    GameView: cc.Node = null;
    @property(cc.Node)
    btn_back: cc.Node = null;
    @property(cc.Node)
    scrollView: cc.Node = null;
    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Node)
    lvlLabel: cc.Node = null;

    @property
    cellsPerRow: number = 3;
    @property
    itemWidth: number = 210;
    @property
    itemHeight: number = 300;
    @property
    spacingX: number = 1.14;
    @property
    spacingY: number = 1.12;

    private gameScript: GameView;

    public titleJson;
    private iconList: cc.SpriteFrame[] = [];
    private lockList: cc.SpriteFrame[] = [];

    onEnable() {
        // update label
        this.lvlLabel.getComponent(cc.Label).string = (Global.gameData.level - 1).toString();
    }

    init() {
        if (this.iconList.length != 0) return;

        this.gameScript = this.GameView.getComponent(GameView);

        // init label
        this.lvlLabel.getComponent(cc.Label).string = (Global.gameData.level - 1).toString();

        let urls = [
            'textures/lvlSelect/frame5_0',
            'textures/lvlSelect/crown2',
            'textures/lvlSelect/icon_new',
            'textures/lvlSelect/line',
            'textures/lvlSelect/question',
            'textures/lvlSelect/lock',
            'textures/lvlSelect/zhezhao',
        ];
        cc.loader.loadResArray(urls, (err, res) => {
            if (err) { console.error('loadResArray error:', err) };
            console.log(res)

            this.iconList.push(new cc.SpriteFrame(res[1]));
            this.iconList.push(new cc.SpriteFrame(res[2]));
            this.lockList.push(new cc.SpriteFrame(res[4]));
            this.lockList.push(new cc.SpriteFrame(res[5]));


            // for (let i = 0; i < Global.config.MaxShowLevel; i++) {
            //     /** frame */
            //     let item = new cc.Node('item' + (i + 1).toString());
            //     this.content.addChild(item);
            //     let sp = item.addComponent(cc.Sprite);
            //     sp.spriteFrame = new cc.SpriteFrame(res[0]);
            //     item.width = this.itemWidth;
            //     item.height = this.itemHeight;
            //     item.x = (i % this.cellsPerRow - Math.floor(this.cellsPerRow / 2) + (this.cellsPerRow + 1) % 2 * 0.5) * item.width * this.spacingX;
            //     item.y = -((Math.floor(i / this.cellsPerRow)) + 0.5) * item.height * this.spacingY;
            //     item.zIndex = 1;
            //     this.content.height = ((Math.floor(Global.config.MaxShowLevel / this.cellsPerRow)) + 1) * this.itemHeight * this.spacingY;
            //     // add listener
            //     this.addItemListener(item, i + 1);
            //     /** icon */
            //     if (this.iconList.length == 0) {
            //         this.iconList.push(new cc.SpriteFrame(res[1]));
            //         this.iconList.push(new cc.SpriteFrame(res[2]));
            //     }
            //     let icon = new cc.Node('icon');
            //     item.addChild(icon);
            //     icon.addComponent(cc.Sprite);
            //     icon.getComponent(cc.Sprite).spriteFrame = this.iconList[1];
            //     icon.x = -item.width / 2 + icon.width * 0.4;
            //     icon.y = item.height / 2 - icon.height * 0.85;
            //     /** line */
            //     if (i % 3 == 0) {
            //         let line = new cc.Node('line' + Math.floor(i / 3));
            //         this.content.addChild(line);
            //         line.addComponent(cc.Sprite);
            //         line.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res[3]);
            //         line.x = 0;
            //         line.y = item.y + item.height * 0.45;
            //         line.zIndex = 0;
            //     }
            //     /** lvlLabel */
            //     let label = new cc.Node();
            //     item.addChild(label);
            //     label.addComponent(cc.Label);
            //     label.getComponent(cc.Label).string = (i + 1).toString();
            //     label.getComponent(cc.Label).fontSize = 30;
            //     label.getComponent(cc.Label).font = this.lvlLabel.getComponent(cc.Label).font;
            //     label.color = new cc.Color(0, 0, 0);
            //     label.x = 0;
            //     label.y = -item.height * 0.37;
            //     /** lock */
            //     if (this.lockList.length == 0) {
            //         this.lockList.push(new cc.SpriteFrame(res[4]));
            //         this.lockList.push(new cc.SpriteFrame(res[5]));
            //     }
            //     let lock = new cc.Node('lock');
            //     item.addChild(lock);
            //     lock.addComponent(cc.Sprite);
            //     lock.getComponent(cc.Sprite).spriteFrame = this.lockList[0];
            //     lock.x = 0;
            //     lock.y = -5;
            //     /** mask */
            //     let mask = new cc.Node('mask');
            //     item.addChild(mask);
            //     mask.addComponent(cc.Sprite);
            //     mask.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res[6]);
            //     mask.x = 0;
            //     mask.y = 0;

            //     // update list by level index
            //     this.updateList(i + 1);
            // }


            this.scrollView.getComponent(ScrollViewBetter).createItems(Math.ceil(Global.config.MaxShowLevel / 3), (itemNode, index) => {
                for (let i = 0; i < 3; i++) {
                    let lvlIdx = index * 3 + i + 1;
                    let item = itemNode.getChildByName(i.toString());
                    // add listener
                    this.addItemListener(item, lvlIdx);
                    // change item
                    let icon: cc.Node = item.getChildByName('icon');
                    let lock: cc.Node = item.getChildByName('lock');
                    let mask: cc.Node = item.getChildByName('mask');
                    let solution: cc.Node = item.getChildByName('solution');
                    let label: cc.Node = item.getChildByName('label');
                    label.getComponent(cc.Label).string = lvlIdx.toString();
                    if (lvlIdx < Global.gameData.level) {
                        icon.active = true;
                        icon.getComponent(cc.Sprite).spriteFrame = this.iconList[0];
                        icon.x = -item.width / 2 + icon.width * 0.4;
                        icon.y = item.height / 2 - icon.height * 0.85;
                        lock.active = false;
                        mask.active = false;
                        solution.active = true;
                        cc.loader.load(GameView.BaseUrl + 'solution/' + this.titleJson[lvlIdx] + '.png', (err, res2) => {
                            solution.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res2);
                            solution.scale = 0.48;
                        });
                    } else if (lvlIdx == Global.gameData.level && lvlIdx <= Global.config.MaxLevel) {
                        icon.active = true;
                        icon.getComponent(cc.Sprite).spriteFrame = this.iconList[1];
                        icon.x = -item.width / 2 + icon.width * 0.4;
                        icon.y = item.height / 2 - icon.height * 0.85;
                        lock.active = true;
                        lock.getComponent(cc.Sprite).spriteFrame = this.lockList[0];
                        mask.active = false;
                        solution.active = false;
                    } else {
                        icon.active = false;
                        lock.active = true;
                        lock.getComponent(cc.Sprite).spriteFrame = this.lockList[1];
                        mask.active = true;
                        mask.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res[6]);
                        solution.active = false;
                    }
                }
            }, 0);
        });

        this.addBtnListener();
    }

    // // update list by level idx: start to end
    // updateList(start: number, end?: number) {
    //     // update label
    //     this.lvlLabel.getComponent(cc.Label).string = (Global.gameData.level - 1).toString();
    //     // update list item
    //     !end && (end = start);
    //     end < 1 && (end = 1);
    //     end > Global.config.MaxShowLevel && (end = Global.config.MaxShowLevel);
    //     while (start <= end) {
    //         let item: cc.Node = this.content.getChildByName('item' + start);
    //         let icon: cc.Node = item.getChildByName('icon');
    //         let lock: cc.Node = item.getChildByName('lock');
    //         let mask: cc.Node = item.getChildByName('mask');
    //         if (start < Global.gameData.level) {
    //             icon.active = true;
    //             icon.getComponent(cc.Sprite).spriteFrame = this.iconList[0];
    //             lock.active = false;
    //             mask.active = false;
    //             // set content
    //             let solution: cc.Node = item.getChildByName('solution');
    //             if (solution) {
    //                 solution.active = true;
    //             } else {
    //                 solution = new cc.Node('solution');
    //                 item.addChild(solution);
    //                 solution.addComponent(cc.Sprite);
    //                 solution.y = -5;
    //                 cc.loader.load(GameView.BaseUrl + 'solution/' + this.titleJson[start] + '.png', (err, res) => {
    //                     solution.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
    //                     solution.scale = 0.48;
    //                 });
    //             }
    //         } else if (start == Global.gameData.level && start <= Global.config.MaxLevel) {
    //             icon.active = true;
    //             icon.getComponent(cc.Sprite).spriteFrame = this.iconList[1];
    //             lock.active = true;
    //             lock.getComponent(cc.Sprite).spriteFrame = this.lockList[0];
    //             mask.active = false;
    //         } else {
    //             icon.active = false;
    //             lock.active = true;
    //             lock.getComponent(cc.Sprite).spriteFrame = this.lockList[1];
    //             mask.active = true;
    //         }
    //         start++;
    //     }
    // }

    private addItemListener(item: cc.Node, idx: number) {
        // off
        item.targetOff(item);
        // on
        item.on(cc.Node.EventType.TOUCH_START, (e) => {
            item.color = new cc.Color(180, 180, 180);
        }, item);
        item.on(cc.Node.EventType.TOUCH_MOVE, (e) => {
            item.color = new cc.Color(255, 255, 255);
        }, item);
        item.on(cc.Node.EventType.TOUCH_END, (e) => {
            console.log('click level', idx)
            AudioMgr.instance.play('button');
            item.color = new cc.Color(255, 255, 255);
            if (idx <= Global.gameData.level) {
                this.gameScript.startGame(idx);
                this.node.active = false;
                this.GameView.active = true;
            }
        }, item);
    }

    private addBtnListener() {
        // btn back
        this.btn_back.on(cc.Node.EventType.TOUCH_START, () => {
            this.btn_back.opacity = 180;
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.btn_back.opacity = 255;
        });
        this.btn_back.on(cc.Node.EventType.TOUCH_END, () => {
            this.btn_back.opacity = 255;
            this.node.active = false;
            this.HomeView.active = true;
            AudioMgr.instance.play('button');
        });
    }

    // update (dt) {}
}
