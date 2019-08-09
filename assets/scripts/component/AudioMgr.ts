const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioMgr extends cc.Component {

    static instance: AudioMgr;

    @property({type: cc.AudioClip})
    button: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    close: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    hint: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    move: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    win: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    starin: cc.AudioClip = null;

    onLoad() {
        !AudioMgr.instance && (AudioMgr.instance = this);
    }

    play(name: string) {
        switch (name) {
            case 'button': cc.audioEngine.playEffect(this.button, false); break;
            case 'close': cc.audioEngine.playEffect(this.close, false); break;
            case 'hint': cc.audioEngine.playEffect(this.hint, false); break;
            case 'move': cc.audioEngine.playEffect(this.move, false); break;
            case 'win': cc.audioEngine.playEffect(this.win, false); break;
            case 'starin': cc.audioEngine.playEffect(this.starin, false); break;
        }
    }

    // update (dt) {}
}
