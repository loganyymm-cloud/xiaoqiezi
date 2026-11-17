(function () {
  'use strict';

  /* ======================================================================
     Words
     ====================================================================== */
  var LANGS = [['zh-CN', '简体中文'], ['zh-TW', '繁體中文'], ['en', 'English'], ['ja', '日本語'], ['ko', '한국어'], ['fr', 'Français']];
  var LOCALE = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', en: 'en-CA', ja: 'ja-JP', ko: 'ko-KR', fr: 'fr-CA' };

  var I18N = {
    'zh-CN': {
      title: '茄子萌的小世界', sub: '只属于你一个人',
      ev_met: '我们认识', ev_fly: '老婆飞到加拿大', ev_bday: '老婆生日 😘',
      down: '还有', up: '已经', today: '就是今天',
      d: '天', h: '时', m: '分', s: '秒', ld: '天', lh: '小时', lm: '分', ls: '秒',
      dayN: '今天是第 {n} 天', msDay: '第 {n} 天', msYear: '{n} 周年', msIn: '还有 {d} 天',
      totalUnit: '秒', tmin: '分钟', thour: '小时', tday: '天',
      styleLabel: '样式', st_flip: '翻页钟', st_ring: '圆环', st_big: '大数字', st_pixel: '像素', st_line: '一句话', st_total: '总秒数',
      settings: '设置', done: '完成',
      sec_events: '日子', name: '名称', date: '日期', time: '时间', tz: '时区', repeat: '每年重复', del: '删除', add: '添加一个日子', newEv: '新的日子', setMain: '设为主显示', isMain: '主显示',
      sec_style: '倒计时样式',
      sec_bg: '背景', scene: '场景', upload: '上传背景图', change: '换一张', remove: '移除图片', imgOpacity: '背景图透明度', blur: '背景模糊', dim: '背景变暗', fit: '图片显示', fit_cover: '铺满', fit_contain: '完整', fx: '飘落效果', fx_none: '无', fx_stars: '星星', fx_snow: '雪花', fx_hearts: '爱心', fx_egg: '小茄子',
      sc_aubergine: '茄子夜', sc_dusk: '晚霞', sc_snow: '雪天', sc_sakura: '樱花', sc_milktea: '奶茶', sc_ink: '纯黑',
      sec_card: '倒计时卡片', cardOpacity: '卡片透明度', cardBlur: '毛玻璃', radius: '圆角',
      sec_text: '文字', font: '字体', numFont: '数字字体', nf_auto: '跟随样式', nf_text: '跟随文字字体', scale: '大小', color: '文字颜色', c_auto: '自动', c_light: '白色', c_dark: '深色', c_custom: '自定义', accent: '强调色',
      f_system: '系统默认', f_serif: '思源宋体', f_sans: '思源黑体', f_kuaile: '站酷快乐体', f_mashan: '毛笔楷书', f_longcang: '手写行书', f_xiaowei: '站酷小薇',
      sec_lang: '语言', sec_title: '标题', titleLabel: '标题', subLabel: '副标题',
      save: '保存到网页', saveHint: '保存后，打开这个网页的人看到的都是现在的样子。', saving: '正在保存…', saved: '已保存，打开这个网页看到的就是这样。', unsaved: '有改动还没保存到网页。', localOnly: '改动只保存在这台设备上。', saveFail: '保存失败，请再试一次。', readOnly: '你的设置会保存在这台设备上，只改变你自己看到的样子。', tooLarge: '背景图太大，换一张小一点的再保存。',
      reset: '恢复默认', resetAsk: '确定恢复默认吗？背景图和所有改动都会清除。', cancel: '取消', confirm: '确定恢复',
      imgFail: '这张图片打不开，换一张试试。',
      tz_sh: '北京时间', tz_tor: '多伦多时间', tz_ny: '纽约时间', tz_van: '温哥华时间', tz_tyo: '东京时间', tz_par: '巴黎时间', tz_lon: '伦敦时间', tz_local: '设备所在时区',
      download: '下载网页文件', dlHint: '改完点下载，会得到一个新的网页文件，里面带着现在的设置和背景图。把这个文件发给她，她打开就是这个样子。', downloaded: '已下载，在“下载”文件夹里。把新文件发给她就行。', remoteNew: '网页刚被另一边更新了。你这边还有没保存的改动，点保存会用你的版本覆盖。'
    },
    'zh-TW': {
      title: '茄子萌的小世界', sub: '只屬於你一個人',
      ev_met: '我們認識', ev_fly: '老婆飛到加拿大', ev_bday: '老婆生日 😘',
      down: '還有', up: '已經', today: '就是今天',
      d: '天', h: '時', m: '分', s: '秒', ld: '天', lh: '小時', lm: '分', ls: '秒',
      dayN: '今天是第 {n} 天', msDay: '第 {n} 天', msYear: '{n} 週年', msIn: '還有 {d} 天',
      totalUnit: '秒', tmin: '分鐘', thour: '小時', tday: '天',
      styleLabel: '樣式', st_flip: '翻頁鐘', st_ring: '圓環', st_big: '大數字', st_pixel: '像素', st_line: '一句話', st_total: '總秒數',
      settings: '設定', done: '完成',
      sec_events: '日子', name: '名稱', date: '日期', time: '時間', tz: '時區', repeat: '每年重複', del: '刪除', add: '新增一個日子', newEv: '新的日子', setMain: '設為主顯示', isMain: '主顯示',
      sec_style: '倒數樣式',
      sec_bg: '背景', scene: '場景', upload: '上傳背景圖', change: '換一張', remove: '移除圖片', imgOpacity: '背景圖透明度', blur: '背景模糊', dim: '背景變暗', fit: '圖片顯示', fit_cover: '鋪滿', fit_contain: '完整', fx: '飄落效果', fx_none: '無', fx_stars: '星星', fx_snow: '雪花', fx_hearts: '愛心', fx_egg: '小茄子',
      sc_aubergine: '茄子夜', sc_dusk: '晚霞', sc_snow: '雪天', sc_sakura: '櫻花', sc_milktea: '奶茶', sc_ink: '純黑',
      sec_card: '倒數卡片', cardOpacity: '卡片透明度', cardBlur: '毛玻璃', radius: '圓角',
      sec_text: '文字', font: '字體', numFont: '數字字體', nf_auto: '跟隨樣式', nf_text: '跟隨文字字體', scale: '大小', color: '文字顏色', c_auto: '自動', c_light: '白色', c_dark: '深色', c_custom: '自訂', accent: '強調色',
      f_system: '系統預設', f_serif: '思源宋體', f_sans: '思源黑體', f_kuaile: '站酷快樂體', f_mashan: '毛筆楷書', f_longcang: '手寫行書', f_xiaowei: '站酷小薇',
      sec_lang: '語言', sec_title: '標題', titleLabel: '標題', subLabel: '副標題',
      save: '儲存到網頁', saveHint: '儲存後，打開這個網頁的人看到的都是現在的樣子。', saving: '正在儲存…', saved: '已儲存，打開這個網頁看到的就是這樣。', unsaved: '有改動還沒儲存到網頁。', localOnly: '改動只儲存在這台裝置上。', saveFail: '儲存失敗，請再試一次。', readOnly: '你的設定會儲存在這台裝置上，只改變你自己看到的樣子。', tooLarge: '背景圖太大，換一張小一點的再儲存。',
      reset: '恢復預設', resetAsk: '確定恢復預設嗎？背景圖和所有改動都會清除。', cancel: '取消', confirm: '確定恢復',
      imgFail: '這張圖片打不開，換一張試試。',
      tz_sh: '北京時間', tz_tor: '多倫多時間', tz_ny: '紐約時間', tz_van: '溫哥華時間', tz_tyo: '東京時間', tz_par: '巴黎時間', tz_lon: '倫敦時間', tz_local: '裝置所在時區',
      download: '下載網頁檔案', dlHint: '改完點下載，會得到一個新的網頁檔案，裡面帶著現在的設定和背景圖。把這個檔案傳給她，她打開就是這個樣子。', downloaded: '已下載，在「下載」資料夾裡。把新檔案傳給她就行。', remoteNew: '網頁剛被另一邊更新了。你這邊還有沒儲存的改動，點儲存會用你的版本覆蓋。'
    },
    en: {
      title: '茄子萌\'s Little World', sub: 'Made only for you',
      ev_met: 'The day we met', ev_fly: 'Your flight to Canada', ev_bday: 'Your birthday 😘',
      down: 'Time left', up: 'Time so far', today: 'Today is the day',
      d: 'days', h: 'hrs', m: 'min', s: 'sec', ld: ['day', 'days'], lh: ['hour', 'hours'], lm: ['minute', 'minutes'], ls: ['second', 'seconds'],
      dayN: 'Today is day {n}', msDay: 'Day {n}', msYear: ['{n} year', '{n} years'], msIn: ['in {d} day', 'in {d} days'],
      totalUnit: 'seconds', tmin: 'minutes', thour: 'hours', tday: 'days',
      styleLabel: 'Style', st_flip: 'Flip clock', st_ring: 'Rings', st_big: 'Big number', st_pixel: 'Pixel', st_line: 'One line', st_total: 'Total seconds',
      settings: 'Settings', done: 'Done',
      sec_events: 'Days', name: 'Name', date: 'Date', time: 'Time', tz: 'Time zone', repeat: 'Repeat every year', del: 'Delete', add: 'Add a day', newEv: 'New day', setMain: 'Show as main', isMain: 'Main',
      sec_style: 'Countdown style',
      sec_bg: 'Background', scene: 'Scene', upload: 'Upload a background', change: 'Change image', remove: 'Remove image', imgOpacity: 'Image transparency', blur: 'Blur', dim: 'Darken', fit: 'Image fit', fit_cover: 'Fill', fit_contain: 'Fit', fx: 'Falling effect', fx_none: 'None', fx_stars: 'Stars', fx_snow: 'Snow', fx_hearts: 'Hearts', fx_egg: 'Eggplants',
      sc_aubergine: 'Eggplant night', sc_dusk: 'Dusk', sc_snow: 'Snow day', sc_sakura: 'Sakura', sc_milktea: 'Milk tea', sc_ink: 'Black',
      sec_card: 'Countdown card', cardOpacity: 'Card transparency', cardBlur: 'Frosted glass', radius: 'Corner radius',
      sec_text: 'Text', font: 'Font', numFont: 'Number font', nf_auto: 'Match the style', nf_text: 'Match the text font', scale: 'Size', color: 'Text colour', c_auto: 'Auto', c_light: 'White', c_dark: 'Dark', c_custom: 'Custom', accent: 'Accent colour',
      f_system: 'System default', f_serif: 'Noto Serif', f_sans: 'Noto Sans', f_kuaile: 'ZCOOL KuaiLe', f_mashan: 'Brush script', f_longcang: 'Handwriting', f_xiaowei: 'ZCOOL XiaoWei',
      sec_lang: 'Language', sec_title: 'Title', titleLabel: 'Title', subLabel: 'Subtitle',
      save: 'Save to the page', saveHint: 'After saving, everyone who opens the page sees it like this.', saving: 'Saving…', saved: 'Saved. Everyone who opens the page sees it like this.', unsaved: 'Some changes are not saved to the page yet.', localOnly: 'Changes stay on this device only.', saveFail: 'Could not save. Try again.', readOnly: 'Your settings are kept on this device and only change what you see.', tooLarge: 'The background image is too large. Pick a smaller one and save again.',
      reset: 'Reset to default', resetAsk: 'Reset everything? The background image and all changes will be cleared.', cancel: 'Cancel', confirm: 'Reset',
      imgFail: 'This image could not be opened. Try another one.',
      tz_sh: 'Beijing time', tz_tor: 'Toronto time', tz_ny: 'New York time', tz_van: 'Vancouver time', tz_tyo: 'Tokyo time', tz_par: 'Paris time', tz_lon: 'London time', tz_local: 'This device\'s time zone',
      download: 'Download the page', dlHint: 'Download a new copy of this page with the current settings and background inside. Send her that file and it opens just like this.', downloaded: 'Saved to your Downloads folder. Send her the new file.', remoteNew: 'The page was just updated from the other side. You still have unsaved changes; saving will replace it with yours.'
    },
    ja: {
      title: '茄子萌の小さな世界', sub: 'あなただけのために',
      ev_met: '出会った日', ev_fly: 'カナダに来る日', ev_bday: 'お誕生日 😘',
      down: 'あと', up: 'あれから', today: '今日がその日',
      d: '日', h: '時間', m: '分', s: '秒', ld: '日', lh: '時間', lm: '分', ls: '秒',
      dayN: '今日で {n} 日目', msDay: '{n} 日目', msYear: '{n} 周年', msIn: 'あと {d} 日',
      totalUnit: '秒', tmin: '分', thour: '時間', tday: '日',
      styleLabel: 'スタイル', st_flip: 'フリップ時計', st_ring: 'リング', st_big: '大きな数字', st_pixel: 'ピクセル', st_line: 'ひとこと', st_total: '合計秒数',
      settings: '設定', done: '完了',
      sec_events: '記念日', name: '名前', date: '日付', time: '時刻', tz: 'タイムゾーン', repeat: '毎年くり返す', del: '削除', add: '日付を追加', newEv: '新しい日', setMain: 'メインに表示', isMain: 'メイン',
      sec_style: 'カウントダウンのスタイル',
      sec_bg: '背景', scene: 'シーン', upload: '背景画像をアップロード', change: '画像を変更', remove: '画像を削除', imgOpacity: '画像の透明度', blur: 'ぼかし', dim: '暗くする', fit: '画像の表示', fit_cover: '全体に広げる', fit_contain: '全体を表示', fx: '降るエフェクト', fx_none: 'なし', fx_stars: '星', fx_snow: '雪', fx_hearts: 'ハート', fx_egg: 'ミニなす',
      sc_aubergine: 'なすの夜', sc_dusk: '夕焼け', sc_snow: '雪の日', sc_sakura: '桜', sc_milktea: 'ミルクティー', sc_ink: '黒',
      sec_card: 'カウントダウンのカード', cardOpacity: 'カードの透明度', cardBlur: 'すりガラス', radius: '角の丸み',
      sec_text: '文字', font: 'フォント', numFont: '数字のフォント', nf_auto: 'スタイルに合わせる', nf_text: '文字のフォントに合わせる', scale: 'サイズ', color: '文字の色', c_auto: '自動', c_light: '白', c_dark: '濃い色', c_custom: 'カスタム', accent: 'アクセントカラー',
      f_system: 'システム標準', f_serif: '明朝体', f_sans: 'ゴシック体', f_kuaile: 'ZCOOL 快楽体', f_mashan: '筆文字', f_longcang: '手書き', f_xiaowei: 'ZCOOL 小薇',
      sec_lang: '言語', sec_title: 'タイトル', titleLabel: 'タイトル', subLabel: 'サブタイトル',
      save: 'ページに保存', saveHint: '保存すると、このページを開く人はみんな今の見た目で見られます。', saving: '保存中…', saved: '保存しました。このページを開くと、この見た目で表示されます。', unsaved: 'まだページに保存していない変更があります。', localOnly: '変更はこの端末だけに保存されます。', saveFail: '保存できませんでした。もう一度お試しください。', readOnly: '設定はこの端末に保存され、あなたが見る画面だけが変わります。', tooLarge: '背景画像が大きすぎます。小さい画像に変えて保存してください。',
      reset: '初期設定に戻す', resetAsk: '初期設定に戻しますか？背景画像とすべての変更が消えます。', cancel: 'キャンセル', confirm: '戻す',
      imgFail: 'この画像は開けません。別の画像をお試しください。',
      tz_sh: '北京時間', tz_tor: 'トロント時間', tz_ny: 'ニューヨーク時間', tz_van: 'バンクーバー時間', tz_tyo: '東京時間', tz_par: 'パリ時間', tz_lon: 'ロンドン時間', tz_local: 'この端末のタイムゾーン',
      download: 'ページをダウンロード', dlHint: '今の設定と背景画像が入った新しいページファイルをダウンロードします。そのファイルを送れば、彼女にもこの見た目で開きます。', downloaded: 'ダウンロードしました（「ダウンロード」フォルダ）。新しいファイルを送ってください。', remoteNew: '相手側でページが更新されました。こちらに未保存の変更があり、保存するとこちらの内容で上書きされます。'
    },
    ko: {
      title: '茄子萌의 작은 세상', sub: '오직 너만을 위해',
      ev_met: '우리가 만난 날', ev_fly: '캐나다에 오는 날', ev_bday: '생일 😘',
      down: '남은 시간', up: '지난 시간', today: '바로 오늘',
      d: '일', h: '시간', m: '분', s: '초', ld: '일', lh: '시간', lm: '분', ls: '초',
      dayN: '오늘은 {n}일째', msDay: '{n}일째', msYear: '{n}주년', msIn: '{d}일 남음',
      totalUnit: '초', tmin: '분', thour: '시간', tday: '일',
      styleLabel: '스타일', st_flip: '플립 시계', st_ring: '링', st_big: '큰 숫자', st_pixel: '픽셀', st_line: '한 줄', st_total: '총 초',
      settings: '설정', done: '완료',
      sec_events: '기념일', name: '이름', date: '날짜', time: '시간', tz: '시간대', repeat: '매년 반복', del: '삭제', add: '날짜 추가', newEv: '새로운 날', setMain: '메인으로 표시', isMain: '메인',
      sec_style: '카운트다운 스타일',
      sec_bg: '배경', scene: '장면', upload: '배경 이미지 올리기', change: '이미지 바꾸기', remove: '이미지 삭제', imgOpacity: '이미지 투명도', blur: '흐림', dim: '어둡게', fit: '이미지 표시', fit_cover: '채우기', fit_contain: '전체 보기', fx: '떨어지는 효과', fx_none: '없음', fx_stars: '별', fx_snow: '눈', fx_hearts: '하트', fx_egg: '꼬마 가지',
      sc_aubergine: '가지 밤', sc_dusk: '노을', sc_snow: '눈 오는 날', sc_sakura: '벚꽃', sc_milktea: '밀크티', sc_ink: '검정',
      sec_card: '카운트다운 카드', cardOpacity: '카드 투명도', cardBlur: '반투명 유리', radius: '모서리 둥글기',
      sec_text: '글자', font: '글꼴', numFont: '숫자 글꼴', nf_auto: '스타일에 맞춤', nf_text: '글자 글꼴에 맞춤', scale: '크기', color: '글자 색', c_auto: '자동', c_light: '흰색', c_dark: '어두운 색', c_custom: '직접 선택', accent: '강조 색',
      f_system: '시스템 기본', f_serif: '명조체', f_sans: '고딕체', f_kuaile: 'ZCOOL 콰이러', f_mashan: '붓글씨', f_longcang: '손글씨', f_xiaowei: 'ZCOOL 샤오웨이',
      sec_lang: '언어', sec_title: '제목', titleLabel: '제목', subLabel: '부제목',
      save: '페이지에 저장', saveHint: '저장하면 이 페이지를 여는 사람 모두에게 지금 모습이 보여요.', saving: '저장 중…', saved: '저장했어요. 이 페이지를 열면 이렇게 보여요.', unsaved: '아직 페이지에 저장하지 않은 변경 사항이 있어요.', localOnly: '변경 사항은 이 기기에만 저장돼요.', saveFail: '저장하지 못했어요. 다시 시도해 주세요.', readOnly: '설정은 이 기기에 저장되고, 내가 보는 화면만 바뀌어요.', tooLarge: '배경 이미지가 너무 커요. 더 작은 이미지로 바꿔서 저장해 주세요.',
      reset: '기본값으로 되돌리기', resetAsk: '기본값으로 되돌릴까요? 배경 이미지와 모든 변경 사항이 지워져요.', cancel: '취소', confirm: '되돌리기',
      imgFail: '이 이미지를 열 수 없어요. 다른 이미지를 사용해 주세요.',
      tz_sh: '베이징 시간', tz_tor: '토론토 시간', tz_ny: '뉴욕 시간', tz_van: '밴쿠버 시간', tz_tyo: '도쿄 시간', tz_par: '파리 시간', tz_lon: '런던 시간', tz_local: '이 기기의 시간대',
      download: '페이지 파일 다운로드', dlHint: '지금 설정과 배경 이미지가 들어간 새 페이지 파일을 받아요. 그 파일을 보내면 그녀도 이 모습 그대로 열 수 있어요.', downloaded: '다운로드했어요(다운로드 폴더). 새 파일을 보내 주세요.', remoteNew: '상대 쪽에서 페이지가 방금 바뀌었어요. 저장하지 않은 변경 사항이 있어서, 저장하면 내 버전으로 덮어써요.'
    },
    fr: {
      title: 'Le petit monde de 茄子萌', sub: 'Rien que pour toi',
      ev_met: 'Notre rencontre', ev_fly: 'Ton vol vers le Canada', ev_bday: 'Ton anniversaire 😘',
      down: 'Il reste', up: 'Déjà', today: 'C\'est aujourd\'hui',
      d: 'jours', h: 'h', m: 'min', s: 's', ld: ['jour', 'jours'], lh: ['heure', 'heures'], lm: ['minute', 'minutes'], ls: ['seconde', 'secondes'],
      dayN: 'Aujourd\'hui, c\'est le jour {n}', msDay: 'Jour {n}', msYear: ['{n} an', '{n} ans'], msIn: ['dans {d} jour', 'dans {d} jours'],
      totalUnit: 'secondes', tmin: 'minutes', thour: 'heures', tday: 'jours',
      styleLabel: 'Style', st_flip: 'Horloge à volets', st_ring: 'Anneaux', st_big: 'Grand chiffre', st_pixel: 'Pixel', st_line: 'Une phrase', st_total: 'Total en secondes',
      settings: 'Réglages', done: 'Terminé',
      sec_events: 'Dates', name: 'Nom', date: 'Date', time: 'Heure', tz: 'Fuseau horaire', repeat: 'Répéter chaque année', del: 'Supprimer', add: 'Ajouter une date', newEv: 'Nouvelle date', setMain: 'Afficher en grand', isMain: 'En grand',
      sec_style: 'Style du compte à rebours',
      sec_bg: 'Arrière-plan', scene: 'Décor', upload: 'Téléverser une image', change: 'Changer l\'image', remove: 'Retirer l\'image', imgOpacity: 'Transparence de l\'image', blur: 'Flou', dim: 'Assombrir', fit: 'Affichage de l\'image', fit_cover: 'Remplir', fit_contain: 'Entière', fx: 'Effet de chute', fx_none: 'Aucun', fx_stars: 'Étoiles', fx_snow: 'Neige', fx_hearts: 'Cœurs', fx_egg: 'Aubergines',
      sc_aubergine: 'Nuit aubergine', sc_dusk: 'Crépuscule', sc_snow: 'Jour de neige', sc_sakura: 'Sakura', sc_milktea: 'Thé au lait', sc_ink: 'Noir',
      sec_card: 'Carte du compte à rebours', cardOpacity: 'Transparence de la carte', cardBlur: 'Verre dépoli', radius: 'Coins arrondis',
      sec_text: 'Texte', font: 'Police', numFont: 'Police des chiffres', nf_auto: 'Selon le style', nf_text: 'Comme le texte', scale: 'Taille', color: 'Couleur du texte', c_auto: 'Auto', c_light: 'Blanc', c_dark: 'Foncé', c_custom: 'Perso', accent: 'Couleur d\'accent',
      f_system: 'Police du système', f_serif: 'Noto Serif', f_sans: 'Noto Sans', f_kuaile: 'ZCOOL KuaiLe', f_mashan: 'Pinceau', f_longcang: 'Manuscrite', f_xiaowei: 'ZCOOL XiaoWei',
      sec_lang: 'Langue', sec_title: 'Titre', titleLabel: 'Titre', subLabel: 'Sous-titre',
      save: 'Enregistrer sur la page', saveHint: 'Une fois enregistrée, la page s\'affiche comme ça pour tout le monde.', saving: 'Enregistrement…', saved: 'Enregistré. La page s\'affiche comme ça pour tout le monde.', unsaved: 'Des modifications ne sont pas encore enregistrées sur la page.', localOnly: 'Les modifications restent sur cet appareil.', saveFail: 'L\'enregistrement a échoué. Réessaie.', readOnly: 'Tes réglages restent sur cet appareil et ne changent que ce que tu vois.', tooLarge: 'L\'image est trop lourde. Choisis-en une plus petite, puis enregistre.',
      reset: 'Rétablir par défaut', resetAsk: 'Tout rétablir ? L\'image et toutes les modifications seront effacées.', cancel: 'Annuler', confirm: 'Rétablir',
      imgFail: 'Impossible d\'ouvrir cette image. Essaie avec une autre.',
      tz_sh: 'Heure de Pékin', tz_tor: 'Heure de Toronto', tz_ny: 'Heure de New York', tz_van: 'Heure de Vancouver', tz_tyo: 'Heure de Tokyo', tz_par: 'Heure de Paris', tz_lon: 'Heure de Londres', tz_local: 'Fuseau de cet appareil',
      download: 'Télécharger la page', dlHint: 'Télécharge une nouvelle copie de la page avec les réglages et l\'image actuels. Envoie-lui ce fichier : elle la verra comme ça.', downloaded: 'Enregistré dans Téléchargements. Envoie-lui le nouveau fichier.', remoteNew: 'La page vient d\'être modifiée de l\'autre côté. Tu as des changements non enregistrés : enregistrer les remplacera par les tiens.'
    }
  };

  /* ======================================================================
     Catalogues
     ====================================================================== */
  var TZS = [['Asia/Shanghai', 'tz_sh'], ['America/Toronto', 'tz_tor'], ['America/New_York', 'tz_ny'], ['America/Vancouver', 'tz_van'], ['Asia/Tokyo', 'tz_tyo'], ['Europe/Paris', 'tz_par'], ['Europe/London', 'tz_lon'], ['local', 'tz_local']];
  var STYLE_IDS = ['flip', 'ring', 'big', 'pixel', 'line', 'total'];
  var SCENES = {
    aubergine: { tone: 'dark', css: 'radial-gradient(120% 80% at 82% 0%, #5c2b74 0%, rgba(92,43,116,0) 60%), radial-gradient(90% 70% at 0% 100%, #40205c 0%, rgba(64,32,92,0) 55%), linear-gradient(180deg, #1a0d22 0%, #2a1338 55%, #150a1c 100%)' },
    dusk: { tone: 'dark', css: 'linear-gradient(180deg, #24163f 0%, #5b2f66 34%, #b8566a 66%, #eda273 100%)' },
    snow: { tone: 'light', css: 'radial-gradient(90% 60% at 20% 0%, #cfdbe8 0%, rgba(207,219,232,0) 60%), linear-gradient(180deg, #dde6ef 0%, #eef2f6 55%, #f8f9fb 100%)' },
    sakura: { tone: 'light', css: 'radial-gradient(100% 70% at 15% 0%, #ffcfdc 0%, rgba(255,207,220,0) 60%), linear-gradient(180deg, #fbe2e9 0%, #fdf1ee 100%)' },
    milktea: { tone: 'light', css: 'radial-gradient(90% 60% at 85% 8%, #dfc3a3 0%, rgba(223,195,163,0) 60%), linear-gradient(180deg, #e6d2ba 0%, #f3e7d8 100%)' },
    ink: { tone: 'dark', css: 'linear-gradient(#0b0b0d, #0b0b0d)' }
  };
  var CJK = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  var FONTS = {
    serif: { g: 'Noto+Serif+SC:wght@400;600;900', css: '"Noto Serif SC", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif' },
    sans: { g: 'Noto+Sans+SC:wght@400;500;700', css: '"Noto Sans SC", ' + CJK },
    system: { g: '', css: 'system-ui, -apple-system, ' + CJK },
    kuaile: { g: 'ZCOOL+KuaiLe', css: '"ZCOOL KuaiLe", ' + CJK },
    xiaowei: { g: 'ZCOOL+XiaoWei', css: '"ZCOOL XiaoWei", "Songti SC", serif' },
    mashan: { g: 'Ma+Shan+Zheng', css: '"Ma Shan Zheng", "Kaiti SC", "KaiTi", serif' },
    longcang: { g: 'Long+Cang', css: '"Long Cang", "Kaiti SC", "KaiTi", cursive' }
  };
  var NUMFONTS = {
    fraunces: { label: 'Fraunces', g: '', css: '"Fraunces", "Noto Serif SC", serif' },
    barlow: { label: 'Barlow Condensed', g: '', css: '"Barlow Condensed", "Arial Narrow", sans-serif' },
    mono: { label: 'DM Mono', g: '', css: '"DM Mono", ui-monospace, Menlo, monospace' },
    pixel: { label: 'Press Start 2P', g: '', css: '"Press Start 2P", ui-monospace, monospace' },
    hand: { label: 'Caveat', g: 'Caveat:wght@500;700', css: '"Caveat", cursive' },
    tech: { label: 'Orbitron', g: 'Orbitron:wght@500;700', css: '"Orbitron", sans-serif' }
  };
  var STYLE_NUM = { flip: 'barlow', ring: 'fraunces', big: 'fraunces', pixel: 'pixel', line: 'text', total: 'mono' };

  var DEFAULTS = {
    v: 1, rev: 1,
    lang: 'zh-CN', title: null, subtitle: null,
    main: 'fly', style: 'flip',
    events: [
      { id: 'met', name: null, date: '2026-07-30', time: '00:00', tz: 'Asia/Shanghai', repeat: false },
      { id: 'fly', name: null, date: '2026-12-19', time: '00:00', tz: 'America/Toronto', repeat: false },
      { id: 'bday', name: null, date: '2027-08-20', time: '00:00', tz: 'America/Toronto', repeat: true }
    ],
    bg: { scene: 'aubergine', image: null, imgLum: null, imgAlpha: 100, blur: 0, dim: 30, fit: 'cover', fx: 'stars' },
    card: { opacity: 38, blur: 14, radius: 28 },
    text: { font: 'serif', numFont: 'auto', scale: 100, color: 'auto', custom: '#ffffff', accent: '#9bd96f' }
  };

  /* ======================================================================
     State: what the page was published with, plus this device's own edits
     ====================================================================== */
  var KEY = 'qzm-draft-v1';
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function fill(target, defs) {
    for (var k in defs) {
      if (target[k] === undefined) target[k] = clone(defs[k]);
      else if (isObj(defs[k])) { if (isObj(target[k])) fill(target[k], defs[k]); else target[k] = clone(defs[k]); }
    }
    return target;
  }
  function normalize(s) {
    s = fill(isObj(s) ? clone(s) : {}, DEFAULTS);
    if (!Array.isArray(s.events)) s.events = clone(DEFAULTS.events);
    s.events = s.events.filter(isObj).map(function (e, i) {
      return fill(e, { id: 'e' + i, name: null, date: '2027-01-01', time: '00:00', tz: 'local', repeat: false });
    });
    if (!s.events.length) s.events = clone(DEFAULTS.events);
    if (!s.events.some(function (e) { return e.id === s.main; })) s.main = s.events[0].id;
    if (!I18N[s.lang]) s.lang = 'zh-CN';
    if (STYLE_IDS.indexOf(s.style) < 0) s.style = 'flip';
    if (!SCENES[s.bg.scene]) s.bg.scene = 'aubergine';
    if (!FONTS[s.text.font]) s.text.font = 'serif';
    return s;
  }
  function readDraft() {
    try { var d = JSON.parse(localStorage.getItem(KEY)); return isObj(d) ? d : null; } catch (e) { return null; }
  }
  function dropDraft() { try { localStorage.removeItem(KEY); } catch (e) { /* storage may be off */ } }

  var published;
  try { published = JSON.parse(document.getElementById('qz-data').textContent); } catch (e) { published = {}; }
  published = normalize(published);

  var state, dirty = false;
  (function () {
    var d = readDraft();
    if (d && d.baseRev === published.rev && isObj(d.state)) {
      if (d.state.bg && d.state.bg.image === '@pub') d.state.bg.image = published.bg.image;
      state = normalize(d.state); dirty = !!d.dirty;
    } else {
      state = clone(published); dropDraft();
    }
  })();

  var draftTimer = 0;
  function writeDraft() {
    var copy = clone(state);
    if (copy.bg.image && copy.bg.image === published.bg.image) copy.bg.image = '@pub';
    try { localStorage.setItem(KEY, JSON.stringify({ baseRev: published.rev, dirty: dirty, state: copy })); } catch (e) { /* too big or storage off: keep in memory */ }
  }
  function scheduleDraft() { clearTimeout(draftTimer); draftTimer = setTimeout(writeDraft, 250); }

  function t(key, vars, n) {
    var v = (I18N[state.lang] || I18N['zh-CN'])[key];
    if (v == null) v = I18N['zh-CN'][key];
    if (v == null) return key;
    if (Array.isArray(v)) v = v[n === 1 ? 0 : 1];
    if (vars) for (var k in vars) v = v.split('{' + k + '}').join(vars[k]);
    return v;
  }
  function evName(ev) {
    if (ev.name != null && ev.name !== '') return ev.name;
    return I18N['zh-CN']['ev_' + ev.id] ? t('ev_' + ev.id) : t('newEv');
  }
  function mainEv() {
    for (var i = 0; i < state.events.length; i++) if (state.events[i].id === state.main) return state.events[i];
    return state.events[0];
  }

  /* ======================================================================
     Time
     ====================================================================== */
  var fmtCache = {};
  function partsIn(tz, ms) {
    if (tz !== 'local') {
      try {
        var f = fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        var o = {};
        f.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = +p.value; });
        return { y: o.year, m: o.month, d: o.day, h: o.hour % 24, mi: o.minute, s: o.second };
      } catch (e) { /* unknown zone: fall through to the device's own */ }
    }
    var dt = new Date(ms);
    return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate(), h: dt.getHours(), mi: dt.getMinutes(), s: dt.getSeconds() };
  }
  function tzKnown(tz) {
    if (tz === 'local') return false;
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
  }
  /* The instant at which a wall clock in `tz` reads y-m-d h:mi. */
  function wallToUtc(y, m, d, h, mi, tz) {
    if (!tzKnown(tz)) return new Date(y, m - 1, d, h, mi, 0).getTime();
    var guess = Date.UTC(y, m - 1, d, h, mi, 0);
    function off(ms) { var p = partsIn(tz, ms); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - ms; }
    return guess - off(guess - off(guess));
  }
  function evParts(ev) {
    var a = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(ev.date || '');
    if (!a) return null;
    var b = /^(\d{1,2}):(\d{2})/.exec(ev.time || '');
    return { y: +a[1], m: +a[2], d: +a[3], h: b ? +b[1] : 0, mi: b ? +b[2] : 0 };
  }
  /* mode: 'down' counts to the target, 'up' counts from it, 'today' is a yearly day that is happening now. */
  function resolve(ev, now) {
    var p = evParts(ev);
    if (!p) return null;
    var tz = ev.tz || 'local';
    var first = wallToUtc(p.y, p.m, p.d, p.h, p.mi, tz);
    if (!ev.repeat || now < first) return { target: first, mode: now < first ? 'down' : 'up', p: p, tz: tz, year: p.y };
    var cy = partsIn(tz, now).y;
    var occ = wallToUtc(cy, p.m, p.d, p.h, p.mi, tz);
    if (now < occ) return { target: occ, mode: 'down', p: p, tz: tz, year: cy };
    if (now - occ < 86400000) return { target: occ, mode: 'today', p: p, tz: tz, year: cy };
    return { target: wallToUtc(cy + 1, p.m, p.d, p.h, p.mi, tz), mode: 'down', p: p, tz: tz, year: cy + 1 };
  }
  function breakdown(r, now) {
    var ms = Math.abs(r.target - now);
    var T = r.mode === 'down' ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
    return { T: T, d: Math.floor(T / 86400), h: Math.floor(T % 86400 / 3600), m: Math.floor(T % 3600 / 60), s: T % 60 };
  }
  function dayNum(y, m, d) { return Math.round(Date.UTC(y, m - 1, d) / 86400000); }
  function fmtDay(n, weekday) {
    var opt = { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' };
    if (weekday) opt.weekday = 'long';
    return new Intl.DateTimeFormat(LOCALE[state.lang], opt).format(new Date(n * 86400000 + 43200000));
  }
  function tzLabel(tz) {
    for (var i = 0; i < TZS.length; i++) if (TZS[i][0] === tz) return t(TZS[i][1]);
    return tz;
  }
  function dateLine(ev, r) {
    var s = fmtDay(dayNum(r.year, r.p.m, r.p.d), true) + ' · ' + tzLabel(r.tz);
    if (r.p.h || r.p.mi) s += ' ' + pad2(r.p.h) + ':' + pad2(r.p.mi);
    return s;
  }
  /* For a day that has passed: which day this is, and the next round one (every 100 days, or a full year). */
  function noteFor(ev, r, now) {
    if (r.mode !== 'up' || ev.repeat) return null;
    var td = partsIn(r.tz, now);
    var n0 = dayNum(r.p.y, r.p.m, r.p.d), nt = dayNum(td.y, td.m, td.d);
    var idx = nt - n0 + 1;
    if (idx < 1) return null;
    var hundred = (Math.floor(idx / 100) + 1) * 100, dH = hundred - idx;
    var k = Math.max(1, td.y - r.p.y), an = dayNum(r.p.y + k, r.p.m, r.p.d);
    if (an <= nt) { k++; an = dayNum(r.p.y + k, r.p.m, r.p.d); }
    var dA = an - nt;
    if (td.y > r.p.y && dayNum(td.y, r.p.m, r.p.d) === nt) return { dayN: t('dayN', { n: idx }), next: t('msYear', { n: td.y - r.p.y }, td.y - r.p.y) + ' · ' + t('today') };
    var ms = dA <= dH
      ? t('msYear', { n: k }, k) + ' · ' + fmtDay(an) + ' · ' + t('msIn', { d: dA }, dA)
      : t('msDay', { n: hundred }) + ' · ' + fmtDay(n0 + hundred - 1) + ' · ' + t('msIn', { d: dH }, dH);
    return { dayN: t('dayN', { n: idx }), next: ms };
  }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtNum(n) { return n.toLocaleString(LOCALE[state.lang]); }

  /* ======================================================================
     DOM helper
     ====================================================================== */
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    if (kids != null) (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      el.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  function setText(el, s) { if (el.textContent !== s) el.textContent = s; }
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ======================================================================
     Pixel sprites (the little eggplant from the game, and a heart)
     ====================================================================== */
  var EGG = ['....gG.....', '...gGGg....', '..GGGGGG...', '..GgPPgG...', '..KPPPPK...', '.KPLPPPPK..', '.KPLPPPPK..', 'KPLPPPPPPK.', 'KPPePPePPK.', 'KPrPPPPrPK.', 'KPPPPPPPpK.', 'KPPPPPPppK.', '.KPPPPppK..', '..KKKKKK...'];
  var EGG_C = { G: '#7fcf5e', g: '#3f8f3a', P: '#8a45b8', p: '#6a2f96', L: '#b98be0', K: '#3a1650', e: '#2a0f3a', r: '#e58fb0' };
  var HEART = ['.XX.XX.', 'XhXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  var HEART_C = { X: '#ff7fa8', h: '#ffd0de' };
  function sprite(rows, colors) {
    var c = document.createElement('canvas');
    c.width = rows[0].length; c.height = rows.length;
    var g = c.getContext('2d');
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) if (colors[row[x]]) { g.fillStyle = colors[row[x]]; g.fillRect(x, y, 1, 1); }
    });
    return c;
  }
  var eggSprite = sprite(EGG, EGG_C), heartSprite = sprite(HEART, HEART_C);
  try { document.documentElement.style.setProperty('--egg-url', 'url(' + eggSprite.toDataURL() + ')'); } catch (e) { /* no canvas export: the mark is simply absent */ }

  /* ======================================================================
     Page skeleton
     ====================================================================== */
  var app = document.getElementById('app');
  var els = {};
  var GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.6 7.6 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.6 7.6 0 0 0 2.6-1.5l2.3.9 2-3.4z"/></svg>';

  function buildPage() {
    els.bgScene = h('div', { class: 'bg-scene' });
    els.bgImg = h('div', { class: 'bg-img' });
    els.bgDim = h('div', { class: 'bg-dim' });
    els.fx = h('canvas', { class: 'bg-fx', 'aria-hidden': 'true' });
    els.title = h('h1', { class: 'title' });
    els.sub = h('p', { class: 'sub' });
    els.gear = h('button', { class: 'gear', type: 'button', id: 'qz-open', onclick: function () { togglePanel(true); } });
    els.gear.innerHTML = GEAR;
    els.name = h('h2', { class: 'hero-name' });
    els.kick = h('p', { class: 'hero-kick' });
    els.clock = h('div', { class: 'hero-clock', role: 'timer' });
    els.date = h('p', { class: 'hero-date' });
    els.note = h('p', { class: 'hero-note' });
    els.hero = h('section', { class: 'hero' }, [els.name, els.kick, els.clock, h('div', { class: 'hero-foot' }, [els.date, els.note])]);
    els.others = h('div', { class: 'others' });
    els.styles = h('nav', { class: 'styles' });
    els.panel = h('aside', { class: 'panel', id: 'qz-panel', 'aria-hidden': 'true' });
    els.scrim = h('div', { class: 'scrim', onclick: function () { togglePanel(false); } });
    app.appendChild(h('div', { class: 'bg', 'aria-hidden': 'true' }, [els.bgScene, els.bgImg, els.bgDim, els.fx]));
    app.appendChild(h('div', { class: 'page' }, [
      h('header', { class: 'top' }, [h('div', { class: 'brand' }, [h('span', { class: 'egg', 'aria-hidden': 'true' }), h('div', null, [els.title, els.sub])]), els.gear]),
      h('main', { class: 'stage' }, [els.hero, els.others, els.styles])
    ]));
    app.appendChild(els.scrim);
    app.appendChild(els.panel);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') togglePanel(false); });
  }

  /* ======================================================================
     Look: scene, image, card, text
     ====================================================================== */
  var loadedFonts = {}, lastImg = null;
  function ensureFont(g) {
    if (!g || loadedFonts[g]) return;
    loadedFonts[g] = 1;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + g + '&display=swap';
    document.head.appendChild(l);
  }
  function hexLum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 1;
    var n = parseInt(m[1], 16);
    return (.2126 * (n >> 16) + .7152 * (n >> 8 & 255) + .0722 * (n & 255)) / 255;
  }
  function applyLook() {
    var root = document.documentElement, rs = root.style, bg = state.bg, tx = state.text;
    var scene = SCENES[bg.scene];
    var hasImg = !!bg.image;

    els.bgScene.style.background = scene.css;
    if (bg.image !== lastImg) { els.bgImg.style.backgroundImage = hasImg ? 'url("' + bg.image + '")' : 'none'; lastImg = bg.image; }
    els.bgImg.style.opacity = hasImg ? bg.imgAlpha / 100 : 0;
    els.bgImg.style.backgroundSize = bg.fit === 'contain' ? 'contain' : 'cover';
    els.bgImg.style.filter = bg.blur > 0 ? 'blur(' + bg.blur + 'px)' : 'none';
    els.bgImg.style.transform = bg.blur > 0 && bg.fit !== 'contain' ? 'scale(1.06)' : 'none';
    els.bgDim.style.opacity = hasImg ? (bg.dim / 100) * (bg.imgAlpha / 100) : 0;

    /* What sits behind the words decides whether they are light or dark, unless he picked a colour himself. */
    var behind = scene.tone;
    if (hasImg && bg.imgAlpha >= 50) behind = (bg.imgLum == null ? .3 : bg.imgLum) * (1 - bg.dim / 100) > .62 ? 'light' : 'dark';
    var color = tx.color === 'light' ? '#f7f0ea' : tx.color === 'dark' ? '#2b1733' : tx.color === 'custom' ? tx.custom : (behind === 'light' ? '#2b1733' : '#f7f0ea');
    var tone = hexLum(color) > .5 ? 'dark' : 'light';
    root.setAttribute('data-tone', tone);
    fxTone = behind;
    rs.setProperty('--text', color);
    rs.setProperty('--accent', tx.accent);
    rs.setProperty('--on-accent', hexLum(tx.accent) > .5 ? '#17240f' : '#ffffff');
    var a = state.card.opacity / 100;
    rs.setProperty('--card-a', String(a));
    rs.setProperty('--line-a', String(Math.min(.18, .03 + a * .3)));
    rs.setProperty('--card-blur', state.card.blur + 'px');
    rs.setProperty('--radius', state.card.radius + 'px');
    rs.setProperty('--scale', String(tx.scale / 100));

    var font = FONTS[tx.font];
    ensureFont(font.g);
    rs.setProperty('--font-text', font.css);
    var nf = tx.numFont === 'auto' ? STYLE_NUM[state.style] : tx.numFont;
    if (nf === 'text' || !NUMFONTS[nf]) rs.setProperty('--font-num', font.css);
    else { ensureFont(NUMFONTS[nf].g); rs.setProperty('--font-num', NUMFONTS[nf].css); }

    root.lang = state.lang;
    fxStart(bg.fx);
  }

  /* ======================================================================
     Falling things
     ====================================================================== */
  var fx = { kind: null, parts: [], raf: 0, w: 0, h: 0, dpr: 1, last: 0 }, fxTone = 'dark';
  function fxSize() {
    var c = els.fx;
    fx.dpr = Math.min(window.devicePixelRatio || 1, 2);
    fx.w = c.clientWidth || window.innerWidth; fx.h = c.clientHeight || window.innerHeight;
    c.width = Math.round(fx.w * fx.dpr); c.height = Math.round(fx.h * fx.dpr);
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function fxPart(anywhere) {
    var k = fx.kind, p = { x: rnd(0, fx.w), ph: rnd(0, 6.28), sp: rnd(.5, 1.5) };
    if (k === 'stars') { p.y = rnd(0, fx.h); p.r = Math.random() < .15 ? 2 : 1; p.a = rnd(.25, .8); }
    else if (k === 'snow') { p.y = anywhere ? rnd(0, fx.h) : -10; p.r = rnd(1, 3.2); p.vy = rnd(18, 52); p.a = rnd(.45, .95); }
    else if (k === 'hearts') { p.y = anywhere ? rnd(0, fx.h) : fx.h + 20; p.r = Math.round(rnd(2, 4)); p.vy = -rnd(12, 30); p.a = rnd(.4, .85); }
    else { p.y = anywhere ? rnd(0, fx.h) : -50; p.r = Math.round(rnd(2, 3)); p.vy = rnd(14, 34); p.a = rnd(.55, .95); }
    return p;
  }
  function fxSeed() {
    var n = ({ stars: 90, snow: 70, hearts: 20, egg: 12 })[fx.kind] || 0;
    n = Math.round(n * Math.min(1.5, Math.max(.45, fx.w * fx.h / 800000)));
    fx.parts = [];
    for (var i = 0; i < n; i++) fx.parts.push(fxPart(true));
  }
  function fxDraw(ts, dt) {
    var g = els.fx.getContext('2d'), k = fx.kind, light = fxTone === 'light';
    g.setTransform(fx.dpr, 0, 0, fx.dpr, 0, 0);
    g.clearRect(0, 0, fx.w, fx.h);
    g.imageSmoothingEnabled = false;
    for (var i = 0; i < fx.parts.length; i++) {
      var p = fx.parts[i];
      if (k === 'stars') {
        g.globalAlpha = p.a * (.45 + .55 * (.5 + .5 * Math.sin(ts / 1000 * p.sp + p.ph)));
        g.fillStyle = light ? '#7a5a96' : '#ffffff';
        g.fillRect(Math.round(p.x), Math.round(p.y), p.r, p.r);
        continue;
      }
      p.y += p.vy * dt;
      var x = p.x + Math.sin(ts / 1000 * p.sp + p.ph) * 14;
      if (k === 'snow') {
        g.globalAlpha = p.a; g.fillStyle = light ? '#9aa9c0' : '#ffffff';
        g.beginPath(); g.arc(x, p.y, p.r, 0, 6.2832); g.fill();
        if (p.y > fx.h + 10) fx.parts[i] = fxPart(false);
      } else if (k === 'hearts') {
        g.globalAlpha = p.a; g.drawImage(heartSprite, Math.round(x), Math.round(p.y), 7 * p.r, 6 * p.r);
        if (p.y < -30) fx.parts[i] = fxPart(false);
      } else {
        g.globalAlpha = p.a;
        g.save(); g.translate(x, p.y); g.rotate(Math.sin(ts / 1000 * p.sp + p.ph) * .25);
        g.drawImage(eggSprite, -5.5 * p.r, -7 * p.r, 11 * p.r, 14 * p.r);
        g.restore();
        if (p.y > fx.h + 50) fx.parts[i] = fxPart(false);
      }
    }
    g.globalAlpha = 1;
  }
  function fxLoop(ts) {
    fx.raf = requestAnimationFrame(fxLoop);
    if (document.hidden) { fx.last = ts; return; }
    var dt = Math.min(.05, (ts - (fx.last || ts)) / 1000);
    fx.last = ts;
    fxDraw(ts, dt);
  }
  function fxStart(kind) {
    if (kind === fx.kind && fx.parts.length) return;
    cancelAnimationFrame(fx.raf);
    fx.kind = kind; fx.last = 0;
    fxSize(); fxSeed();
    if (!fx.parts.length) { els.fx.getContext('2d').clearRect(0, 0, els.fx.width, els.fx.height); return; }
    if (reduced) fxDraw(0, 0); else fx.raf = requestAnimationFrame(fxLoop);
  }
  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { var k = fx.kind; fx.kind = null; fxStart(k); }, 200);
  });

  /* ======================================================================
     Clock styles. Each builds itself into `root` and returns update(b, r).
     ====================================================================== */
  var RING_C = 2 * Math.PI * 44;
  var CLOCKS = {
    flip: function (root) {
      function unit(label) {
        var ghost = h('span', { class: 'ghost' }), top = h('span'), bot = h('span'), ft = h('span'), fb = h('span');
        var card = h('div', { class: 'flip' }, [ghost, h('div', { class: 'half top' }, top), h('div', { class: 'half bot' }, bot), h('div', { class: 'half flap flap-top' }, ft), h('div', { class: 'half flap flap-bot' }, fb)]);
        var cur = null, timer = 0;
        return {
          el: h('div', { class: 'flip-unit' }, [card, h('span', { class: 'u-label' }, label)]),
          set: function (v) {
            if (v === cur) return;
            var old = cur; cur = v; ghost.textContent = v;
            clearTimeout(timer);
            if (old === null || reduced || document.hidden) { top.textContent = bot.textContent = ft.textContent = fb.textContent = v; card.classList.remove('go'); return; }
            top.textContent = v; bot.textContent = old; ft.textContent = old; fb.textContent = v;
            card.classList.remove('go'); void card.offsetWidth; card.classList.add('go');
            timer = setTimeout(function () { bot.textContent = v; ft.textContent = v; card.classList.remove('go'); }, 620);
          }
        };
      }
      var u = [unit(t('d')), unit(t('h')), unit(t('m')), unit(t('s'))];
      root.appendChild(h('div', { class: 'flip-row' }, u.map(function (x) { return x.el; })));
      return function (b) { u[0].set(String(b.d)); u[1].set(pad2(b.h)); u[2].set(pad2(b.m)); u[3].set(pad2(b.s)); };
    },
    ring: function (root) {
      function ring(label) {
        var wrap = h('div', { class: 'ring' });
        wrap.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="44"/><circle class="arc" cx="50" cy="50" r="44" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + RING_C.toFixed(2) + '"/></svg>';
        var num = h('b'), arc = wrap.querySelector('.arc');
        wrap.appendChild(h('div', { class: 'ring-n' }, [num, h('span', null, label)]));
        return { el: wrap, set: function (txt, frac) { setText(num, txt); arc.setAttribute('stroke-dashoffset', (RING_C * (1 - Math.max(0, Math.min(1, frac)))).toFixed(2)); } };
      }
      var r4 = [ring(t('d')), ring(t('h')), ring(t('m')), ring(t('s'))];
      root.appendChild(h('div', { class: 'ring-row' }, r4.map(function (x) { return x.el; })));
      return function (b, r) {
        r4[0].set(String(b.d), r.mode === 'down' ? 1 - Math.min(b.d, 365) / 365 : (b.d % 365) / 365);
        r4[1].set(pad2(b.h), b.h / 24); r4[2].set(pad2(b.m), b.m / 60); r4[3].set(pad2(b.s), b.s / 60);
      };
    },
    big: function (root) {
      var d = h('b'), hh = h('b'), mm = h('b'), ss = h('b');
      root.appendChild(h('div', { class: 'big' }, [
        h('div', { class: 'big-d' }, [d, h('span', null, t('d'))]),
        h('div', { class: 'big-hms' }, [h('span', null, [hh, h('i', null, t('h'))]), h('span', null, [mm, h('i', null, t('m'))]), h('span', null, [ss, h('i', null, t('s'))])])
      ]));
      return function (b) { setText(d, String(b.d)); setText(hh, pad2(b.h)); setText(mm, pad2(b.m)); setText(ss, pad2(b.s)); };
    },
    pixel: function (root) {
      var d = h('b'), hh = h('b'), mm = h('b'), ss = h('b');
      function cell(n, label) { return h('div', { class: 'px-cell' }, [n, h('span', null, label)]); }
      root.appendChild(h('div', { class: 'px' }, [
        h('div', { class: 'px-hud' }, [h('span', null, '茄子萌'), h('span', { class: 'px-hearts', 'aria-hidden': 'true' }, '♥♥♥'), h('span', { class: 'px-egg', 'aria-hidden': 'true' })]),
        h('div', { class: 'px-row' }, [cell(d, t('d')), h('i', null, ':'), cell(hh, t('h')), h('i', null, ':'), cell(mm, t('m')), h('i', null, ':'), cell(ss, t('s'))])
      ]));
      return function (b) { var s = String(b.d); while (s.length < 3) s = '0' + s; setText(d, s); setText(hh, pad2(b.h)); setText(mm, pad2(b.m)); setText(ss, pad2(b.s)); };
    },
    line: function (root) {
      var keys = ['ld', 'lh', 'lm', 'ls'], nums = [], words = [];
      var p = h('p', { class: 'line' }, keys.map(function () {
        var n = h('b'), w = document.createTextNode('');
        nums.push(n); words.push(w);
        return h('span', null, [n, w]);
      }));
      root.appendChild(p);
      return function (b) {
        [b.d, b.h, b.m, b.s].forEach(function (v, i) { setText(nums[i], String(v)); var w = t(keys[i], null, v); if (words[i].nodeValue !== w) words[i].nodeValue = w; });
      };
    },
    total: function (root) {
      var odo = h('div', { class: 'odo', 'aria-hidden': 'true' }), sr = h('span', { class: 'sr' }), sub = h('p', { class: 'total-sub' });
      var strips = [], shape = '';
      root.appendChild(h('div', { class: 'total' }, [h('div', { class: 'total-main' }, [odo, sr, h('span', { class: 'total-u' }, t('totalUnit'))]), sub]));
      return function (b) {
        var str = fmtNum(b.T), sh = str.replace(/\d/g, '0');
        if (sh !== shape) {
          shape = sh; odo.textContent = ''; strips = [];
          for (var i = 0; i < str.length; i++) {
            if (/\d/.test(str[i])) {
              var strip = h('span', { class: 'odo-strip' }, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(function (n) { return h('span', null, n); }));
              strips.push(strip); odo.appendChild(h('span', { class: 'odo-d' }, strip));
            } else { strips.push(null); odo.appendChild(h('span', { class: 'odo-sep' }, str[i] === '\u202f' || str[i] === '\u00a0' ? '\u2009' : str[i])); }
          }
        }
        for (var j = 0; j < str.length; j++) if (strips[j]) strips[j].style.transform = 'translateY(-' + (+str[j] * 10) + '%)';
        setText(sr, str);
        setText(sub, fmtNum(Math.floor(b.T / 60)) + ' ' + t('tmin') + ' · ' + fmtNum(Math.floor(b.T / 3600)) + ' ' + t('thour') + ' · ' + (b.T / 86400).toFixed(1) + ' ' + t('tday'));
      };
    }
  };

  /* ======================================================================
     Render
     ====================================================================== */
  var clockUpdate = null, heroSig = '', lastSec = -1, otherRows = [];
  function sig(r) { return r ? r.mode + '|' + r.target : 'none'; }

  function renderHero() {
    var ev = mainEv(), now = Date.now(), r = resolve(ev, now);
    heroSig = sig(r);
    els.hero.setAttribute('data-style', state.style);
    setText(els.name, evName(ev));
    els.clock.textContent = '';
    if (!r) { setText(els.kick, ''); setText(els.date, ''); els.note.textContent = ''; els.note.removeAttribute('data-k'); clockUpdate = null; return; }
    setText(els.kick, t(r.mode));
    setText(els.date, dateLine(ev, r));
    clockUpdate = CLOCKS[state.style](els.clock);
    lastSec = -1; noteStamp = -1;
  }
  var noteStamp = -1;
  function renderNote(ev, r, now) {
    var stamp = Math.floor(now / 60000);
    if (stamp === noteStamp) return;
    noteStamp = stamp;
    var n = noteFor(ev, r, now), key = n ? n.dayN + '|' + n.next : '';
    if (els.note.getAttribute('data-k') === key) return;
    els.note.setAttribute('data-k', key);
    els.note.textContent = '';
    if (n) { els.note.appendChild(h('b', null, n.dayN)); els.note.appendChild(h('span', null, n.next)); }
  }
  function renderOthers() {
    els.others.textContent = ''; otherRows = [];
    state.events.forEach(function (ev) {
      if (ev.id === state.main) return;
      var kick = h('b'), time = document.createTextNode('');
      els.others.appendChild(h('button', { class: 'other', type: 'button', onclick: function () { change(function () { state.main = ev.id; }, 'events'); } }, [
        h('span', { class: 'o-name' }, evName(ev)), h('span', { class: 'o-time' }, [kick, time])
      ]));
      otherRows.push({ ev: ev, kick: kick, time: time });
    });
  }
  function renderChips() {
    els.styles.textContent = '';
    els.styles.setAttribute('aria-label', t('styleLabel'));
    els.styles.appendChild(h('span', { class: 'styles-label' }, t('styleLabel')));
    STYLE_IDS.forEach(function (id) {
      els.styles.appendChild(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(state.style === id), onclick: function () { change(function () { state.style = id; }, 'style'); } }, t('st_' + id)));
    });
  }
  function renderStatic() {
    setText(els.title, state.title != null && state.title !== '' ? state.title : t('title'));
    setText(els.sub, state.subtitle != null ? state.subtitle : t('sub'));
    els.gear.setAttribute('aria-label', t('settings'));
    renderHero(); renderOthers(); renderChips();
    lastSec = -1; tick();
  }

  function tick() {
    var now = Date.now(), sec = Math.floor(now / 1000);
    if (sec === lastSec) return;
    var ev = mainEv(), r = resolve(ev, now);
    if (sig(r) !== heroSig) renderHero();
    lastSec = sec;
    if (r && clockUpdate) { clockUpdate(breakdown(r, now), r); renderNote(ev, r, now); }
    otherRows.forEach(function (row) {
      var rr = resolve(row.ev, now);
      if (!rr) { setText(row.kick, ''); row.time.nodeValue = ''; return; }
      var b = breakdown(rr, now), s = b.d + ' ' + t('d') + ' ' + pad2(b.h) + ':' + pad2(b.m) + ':' + pad2(b.s);
      setText(row.kick, t(rr.mode));
      if (row.time.nodeValue !== s) row.time.nodeValue = s;
    });
  }

  /* ======================================================================
     Changing things
     ====================================================================== */
  function change(fn, scope) {
    fn();
    dirty = true; saveMsg = null;
    scheduleDraft();
    if (scope === 'look') applyLook();
    else if (scope === 'style') { applyLook(); renderHero(); renderChips(); syncPanel(); lastSec = -1; tick(); }
    else if (scope === 'lang') { applyLook(); renderStatic(); buildPanel(); }
    else if (scope === 'events') { renderStatic(); buildEvents(); }
    else { applyLook(); renderStatic(); }
    updateSaveUI();
  }

  /* ---------- background image: shrink it in the browser, keep it inside the page ---------- */
  function takeImage(file, onError) {
    if (!file) return;
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var out = null, lum = .3;
        [1920, 1440, 1080].some(function (max) {
          var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
          var c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
          var cg = c.getContext('2d');
          cg.fillStyle = '#1a0d22'; cg.fillRect(0, 0, c.width, c.height);
          cg.drawImage(img, 0, 0, c.width, c.height);
          return [.86, .74, .62].some(function (q) { out = c.toDataURL('image/jpeg', q); return out.length < 900000; });
        });
        var s = document.createElement('canvas'); s.width = s.height = 16;
        var sg = s.getContext('2d'); sg.drawImage(img, 0, 0, 16, 16);
        var px = sg.getImageData(0, 0, 16, 16).data, sum = 0;
        for (var i = 0; i < px.length; i += 4) sum += .2126 * px[i] + .7152 * px[i + 1] + .0722 * px[i + 2];
        lum = sum / (px.length / 4) / 255;
        URL.revokeObjectURL(url);
        change(function () { state.bg.image = out; state.bg.imgLum = lum; if (state.bg.imgAlpha < 20) state.bg.imgAlpha = 100; }, 'look');
        syncPanel();
      } catch (e) { URL.revokeObjectURL(url); onError(); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); onError(); };
    img.src = url;
  }

  /* ---------- saving to the page itself, so whoever opens the link sees the same thing ---------- */
  var cap = null, capState = 'pending', saving = false, saveMsg = null;
  function findCap() {
    if (sync || cap || capState === 'ro') return;
    var c = window.claude;
    if (!c || typeof c.use !== 'function') { if (capState === 'pending' && document.readyState === 'complete') { capState = 'none'; updateSaveUI(); } return; }
    Promise.resolve().then(function () { return c.use('artifact'); }).then(function (a) {
      cap = a && typeof a.publish === 'function' ? a : null; capState = cap ? 'ok' : 'none'; updateSaveUI();
    }, function () { capState = 'none'; updateSaveUI(); });
  }
  /* The page carries its own style and script inline, so a save rebuilds the whole page from that source plus the new data. */
  function shellHTML(s) {
    var json = JSON.stringify(s).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    var cssEl = document.getElementById('qz-css'), jsEl = document.getElementById('qz-app');
    var css = cssEl ? cssEl.textContent.replace(/<\/style/gi, '<\\/style') : '';
    var js = jsEl ? jsEl.textContent : '';
    var SC = '</scr' + 'ipt>';
    return '<!DOCTYPE html>\n<html lang="' + s.lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>茄子萌的小世界</title>\n' +
      (css ? '<style id="qz-css">' + css + '</style>\n' : '<link rel="stylesheet" href="app.css">\n') +
      '</head>\n<body>\n<div id="app"></div>\n<script type="application/json" id="qz-data">' + json + SC + '\n' +
      (js ? '<script id="qz-app">' + js + SC : '<script src="app.js">' + SC) + '\n</body>\n</html>\n';
  }
  function save() {
    if (sync) { syncSave(); return; }
    if (!cap || saving) return;
    saving = true; saveMsg = null; updateSaveUI();
    clearTimeout(draftTimer);
    var next = clone(state);
    next.rev = Date.now();
    /* After a save the page reloads on the new version; this draft matches it, so nothing flickers back. */
    try { localStorage.setItem(KEY, JSON.stringify({ baseRev: next.rev, dirty: false, state: next })); } catch (e) { dropDraft(); }
    cap.publish(shellHTML(next)).then(function () {
      published = next; state.rev = next.rev; dirty = false; saving = false; saveMsg = { kind: 'ok', key: 'saved' };
      updateSaveUI();
    }, function (err) {
      var code = err && err.code;
      saving = false;
      if (code === 'conflict') return;
      dirty = true; writeDraft();
      if (code === 'not_writer' || code === 'not_granted' || code === 'not_declared' || code === 'capability_disabled' || code === 'capability_removed' || code === 'consent_required') capState = 'ro';
      else saveMsg = { kind: 'warn', key: code === 'too_large' ? 'tooLarge' : 'saveFail' };
      updateSaveUI();
    });
  }

  /* ---------- live sync through Firestore, when the site is hosted with a Firebase config ---------- */
  var sync = null, remoteImg = { image: null, lum: null }, lastSavedRev = null;
  function withoutImage(x) { var c = clone(x); c.bg.image = null; c.bg.imgLum = null; return c; }
  function adoptRemote() {
    if (dirty || saving) { saveMsg = { kind: 'warn', key: 'remoteNew' }; updateSaveUI(); return; }
    state = clone(published);
    applyLook(); renderStatic(); buildPanel();
  }
  function initSync() {
    var cfg = window.QZ_FIREBASE, fb = window.firebase;
    if (!cfg || !cfg.projectId || !fb || typeof fb.initializeApp !== 'function') return;
    try {
      var fapp = fb.apps && fb.apps.length ? fb.app() : fb.initializeApp(cfg);
      var db = fb.firestore(fapp), id = cfg.pageId || 'xiaoqiezi';
      sync = { main: db.collection('pages').doc(id), bg: db.collection('pages').doc(id + '_bg') };
    } catch (e) { sync = null; return; }
    capState = 'ok';
    sync.main.onSnapshot(function (snap) {
      if (!snap.exists || (snap.metadata && snap.metadata.hasPendingWrites)) return;
      var d = snap.data() || {}, s;
      try { s = normalize(JSON.parse(d.state)); } catch (e) { return; }
      s.bg.image = remoteImg.image; s.bg.imgLum = remoteImg.lum;
      if (s.rev === lastSavedRev || s.rev === published.rev) { published = s; return; }
      published = s;
      adoptRemote();
    }, function () { /* offline or blocked: keep what is on screen */ });
    sync.bg.onSnapshot(function (snap) {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      var d = snap.exists ? (snap.data() || {}) : {};
      var img = typeof d.image === 'string' && d.image ? d.image : null, lum = typeof d.lum === 'number' ? d.lum : null;
      if (img === remoteImg.image) return;
      remoteImg = { image: img, lum: lum };
      published.bg.image = img; published.bg.imgLum = lum;
      if (!dirty && !saving) { state.bg.image = img; state.bg.imgLum = lum; applyLook(); syncPanel(); }
    }, function () {});
    updateSaveUI();
  }
  function syncSave() {
    if (saving) return;
    saving = true; saveMsg = null; updateSaveUI();
    var next = clone(state);
    next.rev = Date.now(); lastSavedRev = next.rev;
    var jobs = [sync.main.set({ state: JSON.stringify(withoutImage(next)), rev: next.rev })];
    var img = next.bg.image || null;
    if (img !== remoteImg.image) jobs.push(sync.bg.set({ image: img, lum: img ? next.bg.imgLum : null }));
    Promise.all(jobs).then(function () {
      remoteImg = { image: img, lum: img ? next.bg.imgLum : null };
      published = next; state.rev = next.rev; dirty = false; saving = false; saveMsg = { kind: 'ok', key: 'saved' };
      writeDraft(); updateSaveUI();
    }, function () {
      saving = false; saveMsg = { kind: 'warn', key: 'saveFail' }; updateSaveUI();
    });
  }

  var canDownload = (function () { try { return window.top === window.self && !!document.getElementById('qz-app'); } catch (e) { return false; } })();
  function download() {
    var next = clone(state);
    next.rev = Date.now();
    var name = (state.title != null && state.title !== '' ? state.title : I18N['zh-CN'].title).replace(/[\\\/:*?"<>|]/g, '').trim() || 'page';
    try {
      var url = URL.createObjectURL(new Blob([shellHTML(next)], { type: 'text/html' }));
      var a = h('a', { href: url, download: name + '.html', hidden: true });
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
      saveMsg = { kind: 'ok', key: 'downloaded' };
    } catch (e) { saveMsg = { kind: 'warn', key: 'saveFail' }; }
    updateSaveUI();
  }

  /* ======================================================================
     Settings panel
     ====================================================================== */
  var pan = {}, syncers = [], openEv = null, askReset = false;
  function togglePanel(on) {
    app.classList.toggle('is-open', on);
    els.panel.setAttribute('aria-hidden', String(!on));
    if (on) { findCap(); if (pan.close) pan.close.focus(); } else if (document.activeElement && els.panel.contains(document.activeElement)) els.gear.focus();
  }
  function syncPanel() { syncers.forEach(function (f) { f(); }); }

  function fRange(id, label, min, max, step, get, set, unit) {
    var out = h('output', { for: id });
    var input = h('input', { type: 'range', id: id, min: min, max: max, step: step, oninput: function () { var v = +input.value; change(function () { set(v); }, 'look'); out.textContent = v + unit; } });
    syncers.push(function () { input.value = get(); out.textContent = get() + unit; });
    return h('div', { class: 'field' }, [h('label', { for: id }, [label, out]), input]);
  }
  function fSelect(id, label, options, get, set, scope) {
    var sel = h('select', { id: id, onchange: function () { var v = sel.value; change(function () { set(v); }, scope || 'look'); } }, options.map(function (o) { return h('option', { value: o[0] }, o[1]); }));
    syncers.push(function () { sel.value = get(); });
    return h('div', { class: 'field' }, [h('label', { for: id }, label), sel]);
  }
  function fOpts(label, cls, options, get, set, scope) {
    var btns = options.map(function (o) {
      return h('button', { class: 'opt' + (o[2] ? ' swatch' : ''), type: 'button', 'data-v': o[0], onclick: function () { change(function () { set(o[0]); }, scope || 'look'); syncPanel(); } },
        o[2] ? [h('i', { style: 'background:' + o[2] }), o[1]] : o[1]);
    });
    syncers.push(function () { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === get())); }); });
    return h('div', { class: 'field' }, [label ? h('span', { class: 'lab' }, label) : null, h('div', { class: 'opts ' + cls, role: 'group', 'aria-label': label || '' }, btns)]);
  }
  function fText(id, label, get, set, placeholder) {
    var input = h('input', { type: 'text', id: id, placeholder: placeholder, autocomplete: 'off', oninput: function () { var v = input.value; change(function () { set(v); }, 'text'); } });
    syncers.push(function () { if (document.activeElement !== input) input.value = get(); });
    return h('div', { class: 'field' }, [h('label', { for: id }, label), input]);
  }
  function sec(title, kids) { return h('section', { class: 'p-sec' }, [h('h3', null, title)].concat(kids)); }

  function buildEvents() {
    var box = pan.events;
    if (!box) return;
    box.textContent = '';
    state.events.forEach(function (ev, i) {
      var pid = 'qz-ev' + i, sumName = h('span', { class: 'ev-sum-name' }, evName(ev));
      var nameIn = h('input', { type: 'text', id: pid + '-name', value: evName(ev), autocomplete: 'off', oninput: function () { change(function () { ev.name = nameIn.value === '' ? null : nameIn.value; }, 'text'); setText(sumName, evName(ev)); } });
      var dateIn = h('input', { type: 'date', id: pid + '-date', value: ev.date, oninput: function () { if (dateIn.value) change(function () { ev.date = dateIn.value; }, 'text'); } });
      var timeIn = h('input', { type: 'time', id: pid + '-time', value: ev.time, oninput: function () { change(function () { ev.time = timeIn.value || '00:00'; }, 'text'); } });
      var tzSel = h('select', { id: pid + '-tz', onchange: function () { change(function () { ev.tz = tzSel.value; }, 'text'); } }, TZS.map(function (z) { return h('option', { value: z[0] }, t(z[1])); }));
      tzSel.value = ev.tz;
      var rep = h('input', { type: 'checkbox', id: pid + '-rep', onchange: function () { change(function () { ev.repeat = rep.checked; }, 'text'); } });
      rep.checked = !!ev.repeat;
      var det = h('details', { class: 'ev' }, [
        h('summary', null, [sumName, ev.id === state.main ? h('span', { class: 'tag' }, t('isMain')) : null]),
        h('div', { class: 'ev-body' }, [
          h('div', { class: 'field' }, [h('label', { for: pid + '-name' }, t('name')), nameIn]),
          h('div', { class: 'row2' }, [h('div', { class: 'field' }, [h('label', { for: pid + '-date' }, t('date')), dateIn]), h('div', { class: 'field' }, [h('label', { for: pid + '-time' }, t('time')), timeIn])]),
          h('div', { class: 'field' }, [h('label', { for: pid + '-tz' }, t('tz')), tzSel]),
          h('label', { class: 'check', for: pid + '-rep' }, [rep, t('repeat')]),
          h('div', { class: 'ev-actions' }, [
            ev.id !== state.main ? h('button', { class: 'btn btn-small', type: 'button', onclick: function () { openEv = ev.id; change(function () { state.main = ev.id; }, 'events'); } }, t('setMain')) : null,
            state.events.length > 1 ? h('button', { class: 'btn btn-small btn-ghost btn-danger', type: 'button', onclick: function () { change(function () { state.events.splice(state.events.indexOf(ev), 1); if (state.main === ev.id) state.main = state.events[0].id; }, 'events'); } }, t('del')) : null
          ])
        ])
      ]);
      det.open = openEv === ev.id;
      det.addEventListener('toggle', function () { if (det.open) openEv = ev.id; else if (openEv === ev.id) openEv = null; });
      box.appendChild(det);
    });
    box.appendChild(h('button', { class: 'btn btn-small', type: 'button', onclick: function () {
      var id = 'e' + Date.now().toString(36), td = partsIn('local', Date.now() + 30 * 86400000);
      openEv = id;
      change(function () { state.events.push({ id: id, name: null, date: td.y + '-' + pad2(td.m) + '-' + pad2(td.d), time: '00:00', tz: 'local', repeat: false }); }, 'events');
    } }, '+ ' + t('add')));
  }

  function buildPanel() {
    var scroll = pan.body ? pan.body.scrollTop : 0;
    syncers = []; pan = {};
    els.panel.textContent = '';
    els.panel.setAttribute('aria-label', t('settings'));

    pan.close = h('button', { class: 'btn btn-small', type: 'button', onclick: function () { togglePanel(false); } }, t('done'));
    var head = h('div', { class: 'p-head' }, [h('h2', null, t('settings')), pan.close]);

    /* background image controls */
    var file = h('input', { type: 'file', id: 'qz-file', accept: 'image/*', class: 'sr', tabindex: '-1', onchange: function () { imgErr.textContent = ''; takeImage(file.files && file.files[0], function () { imgErr.textContent = t('imgFail'); }); file.value = ''; } });
    var thumb = h('span', { class: 'thumb', 'aria-hidden': 'true' });
    var upBtn = h('button', { class: 'btn btn-small', type: 'button', onclick: function () { file.click(); } });
    var rmBtn = h('button', { class: 'btn btn-small btn-ghost btn-danger', type: 'button', onclick: function () { change(function () { state.bg.image = null; state.bg.imgLum = null; }, 'look'); syncPanel(); } }, t('remove'));
    var imgErr = h('p', { class: 'p-msg', 'data-kind': 'warn', role: 'status' });
    var imgOnly = h('div', { class: 'p-sec' }, [
      fRange('qz-img-a', t('imgOpacity'), 0, 100, 1, function () { return 100 - state.bg.imgAlpha; }, function (v) { state.bg.imgAlpha = 100 - v; }, '%'),
      fRange('qz-img-blur', t('blur'), 0, 24, 1, function () { return state.bg.blur; }, function (v) { state.bg.blur = v; }, 'px'),
      fRange('qz-img-dim', t('dim'), 0, 85, 1, function () { return state.bg.dim; }, function (v) { state.bg.dim = v; }, '%'),
      fOpts(t('fit'), 'two', [['cover', t('fit_cover')], ['contain', t('fit_contain')]], function () { return state.bg.fit; }, function (v) { state.bg.fit = v; })
    ]);
    syncers.push(function () {
      var has = !!state.bg.image;
      thumb.style.backgroundImage = has ? 'url("' + state.bg.image + '")' : 'none';
      thumb.hidden = !has; rmBtn.hidden = !has; imgOnly.hidden = !has;
      upBtn.textContent = has ? t('change') : t('upload');
    });

    var custom = h('input', { type: 'color', id: 'qz-text-custom', 'aria-label': t('c_custom'), oninput: function () { var v = custom.value; change(function () { state.text.custom = v; state.text.color = 'custom'; }, 'look'); syncPanel(); } });
    syncers.push(function () { custom.value = state.text.custom; });
    var accent = h('input', { type: 'color', id: 'qz-accent', oninput: function () { var v = accent.value; change(function () { state.text.accent = v; }, 'look'); } });
    syncers.push(function () { accent.value = state.text.accent; });
    var colorField = fOpts(t('color'), 'four', [['auto', t('c_auto')], ['light', t('c_light')], ['dark', t('c_dark')], ['custom', t('c_custom')]], function () { return state.text.color; }, function (v) { state.text.color = v; });
    colorField.appendChild(custom);

    pan.events = h('div', { class: 'p-sec' });
    pan.body = h('div', { class: 'p-body' }, [
      sec(t('sec_style'), [
        fOpts('', '', STYLE_IDS.map(function (id) { return [id, t('st_' + id)]; }), function () { return state.style; }, function (v) { state.style = v; }, 'style')
      ]),
      sec(t('sec_bg'), [
        fOpts(t('scene'), '', Object.keys(SCENES).map(function (k) { return [k, t('sc_' + k), SCENES[k].css]; }), function () { return state.bg.scene; }, function (v) { state.bg.scene = v; }),
        h('div', { class: 'img-row' }, [thumb, upBtn, rmBtn, file]), imgErr, imgOnly,
        fSelect('qz-fx', t('fx'), [['none', t('fx_none')], ['stars', t('fx_stars')], ['snow', t('fx_snow')], ['hearts', t('fx_hearts')], ['egg', t('fx_egg')]], function () { return state.bg.fx; }, function (v) { state.bg.fx = v; })
      ]),
      sec(t('sec_card'), [
        fRange('qz-card-a', t('cardOpacity'), 0, 100, 1, function () { return 100 - state.card.opacity; }, function (v) { state.card.opacity = 100 - v; }, '%'),
        fRange('qz-card-blur', t('cardBlur'), 0, 40, 1, function () { return state.card.blur; }, function (v) { state.card.blur = v; }, 'px'),
        fRange('qz-card-r', t('radius'), 0, 48, 1, function () { return state.card.radius; }, function (v) { state.card.radius = v; }, 'px')
      ]),
      sec(t('sec_text'), [
        fSelect('qz-font', t('font'), ['serif', 'sans', 'system', 'kuaile', 'xiaowei', 'mashan', 'longcang'].map(function (k) { return [k, t('f_' + k)]; }), function () { return state.text.font; }, function (v) { state.text.font = v; }),
        fSelect('qz-numfont', t('numFont'), [['auto', t('nf_auto')], ['text', t('nf_text')]].concat(Object.keys(NUMFONTS).map(function (k) { return [k, NUMFONTS[k].label]; })), function () { return state.text.numFont; }, function (v) { state.text.numFont = v; }),
        fRange('qz-scale', t('scale'), 70, 140, 5, function () { return state.text.scale; }, function (v) { state.text.scale = v; }, '%'),
        colorField,
        h('div', { class: 'field' }, [h('label', { for: 'qz-accent' }, t('accent')), accent])
      ]),
      sec(t('sec_lang'), [
        fSelect('qz-lang', t('sec_lang'), LANGS, function () { return state.lang; }, function (v) { state.lang = v; }, 'lang')
      ]),
      sec(t('sec_events'), [pan.events]),
      sec(t('sec_title'), [
        fText('qz-title', t('titleLabel'), function () { return state.title != null ? state.title : t('title'); }, function (v) { state.title = v === '' ? null : v; }, t('title')),
        fText('qz-sub', t('subLabel'), function () { return state.subtitle != null ? state.subtitle : t('sub'); }, function (v) { state.subtitle = v; }, t('sub'))
      ])
    ]);

    pan.msg = h('p', { class: 'p-msg', role: 'status' });
    pan.save = h('button', { class: 'btn btn-primary', type: 'button', onclick: function () { if (capState === 'ok') save(); else if (canDownload) download(); } }, t('save'));
    pan.reset = h('button', { class: 'btn btn-ghost', type: 'button', onclick: function () { askReset = true; updateSaveUI(); } }, t('reset'));
    pan.actions = h('div', { class: 'p-actions' }, [pan.reset, pan.save]);
    pan.confirm = h('div', { class: 'confirm' }, [
      h('span', null, t('resetAsk')),
      h('div', { class: 'p-actions' }, [
        h('button', { class: 'btn btn-small', type: 'button', onclick: function () { askReset = false; updateSaveUI(); } }, t('cancel')),
        h('button', { class: 'btn btn-small btn-danger', type: 'button', onclick: function () {
          askReset = false; openEv = null;
          var rev = state.rev, lang = state.lang;
          state = normalize({ rev: rev, lang: lang });
          change(function () {}, 'lang');
        } }, t('confirm'))
      ])
    ]);
    els.panel.appendChild(head);
    els.panel.appendChild(pan.body);
    els.panel.appendChild(h('div', { class: 'p-foot' }, [pan.msg, pan.confirm, pan.actions]));
    buildEvents();
    syncPanel();
    updateSaveUI();
    pan.body.scrollTop = scroll;
  }

  function updateSaveUI() {
    els.gear.setAttribute('data-dirty', dirty && capState === 'ok' ? '1' : '0');
    if (!pan.msg) return;
    var canSave = capState === 'ok', dl = !canSave && canDownload;
    pan.save.hidden = !canSave && !dl;
    pan.save.disabled = saving || (canSave && !dirty);
    pan.save.textContent = dl ? t('download') : saving ? t('saving') : t('save');
    pan.confirm.hidden = !askReset;
    pan.actions.hidden = askReset;
    var kind = '', msg = '';
    if (saveMsg) { kind = saveMsg.kind; msg = t(saveMsg.key); }
    else if (dl) msg = t('dlHint');
    else if (capState === 'ro') msg = t('readOnly');
    else if (capState === 'none') msg = t('localOnly');
    else if (canSave) { msg = dirty ? t('unsaved') + ' ' + t('saveHint') : t('saved'); kind = dirty ? 'warn' : 'ok'; }
    pan.msg.setAttribute('data-kind', kind);
    setText(pan.msg, msg);
  }

  /* ======================================================================
     Go
     ====================================================================== */
  buildPage();
  applyLook();
  renderStatic();
  buildPanel();
  initSync();
  setInterval(tick, 200);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { lastSec = -1; tick(); } });
  findCap();
  window.addEventListener('load', findCap);
  setTimeout(findCap, 1500);

})();
