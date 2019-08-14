let Global = {
    gameData: {
        //音乐开关
        musicEnabled: true,
        //音效开关
        soundEnabled: true,
        //振动开关
        vibrationEnabled: true,
        //数据更新时间
        updateTimestamp: 0,
        //视频观看次数
        videoCount: 0,
        lastVideoTimestamp: 0,
        //转发次数
        shareCount: 0,
        lastShareTimestamp: 0,
        //关卡索引
        level: 1,
    },

    config: {
        allow_share: true, //是否允许转发
        allow_video: true, //是否允许视频
        share_first: false, //是否转发优先
        share_number: 5, //优先转发情况下，最多转发次数，如果超过视频次数，仍会继续转发
        video_number: 6, //视频观看次数
        share_time: 5, //转发冷却时间
        banner_time: 180, //banner切换时间
        share_delay: 4,
        online: true,//是否线上版本
        debug: false,
        allow_revive: true,//允许复活
        banner_delay: 1, //banner延迟弹出时间
        deny_banner: false,
        share_fail: "'操作失败，请换个群'",
        distance_iphonex: 50,
        banner_click_time: 2,
        games: {},
        shares: {},
        videos: {},
        banners: {},
        try_cannon: 1,
        try_ball: 1,
        revive: 1,
        reward_triple: 1,
        bulletRewardType: 1, // balckhole
        cannonRewardType: 4, // shotgun x4
        hasTreasure: true,  // 宝箱是否开启
        banner: "",  // banner Josn对象, key为1,2,3..., value为对应adunitId
        banner_number: 0, // banner个数
        show_number: 2,

        game_hint: 2,

        MaxLevel: 80,
        MaxShowLevel: 80
    },
}

export default Global;