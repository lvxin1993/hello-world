export const CATEGORIES = {
  ESSAY: '治愈散文',
  NOVEL: '轻量小说',
  KNOWLEDGE: '温和科普',
  POETRY: '韵律诗歌',
};

export const audiobooks = [
  {
    id: '1',
    title: '人间草木',
    author: '汪曾祺',
    category: CATEGORIES.ESSAY,
    description: '全是生活里的小美好：葡萄架下的晚风、高邮的咸鸭蛋、昆明的菌子…… 语言质朴又有烟火气，听着就像在看一幅慢悠悠的生活画，毫无压力。',
    coverImageUrl: 'https://example.com/cover_renjiancaomu.png',
    narrators: [
      { id: 'male-1', name: '沉稳男声', audioUrl: 'https://example.com/audio_renjiancaomu_male.mp3' },
      { id: 'female-1', name: '温柔女声', audioUrl: 'https://example.com/audio_renjiancaomu_female.mp3' },
    ],
  },
  {
    id: '2',
    title: '山茶文具店',
    author: '小川糸',
    category: CATEGORIES.ESSAY,
    description: '日式治愈风，讲述代笔人帮别人写下心里话的故事，情节平淡温暖，字里行间都是温柔的治愈感，节奏慢到让人不自觉放松。',
    coverImageUrl: 'https://example.com/cover_shanchawenjudian.png',
    narrators: [
      { id: 'female-2', name: '知性女声', audioUrl: 'https://example.com/audio_shanchawenjudian_female.mp3' },
    ],
  },
  {
    id: '3',
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    category: CATEGORIES.NOVEL,
    description: '文字优美又充满诗意，故事简单却有淡淡的哲思，没有复杂的情节，无论是原版还是译本，朗读出来都很治愈，适合当作睡前的“童话小点心”。',
    textContent: `六岁的时候，我曾经在书上看到一幅画，那本书是讲原始森林的，名叫《真实的故事》。
画里画的是一条巨蟒正在吞食一只野兽。
这就是那幅画的摹本。
书上说：“巨蟒把捕获的猎物不加咀嚼地整个吞下去，然后它就动弹不得，在漫长的六个月睡眠中消化肚子里的食物。”
当时，我对丛林中的奇遇想得很多，于是，我也用彩色铅笔画出了我的第一幅图画。我的第一号作品。它是这样的：
我把我的杰作拿给大人看，问他们我的画是不是让他们害怕。
他们回答我说：“一顶帽子有什么可怕的？”
我画的不是帽子，是一条巨蟒正在消化一头大象。于是我又把巨蟒肚子里的情况画了出来，以便让大人们能够看懂。这些大人总是需要解释。
我的第二号作品是这样的：
大人们劝我把这些画着开肚皮或闭肚皮的巨蟒的图画放到一边，还是把兴趣放在地理、历史、算术和语法上。
就这样，在六岁那年，我放弃了画家这一美好的职业。
第一号作品和第二号作品的失败，使我泄了气。大人们自己从来什么也看不懂，总是要小孩子给他们解释千遍万遍，这真是太累了。
......
（此处省略一万字，用于测试AI朗读功能）`,
    coverImageUrl: 'https://example.com/cover_littleprince.png',
    narrators: [
      { id: 'male-2', name: '磁性男声', audioUrl: 'https://example.com/audio_littleprince_male.mp3' },
      { id: 'female-3', name: '纯真女声', audioUrl: 'https://example.com/audio_littleprince_female.mp3' },
    ],
  },
  {
    id: '4',
    title: '解忧杂货店',
    author: '东野圭吾',
    category: CATEGORIES.NOVEL,
    description: '虽然是悬疑作家的作品，但这本书没有破案和惊悚元素，而是通过穿越时空的信件，讲述一个个温暖的人生故事，情节连贯但不紧张，听完心里会很平和。',
    coverImageUrl: 'https://example.com/cover_jieyou.png',
    narrators: [
      { id: 'male-3', name: '故事大叔', audioUrl: 'https://example.com/audio_jieyou_male.mp3' },
    ],
  },
   {
    id: '5',
    title: '昆虫记',
    author: '法布尔',
    category: CATEGORIES.KNOWLEDGE,
    description: '不是枯燥的生物学知识，而是用拟人化的笔触写昆虫的生活：蝉的歌唱、蚂蚁的勤劳、萤火虫的微光…… 像听大自然的小故事，充满趣味又很舒缓。',
    coverImageUrl: 'https://example.com/cover_insect.png',
    narrators: [
      { id: 'female-4', name: '科普女声', audioUrl: 'https://example.com/audio_insect_female.mp3' },
    ],
  },
  {
    id: '6',
    title: '飞鸟集',
    author: '泰戈尔',
    category: CATEGORIES.POETRY,
    description: '短诗篇幅都很短，一句就是一个小意境，比如 “生如夏花之绚烂，死如秋叶之静美”，语言清新，听着毫无负担。',
    coverImageUrl: 'https://example.com/cover_feiniao.png',
    narrators: [
      { id: 'male-4', name: '诗意男声', audioUrl: 'https://example.com/audio_feiniao_male.mp3' },
      { id: 'female-5', name: '清澈女声', audioUrl: 'https://example.com/audio_feiniao_female.mp3' },
    ],
  },
];
