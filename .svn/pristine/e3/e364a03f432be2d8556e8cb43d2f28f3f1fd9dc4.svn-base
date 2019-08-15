const { ccclass, property } = cc._decorator;

@ccclass
export default class ScrollViewBetter extends cc.Component {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    @property(cc.Node)
    contentNode: cc.Node = null;
    @property(cc.Node)
    viewNode: cc.Node = null;

    @property
    spacing: number = 0; // 间隔
    @property
    firstPadding: number = 0;
    @property
    lastPadding: number = 0;
    @property
    vertical: boolean = true; // 默认垂直模式，false为水平模式
    @property
    topToBottom: boolean = true; // 垂直模式默认滚动到顶部 从上到下
    @property
    leftToRight: boolean = true; // 水平模式默认滚动到左侧 从左到右

    private itemWidth;
    private itemHeight;
    private itemListSize;
    private innerItemCount;
    private outerItemCount;
    private totalItemCount;
    private startItemIndex;
    private firstItemIndex;
    private topLimitPosY;
    private bottomLimitPosY;
    private leftLimitPosX;
    private rightLimitPosX;

    private itemNodeList;

    private initItemCallback: Function;

    createItems(itemListSize, initItemCallback, startIndex = 0) {
        //item宽高
        this.itemHeight = this.itemPrefab.data.height;
        this.itemWidth = this.itemPrefab.data.width;

        //初始化item回调
        this.initItemCallback = initItemCallback;

        //item列表大小
        this.itemListSize = itemListSize;

        this.contentNode.removeAllChildren();
        if (this.vertical) { //垂直
            // 设置内容高度
            this.contentNode.height = this.firstPadding + this.itemListSize * (this.itemHeight + this.spacing) + this.lastPadding;
            this.contentNode.width = this.itemListSize * this.itemWidth;
            this.innerItemCount = Math.floor(this.viewNode.height / (this.itemHeight + this.spacing)) + 2;
        } else {  //水平
            // 设置内容高度
            this.contentNode.height = this.itemListSize * this.itemHeight;
            this.contentNode.width = this.firstPadding + this.itemListSize * (this.itemWidth + this.spacing) + this.lastPadding;
            this.innerItemCount = Math.floor(this.viewNode.width / (this.itemWidth + this.spacing)) + 2;
        }
        this.outerItemCount = Math.floor(this.innerItemCount / 2) * 2;
        this.totalItemCount = this.innerItemCount + this.outerItemCount;

        //第一个显示的item索引
        if (startIndex >= itemListSize) {
            startIndex = itemListSize - 1;
        }
        if (startIndex < 0) {
            startIndex = 0;
        }
        this.startItemIndex = startIndex;
        this.firstItemIndex = startIndex - this.outerItemCount / 2;

        if (this.vertical) {
            if (this.topToBottom) {
                this.contentNode.y = this.viewNode.height / 2 - this.contentNode.height / 2 + startIndex * (this.itemHeight + this.spacing);
            } else {
                this.contentNode.y = -(this.viewNode.height / 2 - this.contentNode.height / 2 + startIndex * (this.itemHeight + this.spacing));
            }
        } else {
            if (this.leftToRight) {
                this.contentNode.x = -(this.viewNode.width / 2 - this.contentNode.width / 2 + startIndex * (this.itemWidth + this.spacing));
            } else {
                this.contentNode.x = this.viewNode.width / 2 - this.contentNode.width / 2 + startIndex * (this.itemWidth + this.spacing);
            }
        }

        // 遮罩
        let viewNodeWorldPos = this.viewNode.convertToWorldSpaceAR(cc.v2(0, 0));
        this.topLimitPosY = viewNodeWorldPos.y + this.totalItemCount * (this.itemHeight + this.spacing) / 2;
        this.bottomLimitPosY = viewNodeWorldPos.y - this.totalItemCount * (this.itemHeight + this.spacing) / 2;
        this.leftLimitPosX = viewNodeWorldPos.x - this.totalItemCount * (this.itemWidth + this.spacing) / 2;
        this.rightLimitPosX = viewNodeWorldPos.x + this.totalItemCount * (this.itemWidth + this.spacing) / 2;

        this.itemNodeList = [];
        for (let i = this.firstItemIndex; i < this.totalItemCount + this.firstItemIndex; i++) {
            let itemNode = cc.instantiate(this.itemPrefab);
            itemNode.parent = this.contentNode;
            this.setItem(itemNode, i);
            this.itemNodeList.push(itemNode);
        }
        this.node.off('scrolling');
        this.node.on('scrolling', () => {
            this.updateItemsPos();
        })
    }

    setItem(itemNode, index) {
        // 垂直滚动
        if (this.vertical) {
            // 从上到下排序
            if (this.topToBottom) {
                itemNode.y = this.contentNode.height / 2 - (this.firstPadding + index * (this.itemHeight + this.spacing) + this.itemHeight / 2);
            }
            // 从下到上排序                
            else {
                itemNode.y = -(this.contentNode.height / 2 - (this.firstPadding + index * (this.itemHeight + this.spacing) + this.itemHeight / 2));
            }
        }
        // 水平滚动
        else {
            // 从左往右排序
            if (this.leftToRight) {
                itemNode.x = -(this.contentNode.width / 2 - (this.firstPadding + index * (this.itemWidth + this.spacing) + this.itemWidth / 2));
            }
            // 从右往左排序                
            else {
                itemNode.x = this.contentNode.width / 2 - (this.firstPadding + index * (this.itemWidth + this.spacing) + this.itemWidth / 2);
            }
        }
        if (index < 0 || index >= this.itemListSize) {
            itemNode.active = false;
        } else {
            itemNode.active = true;
            this.initItemCallback(itemNode, index);
        }
    }

    updateItemsContent() {
        this.itemNodeList.forEach((itemNode, index) => {
            itemNode.active && this.initItemCallback(itemNode, index + this.firstItemIndex);
        });
    }

    updateItemsPos() {
        if (!this.itemNodeList || !this.itemNodeList.length) return;
        let firstItem = this.itemNodeList[0];
        let lastItem = this.itemNodeList[this.itemNodeList.length - 1];
        //获取最上item当前的坐标
        let firstPos = firstItem.convertToWorldSpaceAR(cc.v2(0, 0));
        //获取最下item当前的坐标
        let lastPos = lastItem.convertToWorldSpaceAR(cc.v2(0, 0));
        //检测上item是否超过边界
        let firstFlag = false, lastFlag = false;
        // 垂直滚动
        if (this.vertical) {
            // 从上到下排序
            if (this.topToBottom) {
                firstFlag = firstPos.y > this.topLimitPosY;
                lastFlag = lastPos.y < this.bottomLimitPosY;
            }
            // 从下到上排序
            else {
                firstFlag = firstPos.y < this.bottomLimitPosY;
                lastFlag = lastPos.y > this.topLimitPosY;
            }
        }
        // 水平滚动
        else {
            // 从左往右排序
            if (this.leftToRight) {
                firstFlag = firstPos.x < this.leftLimitPosX;
                lastFlag = lastPos.x > this.rightLimitPosX;
            }
            // 从右往左排序
            else {
                firstFlag = firstPos.x > this.rightLimitPosX;
                lastFlag = lastPos.x < this.leftLimitPosX;
            }
        }
        if (firstFlag) {
            this.setItem(firstItem, this.firstItemIndex + this.totalItemCount);
            this.firstItemIndex++;
            let itemNode = this.itemNodeList.shift();
            this.itemNodeList.push(itemNode);
        }
        //检测下item是否超过边界
        else if (lastFlag) {
            this.setItem(lastItem, this.firstItemIndex - 1);
            this.firstItemIndex--;
            let itemNode = this.itemNodeList.pop();
            this.itemNodeList.unshift(itemNode);
        }
    }
}