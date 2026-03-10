/** Sample post #2 — Vestibulum ante (2025). */

export const id = "vestibulum-ante";
/** Available language versions generated from this page. */
export const lang = ["en", "fr", "zh-hans", "zh-hant"] as const;

/** English post title. */
export const title = "Vestibulum Ante: On Thresholds and New Beginnings";
/** Publication date. */
export const date = new Date("2025-09-04");
/** Post meta description. */
export const description =
  "Reflections on transitions, the in-between spaces of life, and what it means to stand at a threshold.";
/** Post tags. */
export const tags = ["life", "essay"];

/** French-only metadata overrides used by the multilanguage plugin. */
export const fr = {
  title: "Vestibulum Ante\u00a0: sur les seuils et les nouveaux départs",
  description:
    "Réflexions sur les transitions, les espaces intermédiaires de la vie et ce que signifie se tenir sur un seuil.",
} as const;

/** Simplified Chinese metadata overrides used by the multilanguage plugin. */
export const zhHans = {
  title: "Vestibulum Ante：关于门槛与新的开始",
  description: "关于过渡、人生中的中间地带，以及站在门槛上的意义。",
} as const;

/** Traditional Chinese metadata overrides used by the multilanguage plugin. */
export const zhHant = {
  title: "Vestibulum Ante：關於門檻與新的開始",
  description: "關於過渡、人生中的中間地帶，以及站在門檻上的意義。",
} as const;

/** Renders the post body. */
export default (data: Lume.Data, _helpers: Lume.Helpers): string => {
  if (data.lang === "fr") {
    return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. Le mot latin <em>vestibulum</em> — une antichambre, une entrée,
  l’espace devant la porte — porte un poids que son descendant français
  «&nbsp;vestibule&nbsp;» ne restitue pas toujours.
</p>

<p>
  Un seuil n’est ni une fin, ni un commencement. C’est l’espace liminal entre
  les deux&nbsp;: le souffle retenu avant le premier mot, la pause après le tour de
  clé. C’est l’endroit où quelque chose s’achève et où autre chose n’a pas
  encore commencé.
</p>

<h2>La valeur de l’entre-deux</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. Nous vivons dans une culture qui dévalue la transition.
  Nous voulons des résultats, des livrables, l’objet fini. Le milieu brouillon,
  les brouillons successifs, le doute, l’accumulation lente de compréhension,
  tout cela reste peu documenté et rarement célébré.
</p>

<p>
  Pourtant, l’entre-deux est l’endroit où se déroule l’essentiel de la vie.
  Les trajets. Les salles d’attente. Le temps entre l’envoi d’un message et la
  lecture de la réponse. Les années entre le moment où l’on sait ce que l’on
  veut et celui où l’on sait comment l’obtenir.
</p>

<h2>Se tenir sur le pas de la porte</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  J’ai déménagé à Chengdu un mardi du début d’automne. La ville était chaude
  d’une manière qui m’a surpris, non pas la chaleur de l’été, mais la chaleur
  d’un lieu qui avait déjà décidé qu’il vous appréciait. Les rues sentaient
  l’huile pimentée et l’osmanthe, et tout semblait légèrement,
  agréablement familier et nouveau à la fois.
</p>

<p>
  C’est cela, un seuil, je crois. Ni hostile, ni accueillant. Simplement ouvert,
  en attente de ce que vous en ferez.
</p>

<h2>Coda</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  Chaque texte possède son vestibule, la page de titre, l’introduction,
  le premier paragraphe. C’est l’espace qui prépare la lectrice ou le lecteur
  à ce qui vient ensuite. Il faut l’écrire avec soin.
</p>`;
  }

  if (data.lang === "zh-hans") {
    return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. 拉丁词 <em>vestibulum</em> 指前庭、入口、门前空间，
  它的语义重量远比现代“门厅”这个词听上去更深。
</p>

<p>
  门槛既不是结束，也不是开始。它是两者之间的临界地带：开口前屏住的一口气，
  钥匙拧动后那一瞬停顿。它是“旧的已结束，而新的尚未开始”的位置。
</p>

<h2>中间地带的价值</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. 我们生活在一个低估“过渡期”的文化里。
  我们追求结果、产出和成品。那些混乱的中段、反复草稿、犹疑时刻和缓慢积累的理解，
  往往既不被记录，也不被庆祝。
</p>

<p>
  但人生大部分时间都发生在中间地带。通勤路上，候诊室里，
  发送一条消息到收到回复之间，
  以及“知道自己想要什么”到“知道如何得到它”之间的那些年。
</p>

<h2>站在门口</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  我在初秋的一个星期二搬到成都。这座城市的“温暖”让我意外，
  不是夏天的热，而是一种“它已经决定要喜欢你”的温度。
  街道闻起来是辣椒油和桂花的味道，一切都同时有一点陌生，也有一点亲切。
</p>

<p>
  我想，这就是门槛的感觉。它既不敌对，也不主动欢迎。
  它只是敞开着，等你决定要把它变成什么。
</p>

<h2>尾声</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  每篇文本都有自己的“前厅”：标题页、引言、第一段。
  这个空间负责让读者为接下来的内容做好准备。它值得被认真写好。
</p>`;
  }

  if (data.lang === "zh-hant") {
    return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. 拉丁詞 <em>vestibulum</em> 指前庭、入口、門前空間，
  它的語義重量遠比現代「門廳」一詞聽起來更深。
</p>

<p>
  門檻既不是結束，也不是開始。它是兩者之間的臨界地帶：開口前屏住的一口氣，
  鑰匙轉動後那一瞬停頓。它是「舊的已結束，而新的尚未開始」的位置。
</p>

<h2>中間地帶的價值</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. 我們生活在一個低估「過渡期」的文化裡。
  我們追求結果、產出與成品。那些混亂的中段、反覆草稿、猶疑時刻與緩慢累積的理解，
  往往既不被記錄，也不被慶祝。
</p>

<p>
  但人生大部分時間都發生在中間地帶。通勤路上、候診室裡，
  傳送一則訊息到收到回覆之間，
  以及「知道自己想要什麼」到「知道如何得到它」之間的那些年。
</p>

<h2>站在門口</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  我在初秋的一個星期二搬到成都。這座城市的「溫暖」讓我意外，
  不是夏天的熱，而是一種「它已經決定要喜歡你」的溫度。
  街道聞起來是辣椒油與桂花的味道，一切都同時有一點陌生，也有一點親切。
</p>

<p>
  我想，這就是門檻的感覺。它既不敵對，也不主動歡迎。
  它只是敞開著，等你決定要把它變成什麼。
</p>

<h2>尾聲</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  每篇文本都有自己的「前廳」：標題頁、引言、第一段。
  這個空間負責讓讀者為接下來的內容做好準備。它值得被認真寫好。
</p>`;
  }

  return `<p>
  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
  cubilia curae. The Latin word <em>vestibulum</em> — a forecourt, an entrance
  hall, the space before the door — carries more weight than its English
  descendant "vestibule" suggests.
</p>

<p>
  A threshold is not an end, nor a beginning. It is the liminal space between
  the two: the breath held before the first word, the pause after a key turns
  in a lock. It is where one thing stops and another has not yet started.
</p>

<h2>The value of the in-between</h2>

<p>
  Pellentesque habitant morbi tristique senectus et netus et malesuada fames
  ac turpis egestas. We live in a culture that devalues transition. We want
  results, outcomes, the finished thing. The messy middle — the drafts, the
  doubt, the slow accumulation of understanding — goes undocumented and
  uncelebrated.
</p>

<p>
  But the in-between is where most of life happens. Commutes. Waiting rooms.
  The gap between sending a message and reading the reply. The years between
  knowing what you want and knowing how to get there.
</p>

<h2>Standing at the door</h2>

<p>
  Fusce suscipit varius mi. Cum sociis natoque penatibus et magnis dis
  parturient montes, nascetur ridiculus mus. Phasellus viverra nulla ut metus
  varius laoreet.
</p>

<p>
  I moved to Chengdu on a Tuesday in early autumn. The city was warm in a way
  that surprised me — not the heat of summer, but the warmth of a place that
  had already decided it liked you. The streets smelled of chilli oil and
  osmanthus, and everything felt slightly, pleasantly unfamiliar.
</p>

<p>
  That is what a threshold feels like, I think. Not hostile. Not welcoming.
  Simply open — waiting to see what you will make of it.
</p>

<h2>Coda</h2>

<p>
  Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
  condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum,
  elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus
  lacus enim ac dui.
</p>

<p>
  Every document has a vestibulum — the title page, the introduction, the first
  paragraph. It is the space that prepares the reader for what follows. Write
  it with care.
</p>`;
};
